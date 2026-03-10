'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import { searchIndividuals, getAllIndividuals, formatDisplayName, formatLifespan } from '@/modules/gedcom/gedcom.queries'

export function SearchList({ selectedId }: { selectedId?: string }) {
  const { state, dispatch } = useGedcom()
  const router = useRouter()
  const [query, setQuery] = useState('')

  if (!state.db) return null

  const results = query.trim()
    ? searchIndividuals(state.db, query)
    : getAllIndividuals(state.db)

  function selectPerson(id: string) {
    dispatch({ type: 'SELECT_PERSON', id })
    router.push(`/tree?id=${id}`)
  }

  return (
    <div>
      <div className="govuk-form-group">
        <label className="govuk-label govuk-label--s" htmlFor="person-search">
          Search people
        </label>
        <input
          className="govuk-input"
          id="person-search"
          type="search"
          placeholder="Name…"
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <p className="govuk-body-s text-[#505a5f]">
        {results.length} {results.length === 1 ? 'person' : 'people'}
        {query ? ` matching "${query}"` : ' in total'}
      </p>

      <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
        <table className="govuk-table" style={{ fontSize: '13px' }}>
          <thead className="govuk-table__head">
            <tr className="govuk-table__row">
              <th className="govuk-table__header">Name</th>
              <th className="govuk-table__header">Dates</th>
            </tr>
          </thead>
          <tbody className="govuk-table__body">
            {results.map(ind => (
              <tr
                key={ind.id}
                className={`govuk-table__row cursor-pointer hover:bg-[#f3f2f1] ${selectedId === ind.id ? 'bg-[#fff7d6]' : ''}`}
                onClick={() => selectPerson(ind.id)}
              >
                <td className="govuk-table__cell py-1">
                  <span className="govuk-link" style={{ cursor: 'pointer' }}>
                    {formatDisplayName(ind)}
                  </span>
                  {ind.sex === 'M' && <span style={{ color: '#1d70b8', marginLeft: '4px', fontSize: '12px' }}>♂</span>}
                  {ind.sex === 'F' && <span style={{ color: '#d63ac3', marginLeft: '4px', fontSize: '12px' }}>♀</span>}
                </td>
                <td className="govuk-table__cell py-1 text-[#505a5f]">
                  {formatLifespan(ind)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
