'use client'
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { parseGedcom } from '@/modules/gedcom/gedcom.parser'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import { getAllIndividuals } from '@/modules/gedcom/gedcom.queries'

export function FileUpload() {
  const router = useRouter()
  const { dispatch } = useGedcom()
  const inputRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.ged')) {
      setError('The selected file must be a .ged GEDCOM file.')
      return
    }

    setLoading(true)
    setError('')

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string
        const db = parseGedcom(content, file.name)
        if (db.individuals.size === 0) {
          setError('No individuals found in this GEDCOM file. Please check the file and try again.')
          setLoading(false)
          return
        }
        dispatch({ type: 'LOAD', db })
        // Navigate to tree with first individual selected
        const first = getAllIndividuals(db)[0]
        router.push(`/tree?id=${first?.id ?? ''}`)
      } catch {
        setError('There was a problem reading this file. Make sure it is a valid GEDCOM (.ged) file.')
        setLoading(false)
      }
    }
    reader.onerror = () => {
      setError('Could not read the file. Please try again.')
      setLoading(false)
    }
    reader.readAsText(file)
  }

  return (
    <div className="govuk-form-group" style={error ? { borderLeft: '4px solid #d4351c', paddingLeft: '15px' } : {}}>
      {error && (
        <div className="govuk-error-summary" data-module="govuk-error-summary">
          <div role="alert">
            <h2 className="govuk-error-summary__title">There is a problem</h2>
            <div className="govuk-error-summary__body">
              <ul className="govuk-list govuk-error-summary__list">
                <li>{error}</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      <label className="govuk-label govuk-label--m" htmlFor="gedcom-file">
        Upload your GEDCOM file
      </label>
      <div className="govuk-hint">
        Export a <strong>.ged</strong> file from software such as Ancestry, FamilySearch, MacFamilyTree, or Gramps.
        Your file is processed entirely in your browser — nothing is uploaded.
      </div>

      {loading ? (
        <div className="govuk-inset-text">
          <p className="govuk-body">Parsing your family tree…</p>
        </div>
      ) : (
        <input
          ref={inputRef}
          className="govuk-file-upload"
          id="gedcom-file"
          name="gedcom-file"
          type="file"
          accept=".ged"
          onChange={handleFile}
        />
      )}
    </div>
  )
}
