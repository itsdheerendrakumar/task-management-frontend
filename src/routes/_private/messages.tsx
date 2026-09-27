import Message from '@/pages/Message'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/messages')({
  component: Message,
})
