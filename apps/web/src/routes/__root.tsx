import { HeadContent, createRootRouteWithContext } from '@tanstack/react-router'
import type { QueryClient } from '@tanstack/react-query'
import App from '@/App'

export interface RouterContext {
  queryClient: QueryClient
}

export const Route = createRootRouteWithContext<RouterContext>()({
  head: () => ({
    meta: [
      {
        title: 'Jungle Tasks — Board colaborativo em tempo real',
      },
      {
        name: 'description',
        content:
          'Gerencie tarefas da Jungle Gaming com board em tempo real, comentários e notificações instantâneas.',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1.0',
      },
      {
        name: 'theme-color',
        content: '#022c22',
      },
      {
        property: 'og:type',
        content: 'website',
      },
      {
        property: 'og:title',
        content: 'Jungle Tasks — Sistema de gestão de tarefas colaborativo',
      },
      {
        property: 'og:description',
        content:
          'Board de tarefas em estilo eSports, com comentários em tempo real e notificações WebSocket.',
      },
    ],
  }),
  component: App,
})
