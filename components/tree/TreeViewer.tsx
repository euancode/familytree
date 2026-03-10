'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import {
  getIndividual, getParents, getSpouses, getChildren, formatDisplayName, formatLifespan,
  countAncestorGenerations, countDescendantGenerations, countTotalAncestors, countTotalDescendants
} from '@/modules/gedcom/gedcom.queries'
import { PersonNode, EmptyNode } from './PersonNode'
import type { Individual } from '@/modules/gedcom/gedcom.types'

export function TreeViewer({ id }: { id: string }) {
  const { state, dispatch } = useGedcom()
  const router = useRouter()

  useEffect(() => {
    if (id && state.db) {
      dispatch({ type: 'SELECT_PERSON', id })
    }
  }, [id, state.db]) // eslint-disable-line react-hooks/exhaustive-deps

  if (!state.db) {
    return (
      <div className="govuk-inset-text">
        <p className="govuk-body">
          No family tree loaded. <Link href="/" className="govuk-link">Upload a GEDCOM file</Link> to get started.
        </p>
      </div>
    )
  }

  const person = id ? getIndividual(state.db, id) : undefined

  if (!person) {
    return (
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">
          Person not found. <Link href="/tree" className="govuk-link">Go back to the tree</Link>.
        </strong>
      </div>
    )
  }

  function navigate(id: string) {
    dispatch({ type: 'SELECT_PERSON', id })
    router.push(`/tree?id=${id}`)
  }

  // Build tree data
  const { father, mother } = getParents(state.db, person)
  const patGrandparents = father ? getParents(state.db, father) : {}
  const matGrandparents = mother ? getParents(state.db, mother) : {}
  const spouses = getSpouses(state.db, person)
  const children = getChildren(state.db, person)
  const ancestorGens = countAncestorGenerations(state.db, person)
  const descendantGens = countDescendantGenerations(state.db, person)
  const totalAncestors = countTotalAncestors(state.db, person)
  const totalDescendants = countTotalDescendants(state.db, person)

  // Year range across all visible people in this tree view
  const visiblePeople = [
    patGrandparents.father, patGrandparents.mother,
    matGrandparents.father, matGrandparents.mother,
    father, mother,
    person,
    ...spouses,
    ...children,
  ].filter(Boolean)

  const years = visiblePeople.flatMap(p => [
    p!.birth?.date?.year,
    p!.death?.date?.year,
  ]).filter((y): y is number => y !== undefined)

  const minYear = years.length ? Math.min(...years) : null
  const maxYear = years.length ? Math.max(...years) : null

  return (
    <div>
      {/* Year range banner */}
      {minYear && maxYear && (
        <div className="govuk-caption-m" style={{ marginBottom: '12px', color: '#505a5f' }}>
          Viewing years <strong>{minYear}</strong> – <strong>{maxYear}</strong>
        </div>
      )}

      {/* Tree visualisation */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">

          {/* Grandparents row — groups are 304px wide (148+8+148), gap 16px between groups */}
          <div className="flex justify-center mb-1" style={{ gap: '16px' }}>
            <GenerationGroup
              label="Paternal grandparents"
              left={patGrandparents.father}
              right={patGrandparents.mother}
              onSelect={navigate}
            />
            <GenerationGroup
              label="Maternal grandparents"
              left={matGrandparents.father}
              right={matGrandparents.mother}
              onSelect={navigate}
            />
          </div>

          {/* Connector grandparents → parents: two lines, each 304px wide, gap 16px */}
          <ConnectorRow count={2} groupWidth={304} groupGap={16} nodeWidth={148} />

          {/* Parents row — gap 172px so father/mother centres align with grandparent group centres */}
          <div className="flex justify-center mb-1" style={{ gap: '172px' }}>
            <ParentSlot person={father} label="Father" onSelect={navigate} />
            <ParentSlot person={mother} label="Mother" onSelect={navigate} />
          </div>

          {/* Connector parents → selected */}
          <ConnectorRow count={1} groupWidth={148} groupGap={0} nodeWidth={148} />

          {/* Selected person */}
          <div className="flex justify-center mb-1">
            <div className="flex flex-col items-center gap-1">
              <span className="govuk-body-s text-[#505a5f]">You are viewing</span>
              {/* Larger featured card for selected person */}
              <div style={{
                width: '200px',
                border: '3px solid #0b0c0c',
                borderRadius: '4px',
                padding: '8px 10px',
                background: '#fff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: '#0b0c0c', lineHeight: '1.2', fontFamily: 'Arial, sans-serif' }}>
                    {person.nameParts.given || '?'}
                  </span>
                  {person.sex && (
                    <span style={{ fontSize: '14px', color: person.sex === 'M' ? '#1d70b8' : '#d63ac3' }}>
                      {person.sex === 'M' ? '♂' : '♀'}
                    </span>
                  )}
                </div>
                {person.nameParts.surname && (
                  <div style={{ fontSize: '13px', fontWeight: 600, color: '#0b0c0c', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif' }}>
                    {person.nameParts.surname}
                  </div>
                )}
                {formatLifespan(person) && (
                  <div style={{ fontSize: '12px', color: '#505a5f', marginTop: '4px', fontFamily: 'Arial, sans-serif' }}>
                    {formatLifespan(person)}
                  </div>
                )}
              </div>
              {/* Generation badges */}
              <div className="flex gap-2 mt-1 flex-wrap justify-center">
                {ancestorGens > 0 && (
                  <span className="govuk-tag govuk-tag--blue" style={{ fontSize: '11px' }}>
                    ↑ {ancestorGens} gen{ancestorGens !== 1 ? 's' : ''} · {totalAncestors} {totalAncestors === 1 ? 'person' : 'people'}
                  </span>
                )}
                {descendantGens > 0 && (
                  <span className="govuk-tag govuk-tag--green" style={{ fontSize: '11px' }}>
                    ↓ {descendantGens} gen{descendantGens !== 1 ? 's' : ''} · {totalDescendants} {totalDescendants === 1 ? 'person' : 'people'}
                  </span>
                )}
              </div>
              <Link
                href={`/person/${person.id}`}
                className="govuk-link govuk-body-s"
              >
                Full details →
              </Link>
            </div>
          </div>

          {/* Spouses */}
          {spouses.length > 0 && (
            <div className="flex justify-center gap-3 mt-2 mb-1">
              {spouses.map(s => (
                <div key={s.id} className="flex flex-col items-center gap-1">
                  <span className="govuk-body-s text-[#505a5f]">
                    {person.sex === 'M' ? 'Wife' : person.sex === 'F' ? 'Husband' : 'Spouse'}
                  </span>
                  <PersonNode individual={s} role="spouse" onClick={navigate} />
                </div>
              ))}
            </div>
          )}

          {/* Connector → children */}
          {children.length > 0 && <ConnectorRow count={1} groupWidth={148} groupGap={0} nodeWidth={148} />}

          {/* Children row */}
          {children.length > 0 && (
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              {children.map(child => (
                <div key={child.id} className="flex flex-col items-center gap-1">
                  <PersonNode individual={child} role="descendant" onClick={navigate} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick facts panel */}
      <hr className="govuk-section-break govuk-section-break--m govuk-section-break--visible mt-6" />
      <div className="govuk-grid-row">
        <div className="govuk-grid-column-full">
          <h2 className="govuk-heading-m">{formatDisplayName(person)}</h2>
          <dl className="govuk-summary-list govuk-summary-list--no-border">
            {person.birth && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Born</dt>
                <dd className="govuk-summary-list__value">
                  {person.birth.date?.raw ?? ''}
                  {person.birth.place ? ` — ${person.birth.place}` : ''}
                </dd>
              </div>
            )}
            {person.death && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Died</dt>
                <dd className="govuk-summary-list__value">
                  {person.death.date?.raw ?? ''}
                  {person.death.place ? ` — ${person.death.place}` : ''}
                </dd>
              </div>
            )}
            {(father || mother) && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Parents</dt>
                <dd className="govuk-summary-list__value flex flex-wrap gap-3">
                  {father && (
                    <button type="button" onClick={() => navigate(father.id)} className="govuk-link">
                      {formatDisplayName(father)}
                    </button>
                  )}
                  {mother && (
                    <button type="button" onClick={() => navigate(mother.id)} className="govuk-link">
                      {formatDisplayName(mother)}
                    </button>
                  )}
                </dd>
              </div>
            )}
            {spouses.length > 0 && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">
                  {spouses.length === 1 ? 'Spouse' : 'Spouses'}
                </dt>
                <dd className="govuk-summary-list__value flex flex-wrap gap-3">
                  {spouses.map(s => (
                    <button key={s.id} type="button" onClick={() => navigate(s.id)} className="govuk-link">
                      {formatDisplayName(s)} {formatLifespan(s) ? `(${formatLifespan(s)})` : ''}
                    </button>
                  ))}
                </dd>
              </div>
            )}
            {children.length > 0 && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Children</dt>
                <dd className="govuk-summary-list__value flex flex-wrap gap-3">
                  {children.map(c => (
                    <button key={c.id} type="button" onClick={() => navigate(c.id)} className="govuk-link">
                      {formatDisplayName(c)}
                    </button>
                  ))}
                </dd>
              </div>
            )}
          </dl>
          <Link href={`/person/${person.id}`} className="govuk-button govuk-button--secondary">
            View full profile
          </Link>
        </div>
      </div>
    </div>
  )
}

function GenerationGroup({
  label, left, right, onSelect
}: {
  label: string
  left?: Individual
  right?: Individual
  onSelect: (id: string) => void
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="govuk-body-s text-[#505a5f] text-center" style={{ fontSize: '11px' }}>{label}</span>
      <div style={{ display: 'flex', gap: '8px' }}>
        {left ? <PersonNode individual={left} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
        {right ? <PersonNode individual={right} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
      </div>
    </div>
  )
}

function ParentSlot({ person, label, onSelect }: { person?: Individual; label: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center" style={{ gap: '2px' }}>
      <span className="govuk-body-s text-[#505a5f]" style={{ fontSize: '11px' }}>{label}</span>
      {person ? <PersonNode individual={person} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
    </div>
  )
}

function ConnectorRow({ count, groupWidth, groupGap, nodeWidth }: {
  count: number
  groupWidth: number
  groupGap: number
  nodeWidth: number
}) {
  const numLines = count === 2 ? 2 : 1
  const containerWidth = numLines === 2 ? groupWidth * 2 + groupGap : nodeWidth
  return (
    <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
      <div style={{ display: 'flex', gap: `${groupGap}px`, width: containerWidth }}>
        {Array.from({ length: numLines }).map((_, i) => (
          <div key={i} style={{ width: groupWidth, display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: 2, height: 10, backgroundColor: '#b1b4b6' }} />
          </div>
        ))}
      </div>
    </div>
  )
}
