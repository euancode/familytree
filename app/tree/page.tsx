import { GovukLayout } from '@/components/GovukLayout'
import { TreeViewer } from '@/components/tree/TreeViewer'
import { SearchList } from '@/components/tree/SearchList'
import { Suspense } from 'react'

export const metadata = { title: 'Family Tree — Family Tree Viewer' }

export default function TreePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[]>
}) {
  const id = typeof searchParams.id === 'string' ? searchParams.id : ''

  return (
    <GovukLayout>
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        {/* Main tree panel — scrollable, clipped */}
        <div style={{ flex: '1 1 0', minWidth: 0, overflow: 'hidden' }}>
          <Suspense fallback={<p className="govuk-body">Loading…</p>}>
            <TreeViewer id={id} />
          </Suspense>
        </div>

        {/* Sidebar: search — fixed width, always visible */}
        <div style={{ flex: '0 0 280px', width: '280px' }}>
          <h2 className="govuk-heading-s">All people</h2>
          <Suspense fallback={null}>
            <SearchList selectedId={id} />
          </Suspense>
        </div>
      </div>
    </GovukLayout>
  )
}
