import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, isAbsolute, join, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url))
const temporaryRoot = mkdtempSync(join(tmpdir(), 'revo-admin-package-'))
const environment = {
  ...process.env,
  NO_COLOR: '1',
  npm_config_cache: join(temporaryRoot, 'npm-cache'),
  npm_config_loglevel: 'silent',
}

const run = (command, arguments_, cwd = repositoryRoot) => {
  try {
    return execFileSync(command, arguments_, {
      cwd,
      encoding: 'utf8',
      env: environment,
      stdio: ['ignore', 'pipe', 'pipe'],
    })
  } catch (error) {
    const stdout = error && typeof error === 'object' && 'stdout' in error ? String(error.stdout) : ''
    const stderr = error && typeof error === 'object' && 'stderr' in error ? String(error.stderr) : ''
    throw new Error(`${command} ${arguments_.join(' ')} failed\n${stdout}${stderr}`, { cause: error })
  }
}

const sha256 = (path) => createHash('sha256').update(readFileSync(path)).digest('hex')

const soleTarball = (directory) => {
  const tarballs = readdirSync(directory)
    .filter((name) => name.endsWith('.tgz'))
    .map((name) => join(directory, name))

  assert.equal(tarballs.length, 1, `Expected exactly one tarball in ${directory}.`)
  return tarballs[0]
}

const pack = (directory, options = []) => {
  mkdirSync(directory)
  const output = run('npm', ['pack', '--json', '--pack-destination', directory, ...options])
  const jsonStart = output.lastIndexOf('\n[')
  const result = JSON.parse(jsonStart >= 0 ? output.slice(jsonStart + 1) : output)
  assert.ok(Array.isArray(result) && result.length === 1, 'npm pack did not describe exactly one tarball.')
  assert.equal(typeof result[0]?.filename, 'string')
  assert.equal(typeof result[0]?.size, 'number')
  assert.equal(typeof result[0]?.unpackedSize, 'number')
  return { metadata: result[0], tarball: soleTarball(directory) }
}

const tarballFiles = (tarball) =>
  run('tar', ['-tzf', tarball])
    .trim()
    .split(/\r?\n/u)
    .filter((path) => path.length > 0 && !path.endsWith('/'))
    .sort()

const assertInventory = (files) => {
  const requiredFiles = [
    'package/LICENSE',
    'package/README.md',
    'package/build/client/index.html',
    'package/package.json',
    'package/runtime/index.d.ts',
    'package/runtime/index.js',
  ]

  for (const requiredFile of requiredFiles) {
    assert.ok(files.includes(requiredFile), `Tarball is missing ${requiredFile}.`)
  }

  assert.ok(
    files.some((path) => /^package\/build\/client\/assets\/.+/u.test(path)),
    'Tarball has no built client assets.',
  )

  for (const path of files) {
    const allowed = requiredFiles.includes(path) || /^package\/build\/client\/assets\/.+/u.test(path)
    assert.ok(allowed, `Tarball contains a forbidden file: ${path}.`)
    assert.doesNotMatch(path, /^package\/(?:src|tests?|coverage|node_modules|build\/server)(?:\/|$)/u)
    assert.doesNotMatch(path, /^package\/\.env(?:[./]|$)/u)
    assert.doesNotMatch(path, /^package\/scripts(?:\/|$)/u)
  }
}

const consumerSource = `
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { createReadStream, existsSync, readFileSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { once } from 'node:events'
import { isAbsolute, resolve, sep } from 'node:path'
import { getRevoAdminClientDirectory } from '@revisium/revo-admin/runtime'

const clientDirectory = getRevoAdminClientDirectory()
assert.ok(isAbsolute(clientDirectory), 'Runtime contract did not return an absolute path.')
assert.ok(existsSync(resolve(clientDirectory, 'index.html')), 'Installed client index is missing.')

const indexHtml = readFileSync(resolve(clientDirectory, 'index.html'), 'utf8')
const assetPaths = [...indexHtml.matchAll(/(?:src|href)=["']([^"']+)["']/gu)]
  .map((match) => match[1])
  .filter((path) => path.startsWith('/assets/'))
assert.ok(assetPaths.length > 0, 'Built index does not reference a client asset.')
for (const assetPath of assetPaths) {
  assert.ok(existsSync(resolve(clientDirectory, assetPath.slice(1))), \`Missing referenced asset: \${assetPath}.\`)
}

const server = createServer((request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
  const target = pathname.startsWith('/assets/')
    ? resolve(clientDirectory, pathname.slice(1))
    : resolve(clientDirectory, 'index.html')
  const clientRoot = resolve(clientDirectory)

  if (target !== resolve(clientRoot, 'index.html') && !target.startsWith(\`\${clientRoot}\${sep}\`)) {
    response.writeHead(404).end()
    return
  }

  if (!existsSync(target) || !statSync(target).isFile()) {
    response.writeHead(404).end()
    return
  }

  response.writeHead(200)
  createReadStream(target).pipe(response)
})

server.listen(0, '127.0.0.1')
await once(server, 'listening')

try {
  const address = server.address()
  assert.ok(address && typeof address === 'object')
  const origin = \`http://127.0.0.1:\${address.port}\`
  const rootResponse = await fetch(\`\${origin}/\`)
  const deepLinkResponse = await fetch(\`\${origin}/runs/package-smoke\`)
  const assetResponse = await fetch(\`\${origin}\${assetPaths[0]}\`)

  assert.equal(rootResponse.status, 200)
  assert.equal(deepLinkResponse.status, 200)
  assert.equal(assetResponse.status, 200)
  assert.equal(await rootResponse.text(), indexHtml)
  assert.equal(await deepLinkResponse.text(), indexHtml)

  const expectedAsset = readFileSync(resolve(clientDirectory, assetPaths[0].slice(1)))
  const actualAsset = Buffer.from(await assetResponse.arrayBuffer())
  assert.equal(createHash('sha256').update(actualAsset).digest('hex'), createHash('sha256').update(expectedAsset).digest('hex'))

  for (const specifier of ['@revisium/revo-admin', '@revisium/revo-admin/client/index.html']) {
    await assert.rejects(import(specifier), (error) => error?.code === 'ERR_PACKAGE_PATH_NOT_EXPORTED')
  }

  process.stdout.write(JSON.stringify({ asset: assetPaths[0], clientDirectory }))
} finally {
  server.close()
  await once(server, 'close')
}
`

try {
  const firstPack = pack(join(temporaryRoot, 'pack-a'))
  const files = tarballFiles(firstPack.tarball)
  assertInventory(files)
  assert.ok(!existsSync(join(repositoryRoot, 'build/server')), 'Build unexpectedly retained build/server.')

  const secondPack = pack(join(temporaryRoot, 'pack-b'), ['--ignore-scripts'])
  assert.deepEqual(tarballFiles(secondPack.tarball), files, 'Repeated pack changed the file inventory.')
  assert.equal(
    sha256(secondPack.tarball),
    sha256(firstPack.tarball),
    'Repeated pack was not byte-for-byte reproducible.',
  )

  const consumerRoot = join(temporaryRoot, 'consumer')
  mkdirSync(consumerRoot)
  writeFileSync(join(consumerRoot, 'package.json'), '{"private":true,"type":"module"}\n')
  writeFileSync(join(consumerRoot, 'smoke.mjs'), consumerSource)
  writeFileSync(
    join(consumerRoot, 'consumer.ts'),
    "import { getRevoAdminClientDirectory } from '@revisium/revo-admin/runtime'\n\nconst clientDirectory: string = getRevoAdminClientDirectory()\nvoid clientDirectory\n",
  )
  writeFileSync(
    join(consumerRoot, 'tsconfig.json'),
    `${JSON.stringify({ compilerOptions: { module: 'NodeNext', moduleResolution: 'NodeNext', noEmit: true, strict: true }, files: ['consumer.ts'] })}\n`,
  )
  run('npm', ['install', '--ignore-scripts', '--no-audit', '--no-fund', firstPack.tarball], consumerRoot)

  const installedPackage = join(consumerRoot, 'node_modules', '@revisium', 'revo-admin')
  assert.ok(!lstatSync(installedPackage).isSymbolicLink(), 'Consumer installed a symlink instead of the tarball.')
  assert.ok(
    !realpathSync(installedPackage).startsWith(`${resolve(repositoryRoot)}${sep}`),
    'Consumer resolved the source checkout instead of the installed tarball.',
  )

  run(
    process.execPath,
    [join(repositoryRoot, 'node_modules', 'typescript', 'bin', 'tsc'), '-p', 'tsconfig.json'],
    consumerRoot,
  )
  const consumerResult = JSON.parse(run(process.execPath, ['smoke.mjs'], consumerRoot))
  assert.equal(typeof consumerResult.asset, 'string')
  assert.ok(isAbsolute(consumerResult.clientDirectory))
  assert.ok(realpathSync(consumerResult.clientDirectory).startsWith(`${realpathSync(installedPackage)}${sep}`))

  const actualPackedSize = statSync(firstPack.tarball).size
  assert.equal(actualPackedSize, firstPack.metadata.size)
  process.stdout.write(
    `Verified ${basename(firstPack.tarball)}: ${firstPack.metadata.size} packed bytes, ${firstPack.metadata.unpackedSize} unpacked bytes, sha256:${sha256(firstPack.tarball)}, asset ${consumerResult.asset}.\n`,
  )
} finally {
  rmSync(temporaryRoot, { force: true, recursive: true })
}
