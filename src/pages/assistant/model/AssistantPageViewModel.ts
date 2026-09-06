import { makeAutoObservable } from 'mobx'
import { DiscussionStore } from 'src/entities/discussion'
import { routes } from 'src/shared/config'
import { container } from 'src/shared/lib'

interface AssistantMessageItem {
  readonly id: string
  readonly content: string
  readonly authorLabel: string
  readonly fromUser: boolean
}

interface AssistantChatItem {
  readonly id: string
  readonly title: string
  readonly to: string
}

export class AssistantPageViewModel {
  private chatId?: string

  public readonly unavailableMessage = 'Conversation unavailable in this preview.'
  public readonly unavailableActionLabel = 'New conversation'
  public readonly newChatLabel = 'New chat'
  public readonly recentChatsLabel = 'Continue a conversation'
  public readonly retentionNotice =
    'Demo conversations stay available while this app is open. Reloading resets this preview.'

  public constructor(private readonly discussions: DiscussionStore) {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public setup(chatId?: string): void {
    this.chatId = chatId
  }

  public get chat() {
    return this.chatId ? this.discussions.find(this.chatId) : undefined
  }

  public get unavailable(): boolean {
    return this.chatId !== undefined && this.chat === undefined
  }

  public get title(): string {
    return this.chat?.title ?? 'What would you like to do?'
  }

  public get description(): string {
    return this.chat
      ? 'System discussion · no project required'
      : 'Explore an idea, prepare a project, or design your next pipeline.'
  }

  public get messages(): readonly AssistantMessageItem[] {
    return (this.chat?.messages ?? []).map((message) => ({
      id: message.id,
      content: message.content,
      authorLabel: message.role === 'user' ? 'You' : 'Assistant · preview',
      fromUser: message.role === 'user',
    }))
  }

  public get chats(): readonly AssistantChatItem[] {
    return this.discussions.chats.map((chat) => ({
      id: chat.id,
      title: chat.title,
      to: routes.chat(chat.id),
    }))
  }

  public get showNewChatAction(): boolean {
    return this.chat !== undefined
  }

  public get showSuggestions(): boolean {
    return this.chat === undefined
  }

  public get newChatPath(): string {
    return routes.assistant()
  }
}

container.register(
  AssistantPageViewModel,
  () => {
    const discussions = container.get(DiscussionStore)

    return new AssistantPageViewModel(discussions)
  },
  { scope: 'transient' },
)
