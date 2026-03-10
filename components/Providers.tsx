'use client'
import { GedcomProvider } from '@/modules/gedcom/gedcom.context'
import { AutoLoader } from './AutoLoader'
import type { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
  return (
    <GedcomProvider>
      <AutoLoader />
      {children}
    </GedcomProvider>
  )
}
