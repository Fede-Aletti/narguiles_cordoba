'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AgeVerificationProvider } from '@/components/providers/age-verification-provider'
import React from 'react'

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // With SSR, we usually want to set some default staleTime
            // above 0 to avoid refetching immediately on the client
            staleTime: 60 * 1000, // 1 minute
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <AgeVerificationProvider>
        {children}
        <ReactQueryDevtools initialIsOpen={false} />
      </AgeVerificationProvider>
    </QueryClientProvider>
  )
} 