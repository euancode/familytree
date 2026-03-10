import { GovukLayout } from '@/components/GovukLayout'
import { PersonDetail } from '@/components/person/PersonDetail'

export const metadata = { title: 'Person — Family Tree Viewer' }

export default function PersonPage({ params }: { params: { id: string } }) {
  return (
    <GovukLayout>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <PersonDetail id={params.id} />
        </div>
      </div>
    </GovukLayout>
  )
}
