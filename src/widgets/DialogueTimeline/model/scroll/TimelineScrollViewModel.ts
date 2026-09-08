import { makeAutoObservable } from 'mobx'
import { DialoguePresentationStore } from 'src/entities/dialogue'

export class TimelineScrollViewModel {
  private id = ''
  private scrollToLatest: (() => void) | undefined

  public constructor(private readonly presentation: DialoguePresentationStore) {
    makeAutoObservable<this, 'scrollToLatest'>(this, { scrollToLatest: false }, { autoBind: true })
  }

  public setup(id: string): void {
    this.id = id
  }

  public attach(scrollToLatest: (() => void) | undefined): void {
    this.scrollToLatest = scrollToLatest
  }

  public get initialTop(): number {
    return this.presentation.get(this.id).scrollTop
  }

  public get following(): boolean {
    return this.presentation.get(this.id).followOutput
  }

  public get showJump(): boolean {
    return !this.following
  }

  public get followOutput(): 'auto' | false {
    return this.following ? 'auto' : false
  }

  public setTop(value: number): void {
    this.presentation.get(this.id).scrollTop = value
  }

  public pause(): void {
    this.presentation.get(this.id).followOutput = false
  }

  public wheel(deltaY: number): void {
    if (deltaY < 0) this.pause()
  }

  public keyDown(key: string): void {
    if (['ArrowUp', 'PageUp', 'Home'].includes(key)) this.pause()
  }

  public setAtBottom(value: boolean): void {
    if (value) this.presentation.get(this.id).followOutput = true
  }

  public contentResized(): void {
    if (this.following) this.scrollToLatest?.()
  }

  public jumpToLatest(): void {
    this.presentation.get(this.id).followOutput = true
    this.scrollToLatest?.()
  }
}
