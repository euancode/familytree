import { GovukLayout } from '@/components/GovukLayout'

export default function HomePage() {
  return (
    <GovukLayout>
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">McCreath Family Tree</h1>
          <p className="govuk-body-l">Loading family tree…</p>
          <div className="govuk-inset-text">
            <p className="govuk-body">You will be redirected to the tree shortly.</p>
          </div>
        </div>
      </div>
    </GovukLayout>
  )
}
