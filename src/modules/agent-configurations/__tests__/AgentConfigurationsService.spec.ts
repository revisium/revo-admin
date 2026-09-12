import { describe, expect, it } from 'vitest'
import { AgentConfigurationsService } from '../AgentConfigurationsService'
import { AgentSelectionModel } from '../AgentSelectionModel'
import type { AgentConfigurationsTransport } from '../contracts/transport'
import type { AgentConfigurationsSnapshot } from '../contracts/types'

const catalog = (revision: string, currentValue = 'balanced') => ({
  agent: { id: 'agent', version: '1', installationId: 'installation-agent' },
  catalogRevision: revision,
  definitionDigest: `digest-${revision}`,
  launch: { executable: 'agent', reportedVersion: '1.0.0' },
  model: null,
  options: [
    {
      kind: 'select' as const,
      category: 'model',
      currentValue,
      description: null,
      id: 'quality',
      name: 'Quality',
      type: 'select',
      values: [
        { name: 'Balanced', value: 'balanced' },
        { name: 'Fast', value: 'fast' },
      ],
    },
  ],
  schemaVersion: '1',
})

class ControlledTransport implements AgentConfigurationsTransport {
  public readonly snapshots: Array<(snapshot: AgentConfigurationsSnapshot) => void> = []
  public readonly prepares: Array<() => Promise<void>> = []
  public readonly states: Array<(state: { readonly status: string; readonly error: string }) => void> = []

  public definitions(_signal: AbortSignal, after?: string) {
    return Promise.resolve({
      items: after
        ? []
        : [
            { id: 'agent', version: '1', installationId: 'installation-agent', name: 'Agent', description: '' },
            {
              id: 'agent',
              version: '1',
              installationId: 'installation-agent-two',
              name: 'Agent',
              description: '',
            },
            { id: 'other', version: '1', installationId: 'installation-other', name: 'Other', description: '' },
            { id: 'failed', version: '1', installationId: 'installation-failed', name: 'Failed', description: '' },
          ],
      next: undefined,
    })
  }

  public subscribe(options: Parameters<AgentConfigurationsTransport['subscribe']>[0]) {
    this.prepares.push(() => options.prepare(options.signal))
    this.snapshots.push((snapshot) => options.next(snapshot, options.signal))
    this.states.push((state) => options.changed?.(state))

    return { done: new Promise<void>(() => {}), dispose: () => {} }
  }
}

describe('AgentConfigurationsService', () => {
  it('publishes definitions and a full snapshot together after prepare', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()

    expect(service.readiness).toBe('LOADING')
    await transport.prepares[0]()
    expect(service.availableAgents).toHaveLength(0)

    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one')] })

    expect(service.readiness).toBe('READY')
    expect(service.availableAgents.map((agent) => agent.id)).toEqual(['agent'])
    expect(service.catalogsSnapshot).toHaveLength(1)
  })

  it('keeps configuration catalogs separate for two installations of the same agent version', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({
      status: 'READY',
      catalogs: [
        catalog('one'),
        {
          ...catalog('two', 'fast'),
          agent: { id: 'agent', version: '1', installationId: 'installation-agent-two' },
          launch: { executable: 'agent-two', reportedVersion: '2.0.0' },
        },
      ],
    })
    const selection = new AgentSelectionModel(service)
    selection.start()

    expect(selection.agents.map((agent) => agent.installationId)).toEqual([
      'installation-agent',
      'installation-agent-two',
    ])

    selection.selectAgent('agent@1@installation-agent-two')

    expect(selection.selectedAgent?.installationId).toBe('installation-agent-two')
    expect(selection.configuration).toEqual({ catalogRevision: 'two', selections: { quality: 'fast' } })
  })

  it('retains edited values for the same catalog revision', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one')] })
    const selection = new AgentSelectionModel(service)
    selection.start()

    selection.selectAgent('agent@1@installation-agent')
    selection.selectOption('quality', 'fast')
    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one', 'balanced')] })

    expect(selection.options[0]?.currentValue).toBe('fast')
  })

  it('resets defaults when a catalog revision changes and rejects while loading', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one')] })
    const selection = new AgentSelectionModel(service)
    selection.start()
    selection.selectAgent('agent@1@installation-agent')
    selection.selectOption('quality', 'fast')

    transport.snapshots[0]({ status: 'LOADING', catalogs: [catalog('two', 'balanced')] })

    expect(selection.options[0]?.currentValue).toBe('fast')
    expect(() => selection.configuration).toThrow('not ready')

    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('two', 'balanced')] })
    selection.selectAgent('agent@1@installation-agent')
    expect(selection.options[0]?.currentValue).toBe('balanced')
  })

  it('disables launch after a connection loss until a fresh snapshot arrives', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one')] })
    const selection = new AgentSelectionModel(service)
    selection.start()
    selection.selectAgent('agent@1@installation-agent')

    transport.states[0]({ status: 'Offline', error: 'Browser is offline.' })

    expect(service.readiness).toBe('LOADING')
    expect(selection.ready).toBe(false)
    expect(() => selection.configuration).toThrow('not ready')
  })

  it('moves selection identity when the selected catalog disappears', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({
      status: 'READY',
      catalogs: [
        catalog('one'),
        { ...catalog('other'), agent: { id: 'other', version: '1', installationId: 'installation-other' } },
      ],
    })
    const selection = new AgentSelectionModel(service)
    selection.start()
    selection.selectAgent('agent@1@installation-agent')

    transport.snapshots[0]({
      status: 'READY',
      catalogs: [{ ...catalog('other'), agent: { id: 'other', version: '1', installationId: 'installation-other' } }],
    })

    expect(selection.agentKey).toBe('other@1@installation-other')
    expect(selection.selectedAgent?.key).toBe('other@1@installation-other')
    expect(selection.ready).toBe(true)
  })

  it('reconciles a revision that changed while the form was unmounted', async () => {
    const transport = new ControlledTransport()
    const service = new AgentConfigurationsService(transport)
    service.start()
    await transport.prepares[0]()
    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('one')] })
    const selection = new AgentSelectionModel(service)
    selection.start()
    selection.selectAgent('agent@1@installation-agent')
    selection.selectOption('quality', 'fast')
    selection.dispose()

    transport.snapshots[0]({ status: 'READY', catalogs: [catalog('two', 'balanced')] })
    selection.start()

    expect(selection.options[0]?.currentValue).toBe('balanced')
  })
})
