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
    <GovukLayout title="Family Tree">
      <div className="govuk-grid-row">
        {/* Main tree panel */}
        <div className="govuk-grid-column-two-thirds">
          <Suspense fallback={<p className="govuk-body">Loading…</p>}>
            <TreeViewer id={id} />
          </Suspense>
        </div>

        {/* Sidebar: search */}
        <div className="govuk-grid-column-one-third">
          <h2 className="govuk-heading-s">All people</h2>
          <Suspense fallback={null}>
            <SearchList selectedId={id} />
          </Suspense>
        </div>
      </div>
    </GovukLayout>
  )
}
