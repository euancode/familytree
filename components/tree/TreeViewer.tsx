'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import {
  getIndividual, getParents, getSpouses, getChildren, formatDisplayName, formatLifespan
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

  return (
    <div>
      {/* Tree visualisation */}
      <div className="overflow-x-auto pb-4">
        <div className="inline-block min-w-full">

          {/* Grandparents row */}
          <div className="flex justify-center gap-8 mb-2">
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

          {/* Connector grandparents → parents */}
          <ConnectorRow count={2} />

          {/* Parents row */}
          <div className="flex justify-center gap-16 mb-2">
            <ParentSlot person={father} label="Father" onSelect={navigate} />
            <ParentSlot person={mother} label="Mother" onSelect={navigate} />
          </div>

          {/* Connector parents → selected */}
          <ConnectorRow count={1} />

          {/* Selected person */}
          <div className="flex justify-center mb-2">
            <div className="flex flex-col items-center gap-1">
              <span className="govuk-body-s text-[#505a5f]">You are viewing</span>
              <PersonNode individual={person} isSelected role="default" onClick={() => {}} />
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
            <div className="flex justify-center gap-6 mt-4 mb-2">
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
          {children.length > 0 && <ConnectorRow count={1} />}

          {/* Children row */}
          {children.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-2">
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
      <div className="flex gap-3">
        {left ? <PersonNode individual={left} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
        {right ? <PersonNode individual={right} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
      </div>
    </div>
  )
}

function ParentSlot({ person, label, onSelect }: { person?: Individual; label: string; onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="govuk-body-s text-[#505a5f]" style={{ fontSize: '11px' }}>{label}</span>
      {person ? <PersonNode individual={person} role="ancestor" onClick={onSelect} /> : <EmptyNode />}
    </div>
  )
}

function ConnectorRow({ count }: { count: number }) {
  return (
    <div className={`flex justify-center gap-${count === 2 ? '8' : '0'} my-1`}>
      {Array.from({ length: count === 2 ? 2 : 1 }).map((_, i) => (
        <div key={i} className={`flex justify-center ${count === 2 ? 'w-[306px]' : 'w-36'}`}>
          <div style={{ width: 2, height: 16, backgroundColor: '#b1b4b6' }} />
        </div>
      ))}
    </div>
  )
}
