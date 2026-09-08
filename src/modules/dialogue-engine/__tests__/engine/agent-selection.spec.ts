import { afterEach, describe, expect, it } from 'vitest'
import { dialogueScenario, type DialogueScenario } from '../support/DialogueScenario'

let scenario: DialogueScenario | undefined

afterEach(() => scenario?.dispose())

function setupSelection() {
  scenario = dialogueScenario()
  scenario.backend.agent('first', {
    revision: 'first',
    options: [{ id: 'enabled', name: 'Feature', kind: 'boolean', value: false }],
  })
  scenario.backend.agent('second', { revision: 'second', options: [] })
  const selection = scenario.own(scenario.engine.createAgentSelection(), (model) => model.dispose())

  return { backend: scenario.backend, selection }
}

describe('Agent configuration', () => {
  it('loads a boolean option as a typed value', async () => {
    const { selection } = setupSelection()

    await selection.load()

    expect(selection.ready).toBe(true)
    expect(selection.options[0].value).toBe(false)
  })

  it('includes a changed option in the selected configuration', async () => {
    const { selection } = setupSelection()
    await selection.load()

    selection.selectOption('enabled', true)

    expect(selection.configuration.selections.enabled).toBe(true)
  })

  it('rejects a string value for a boolean option', async () => {
    const { selection } = setupSelection()
    await selection.load()

    expect(() => selection.selectOption('enabled', 'true')).toThrow('boolean')
    expect(selection.options[0].value).toBe(false)
  })

  it('keeps the selected agent when the previous configuration arrives late', async () => {
    const { backend, selection } = setupSelection()
    const firstRequest = backend.requests.configuration.holdNext()

    const loading = selection.load()
    await firstRequest.received()
    await selection.selectAgent('second@1')
    await firstRequest.respond({ revision: 'first', options: [] })
    await loading

    expect(selection.agentKey).toBe('second@1')
    expect(selection.configuration.catalogRevision).toBe('second')
  })
})
