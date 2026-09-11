import { strict as assert } from 'node:assert'
import { promises as fs, createReadStream } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const projectRoot = resolve(fileURLToPath(new URL('..', import.meta.url)))
const clientRoot = join(projectRoot, 'build', 'client')
const indexPath = join(clientRoot, 'index.html')
const protectedPrefixes = ['/graphql', '/api', '/mcp', '/health']
const adminRoutes = ['/', '/projects', '/runs', '/runs/manual-smoke', '/runs/a.b']
const contentTypes = { '.css': 'text/css', '.js': 'text/javascript', '.html': 'text/html' }

const writePlain = (response, status, body) => {
  response.writeHead(status, { 'content-type': 'text/plain' })
  response.end(body)
}

const contentTypeOf = (filePath) => contentTypes[extname(filePath)] ?? 'application/octet-stream'

const serveFile = async (filePath, method, response) => {
  let stats
  try {
    stats = await fs.stat(filePath)
  } catch {
    writePlain(response, 404, 'not found')
    return
  }

  if (!stats.isFile()) {
    writePlain(response, 404, 'not found')
    return
  }

  response.writeHead(200, { 'content-type': contentTypeOf(filePath), 'content-length': stats.size })
  if (method === 'HEAD') {
    response.end()
    return
  }

  const stream = createReadStream(filePath)
  stream.on('error', () => {
    if (!response.headersSent) writePlain(response, 500, 'read error')
    else response.destroy()
  })
  stream.pipe(response)
}

const staticServer = createServer(async (request, response) => {
  const method = request.method ?? 'GET'
  const requestPath = new URL(request.url ?? '/', 'http://127.0.0.1').pathname
  const acceptsHtml = request.headers.accept?.includes('text/html') === true
  const isProtected = protectedPrefixes.some((prefix) => requestPath === prefix || requestPath.startsWith(`${prefix}/`))

  if (isProtected) {
    writePlain(response, 404, 'backend namespace')
    return
  }

  if (method !== 'GET' && method !== 'HEAD') {
    writePlain(response, 405, 'method not allowed')
    return
  }

  const candidate = resolve(clientRoot, `.${requestPath}`)
  if (relative(clientRoot, candidate).startsWith('..')) {
    writePlain(response, 400, 'invalid path')
    return
  }

  if (requestPath === '/') {
    await serveFile(indexPath, method, response)
    return
  }

  if (requestPath.startsWith('/assets/')) {
    await serveFile(candidate, method, response)
    return
  }

  if (acceptsHtml) {
    await serveFile(indexPath, method, response)
    return
  }

  writePlain(response, 404, 'not found')
})

const fetchPath = (baseUrl, path, options = {}) => fetch(`${baseUrl}${path}`, options)

const assertNotHtml = (response) => assert.notEqual(response.headers.get('content-type')?.split(';')[0], 'text/html')

const main = async () => {
  const indexStats = await fs.stat(indexPath)
  assert.ok(indexStats.isFile(), 'build/client/index.html is required')
  const indexHtml = await fs.readFile(indexPath, 'utf8')
  const referencedAssets = [...indexHtml.matchAll(/(?:src|href)="([^"#?]+)"/g)]
    .map(([, path]) => path)
    .filter((path) => path.startsWith('/assets/'))
  const javascriptAssets = referencedAssets.filter((asset) => asset.endsWith('.js'))
  assert.ok(javascriptAssets.length, 'index.html must reference a JavaScript asset')
  const assets = await fs.readdir(join(clientRoot, 'assets'))
  const stylesheet = assets.find((asset) => asset.endsWith('.css'))
  assert.ok(stylesheet, 'a hashed CSS asset is required')

  await new Promise((resolveServer) => staticServer.listen(0, '127.0.0.1', resolveServer))
  const address = staticServer.address()
  assert.ok(address && typeof address === 'object')
  const baseUrl = `http://127.0.0.1:${address.port}`

  try {
    for (const route of adminRoutes) {
      const response = await fetchPath(baseUrl, route, { headers: { accept: 'text/html' } })
      assert.equal(response.status, 200, `${route} should receive the SPA entry`)
      assert.equal(response.headers.get('content-type')?.split(';')[0], 'text/html')
    }

    for (const asset of referencedAssets) {
      const response = await fetchPath(baseUrl, asset)
      assert.equal(response.status, 200)
      assert.notEqual(response.headers.get('content-type')?.split(';')[0], 'text/html', `${asset} must not be HTML`)
    }
    const stylesheetResponse = await fetchPath(baseUrl, `/assets/${stylesheet}`)
    assert.equal(stylesheetResponse.status, 200)
    assert.equal(stylesheetResponse.headers.get('content-type')?.split(';')[0], 'text/css')

    const protectedPaths = protectedPrefixes.flatMap((prefix) => [prefix, `${prefix}/descendant`])
    for (const protectedPath of protectedPaths) {
      const response = await fetchPath(baseUrl, protectedPath, { headers: { accept: 'text/html' } })
      assert.notEqual(response.status, 200, `${protectedPath} must not receive the SPA fallback`)
      assertNotHtml(response)
    }

    for (const [path, options, expectedStatus] of [
      ['/projects', { method: 'POST', headers: { accept: 'text/html' } }, null],
      ['/projects', { headers: { accept: 'application/json' } }, 404],
      ['/assets/', {}, 404],
      ['/assets/does-not-exist.js', {}, 404],
    ]) {
      const response = await fetchPath(baseUrl, path, options)
      if (expectedStatus === null) assert.notEqual(response.status, 200, `${path} must not receive the SPA fallback`)
      else assert.equal(response.status, expectedStatus, `${path} should be a non-HTML 404`)
      assertNotHtml(response)
    }
  } finally {
    await new Promise((resolveServer, reject) =>
      staticServer.close((error) => (error ? reject(error) : resolveServer())),
    )
  }

  console.log(`Static SPA smoke passed: ${adminRoutes.length} routes, ${referencedAssets.length} referenced assets`)
}

await main()
