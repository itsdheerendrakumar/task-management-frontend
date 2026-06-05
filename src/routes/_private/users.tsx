//imoort by lazy loading the component
import { User } from '@/pages/User'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/users')({
  component: User,
})