import type { Metadata } from 'next'
import './globals.css'
import { Providers } from '@/components/Providers'

export const metadata: Metadata = {
  title: 'Family Tree Viewer',
  description: 'View and explore GEDCOM family tree files',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="govuk-template">
      <body className="govuk-template__body">
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
