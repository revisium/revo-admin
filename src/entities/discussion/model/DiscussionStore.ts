import { makeAutoObservable } from 'mobx'
import { nanoid } from 'nanoid'
import { container } from 'src/shared/lib'
import { routes } from 'src/shared/config'

export interface DiscussionMessage {
  readonly id: string
  readonly role: 'user' | 'assistant'
  readonly content: string
}

export interface Discussion {
  readonly id: string
  readonly title: string
  readonly category: string
  readonly messages: DiscussionMessage[]
}

const TITLE_LENGTH = 64

export class DiscussionStore {
  public chats: Discussion[] = [
    {
      id: 'release-process',
      title: 'Design a release pipeline',
      category: 'Pipeline design',
      messages: [
        {
          id: 'release-question',
          role: 'user',
          content: 'Help me design a release process with a human decision before publishing.',
        },
        {
          id: 'release-answer',
          role: 'assistant',
          content:
            'We can start with build, tests, a review gate, and publication. Which checks should be required before the release? No project needs to be selected until we prepare a run.',
        },
      ],
    },
    {
      id: 'new-project',
      title: 'Prepare a new project',
      category: 'Project setup',
      messages: [
        { id: 'project-question', role: 'user', content: 'I want to organize an API research project.' },
        {
          id: 'project-answer',
          role: 'assistant',
          content:
            'Let’s clarify the expected result first. We can then prepare a project and choose a research pipeline and launch profile.',
        },
      ],
    },
  ]
  public drafts: Record<string, string> = {}

  public constructor() {
    makeAutoObservable(this, {}, { autoBind: true })
  }

  public draft(key: string): string {
    return this.drafts[key] ?? ''
  }

  public setDraft(key: string, value: string): void {
    this.drafts[key] = value
  }

  public find(id: string): Discussion | undefined {
    return this.chats.find((chat) => chat.id === id)
  }

  public send(key: string, chatId?: string): string | undefined {
    const message = this.draft(key).trim()
    if (!message) return undefined

    const chat = this.recordMessage(message, chatId)
    if (!chat) return undefined

    this.drafts[key] = ''

    return routes.chat(chat.id)
  }

  private recordMessage(message: string, chatId?: string): Discussion | undefined {
    if (!chatId) return this.createChat(message)

    const chat = this.find(chatId)
    if (!chat) return undefined

    this.appendExchange(chat, message)

    return chat
  }

  private createChat(message: string): Discussion {
    const chat: Discussion = {
      id: nanoid(),
      title: message.slice(0, TITLE_LENGTH),
      category: 'General planning',
      messages: this.createExchange(message),
    }
    this.chats.unshift(chat)

    return chat
  }

  private appendExchange(chat: Discussion, message: string): void {
    chat.messages.push(...this.createExchange(message))
  }

  private createExchange(message: string): DiscussionMessage[] {
    return [
      { id: nanoid(), role: 'user', content: message },
      {
        id: nanoid(),
        role: 'assistant',
        content:
          'Your message is saved for this preview. Connect an agent to discuss the next steps and prepare changes. No project, pipeline, or run has been created.',
      },
    ]
  }
}

container.register(DiscussionStore, () => new DiscussionStore(), { scope: 'singleton' })
