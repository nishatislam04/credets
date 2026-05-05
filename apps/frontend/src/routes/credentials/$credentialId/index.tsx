import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/credentials/$credentialId/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/credentials/$credentialId/"!</div>
}
