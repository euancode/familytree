import { GovukLayout } from '@/components/GovukLayout'
import { FileUpload } from '@/components/upload/FileUpload'

export default function HomePage() {
  return (
    <GovukLayout title="Family Tree Viewer">
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-two-thirds">
          <h1 className="govuk-heading-xl">Explore your family tree</h1>
          <p className="govuk-body-l">
            Upload a GEDCOM file to browse, search and navigate your family history.
          </p>
          <ul className="govuk-list govuk-list--bullet">
            <li>View individuals with birth, death and family details</li>
            <li>Navigate up and down your family tree</li>
            <li>Search across all people in your tree</li>
            <li>Your data never leaves your device</li>
          </ul>
          <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible" />
          <FileUpload />
        </div>
        <div className="govuk-grid-column-one-third">
          <div className="govuk-inset-text">
            <h2 className="govuk-heading-s">How to export a GEDCOM file</h2>
            <ul className="govuk-list govuk-list--bullet govuk-body-s">
              <li><strong>Ancestry:</strong> Family Tree → Settings → Export tree</li>
              <li><strong>FamilySearch:</strong> Tree → Person → Details → Download</li>
              <li><strong>MacFamilyTree:</strong> File → Export → GEDCOM</li>
              <li><strong>Gramps:</strong> Family Trees → Export</li>
              <li><strong>MyHeritage:</strong> Manage trees → Export GEDCOM</li>
            </ul>
          </div>
        </div>
      </div>
    </GovukLayout>
  )
}
