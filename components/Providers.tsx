'use client'
import { GedcomProvider } from '@/modules/gedcom/gedcom.context'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return <GedcomProvider>{children}</GedcomProvider>
}
