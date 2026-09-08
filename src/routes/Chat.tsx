import { useParams } from 'react-router'
import { AssistantPage } from 'src/pages/assistant'
export default function Chat() {
  const { chatId } = useParams()
  return <AssistantPage key={chatId} chatId={chatId} />
}
