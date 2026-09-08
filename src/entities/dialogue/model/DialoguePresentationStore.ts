import { makeAutoObservable } from 'mobx'
import { container } from 'src/shared/lib'

class DialoguePresentationState {
  public draft = ''
  public scrollTop = 0
  public followOutput = true
  constructor() {
    makeAutoObservable(this)
  }
}

export class DialoguePresentationStore {
  private readonly states = new Map<string, DialoguePresentationState>()

  public get(id: string): DialoguePresentationState {
    let state = this.states.get(id)

    if (!state) {
      state = new DialoguePresentationState()
      this.states.set(id, state)
    }

    return state
  }
}
container.register(DialoguePresentationStore, () => new DialoguePresentationStore(), { scope: 'singleton' })
