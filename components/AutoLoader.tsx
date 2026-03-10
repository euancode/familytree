'use client'
import { useEffect, useState } from 'react'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import { parseGedcom } from '@/modules/gedcom/gedcom.parser'
import { getAllIndividuals } from '@/modules/gedcom/gedcom.queries'
import { useRouter, usePathname } from 'next/navigation'

export function AutoLoader() {
  const { state, dispatch } = useGedcom()
  const router = useRouter()
  const pathname = usePathname()
  const [error, setError] = useState('')

  useEffect(() => {
    if (state.db) {
      if (pathname === '/') {
        const first = getAllIndividuals(state.db)[0]
        router.push(`/tree?id=${first?.id ?? ''}`)
      }
      return
    }

    fetch('/McCreath.ged')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.arrayBuffer()
      })
      .then(buffer => {
        // Try UTF-8 first, fall back to latin-1 (common in older GEDCOM files)
        let text: string
        try {
          text = new TextDecoder('utf-8', { fatal: true }).decode(buffer)
        } catch {
          text = new TextDecoder('windows-1252').decode(buffer)
        }
        const db = parseGedcom(text, 'McCreath.ged')
        if (db.individuals.size === 0) {
          setError('No individuals found in McCreath.ged.')
          return
        }
        dispatch({ type: 'LOAD', db })
        const first = getAllIndividuals(db)[0]
        router.push(`/tree?id=${first?.id ?? ''}`)
      })
      .catch(err => {
        console.error('AutoLoader error:', err)
        setError(`Failed to load family tree: ${err.message}`)
      })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (error) {
    return (
      <div className="govuk-error-summary" role="alert" style={{ margin: '20px' }}>
        <h2 className="govuk-error-summary__title">Could not load family tree</h2>
        <div className="govuk-error-summary__body">
          <p className="govuk-body">{error}</p>
        </div>
      </div>
    )
  }

  return null
}
