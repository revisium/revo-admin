import { afterEach, describe, expect, it, vi } from 'vitest'
import { ClipboardService } from 'src/shared/lib/ClipboardService'

afterEach(() => vi.unstubAllGlobals())

describe('Clipboard access', () => {
  it('writes exact text through the available clipboard', async () => {
    const writeText = vi.fn(async () => {})
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await new ClipboardService().write('Exact\ntext')
    expect(writeText).toHaveBeenCalledWith('Exact\ntext')
  })

  it('provides a manual-copy alternative when clipboard access is unavailable', async () => {
    vi.stubGlobal('navigator', {})
    await expect(new ClipboardService().write('Text')).rejects.toThrow('Select the message text')
  })

  it('propagates clipboard permission errors to the presentation request', async () => {
    vi.stubGlobal('navigator', {
      clipboard: {
        writeText: async () => {
          throw new Error('Permission denied')
        },
      },
    })
    await expect(new ClipboardService().write('Text')).rejects.toThrow('Permission denied')
  })
})
