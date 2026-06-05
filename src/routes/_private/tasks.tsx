import { Task } from '@/pages/Task'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/tasks')({
  component: Task,
})