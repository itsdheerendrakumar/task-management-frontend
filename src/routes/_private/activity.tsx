import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_private/activity')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_private/activity"!</div>
}
