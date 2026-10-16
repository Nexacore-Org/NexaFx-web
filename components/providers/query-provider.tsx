import { QueryClient, QueryProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,
      retry: false,
      refetchOnWindowFocus: true,
      retryOnMount: false,
    },
    mutations: {
      retry: false,
    },
  },
})

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return <QueryClient client={queryClient}>{children}</QueryClient>
}