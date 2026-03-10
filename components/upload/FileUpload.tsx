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
  const [fileName, setFileName] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.ged')) {
      setError('The selected file must be a .ged GEDCOM file.')
      return
    }

    setFileName(file.name)
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
    <div>
      {error && (
        <div className="govuk-error-summary" role="alert">
          <h2 className="govuk-error-summary__title">There is a problem</h2>
          <div className="govuk-error-summary__body">
            <ul className="govuk-list govuk-error-summary__list">
              <li>{error}</li>
            </ul>
          </div>
        </div>
      )}

      {loading ? (
        <div className="govuk-inset-text">
          <p className="govuk-body">Parsing <strong>{fileName}</strong>…</p>
        </div>
      ) : (
        <div className="govuk-form-group">
          <label className="govuk-label govuk-label--m" htmlFor="gedcom-file">
            Select your GEDCOM file
          </label>
          <div className="govuk-hint">
            Files ending in <strong>.ged</strong> — exported from Ancestry, FamilySearch, MacFamilyTree, Gramps, or MyHeritage.
            Your file stays on your device and is never uploaded.
          </div>

          {/* Hidden native file input */}
          <input
            ref={inputRef}
            id="gedcom-file"
            type="file"
            accept=".ged"
            onChange={handleFile}
            style={{ display: 'none' }}
          />

          {/* Visible file name + button row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
            <button
              type="button"
              className="govuk-button govuk-button--secondary"
              onClick={() => inputRef.current?.click()}
              style={{ marginBottom: 0 }}
            >
              Choose file
            </button>
            <span className="govuk-body" style={{ color: fileName ? '#0b0c0c' : '#505a5f' }}>
              {fileName || 'No file chosen'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
