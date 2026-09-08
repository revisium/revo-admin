import { container } from './DIContainer'

export class ClipboardService {
  public async write(text: string): Promise<void> {
    if (!navigator.clipboard?.writeText) {
      throw new Error('Copy is unavailable here. Select the message text to copy it.')
    }

    await navigator.clipboard.writeText(text)
  }
}

container.register(ClipboardService, () => new ClipboardService(), { scope: 'singleton' })
