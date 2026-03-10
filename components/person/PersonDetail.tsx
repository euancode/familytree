'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useGedcom } from '@/modules/gedcom/gedcom.context'
import {
  getIndividual, getParents, getSpouses, getChildren, getSiblings,
  formatDisplayName, formatLifespan
} from '@/modules/gedcom/gedcom.queries'

export function PersonDetail({ id }: { id: string }) {
  const { state, dispatch } = useGedcom()
  const router = useRouter()

  if (!state.db) {
    return (
      <div className="govuk-inset-text">
        <p className="govuk-body">
          No family tree loaded. <Link href="/" className="govuk-link">Upload a GEDCOM file</Link>.
        </p>
      </div>
    )
  }

  const person = getIndividual(state.db, id)

  if (!person) {
    return (
      <div className="govuk-warning-text">
        <span className="govuk-warning-text__icon" aria-hidden="true">!</span>
        <strong className="govuk-warning-text__text">Person not found.</strong>
      </div>
    )
  }

  const { father, mother } = getParents(state.db, person)
  const spouses = getSpouses(state.db, person)
  const children = getChildren(state.db, person)
  const siblings = getSiblings(state.db, person)

  function navTo(targetId: string) {
    dispatch({ type: 'SELECT_PERSON', id: targetId })
    router.push(`/person/${targetId}`)
  }

  const displayName = formatDisplayName(person)
  const lifespan = formatLifespan(person)

  const treeUrl = `/tree?id=${id}`

  return (
    <div>
      <Link href={treeUrl} className="govuk-button govuk-button--secondary" style={{ marginBottom: '1rem' }}>
        ← View in tree
      </Link>

      <nav className="govuk-breadcrumbs" aria-label="Breadcrumb">
        <ol className="govuk-breadcrumbs__list">
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href="/">Home</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item">
            <Link className="govuk-breadcrumbs__link" href={`/tree?id=${id}`}>Tree</Link>
          </li>
          <li className="govuk-breadcrumbs__list-item" aria-current="page">
            {displayName}
          </li>
        </ol>
      </nav>

      <h1 className="govuk-heading-xl">
        {displayName}
        {lifespan && (
          <span className="govuk-caption-xl">{lifespan}</span>
        )}
      </h1>

      {/* Core details */}
      <dl className="govuk-summary-list">
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Full name</dt>
          <dd className="govuk-summary-list__value">{person.name || '—'}</dd>
        </div>
        <div className="govuk-summary-list__row">
          <dt className="govuk-summary-list__key">Sex</dt>
          <dd className="govuk-summary-list__value">
            {person.sex === 'M' ? 'Male' : person.sex === 'F' ? 'Female' : 'Unknown'}
          </dd>
        </div>
        {person.birth && (
          <>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Date of birth</dt>
              <dd className="govuk-summary-list__value">{person.birth.date?.raw || '—'}</dd>
            </div>
            {person.birth.place && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Place of birth</dt>
                <dd className="govuk-summary-list__value">{person.birth.place}</dd>
              </div>
            )}
          </>
        )}
        {person.death && (
          <>
            <div className="govuk-summary-list__row">
              <dt className="govuk-summary-list__key">Date of death</dt>
              <dd className="govuk-summary-list__value">{person.death.date?.raw || '—'}</dd>
            </div>
            {person.death.place && (
              <div className="govuk-summary-list__row">
                <dt className="govuk-summary-list__key">Place of death</dt>
                <dd className="govuk-summary-list__value">{person.death.place}</dd>
              </div>
            )}
          </>
        )}
      </dl>

      {/* Family relationships */}
      {(father || mother) && (
        <section className="mt-6">
          <h2 className="govuk-heading-m">Parents</h2>
          <ul className="govuk-list">
            {father && (
              <li>
                <button type="button" onClick={() => navTo(father.id)} className="govuk-link">
                  {formatDisplayName(father)}
                </button>
                <span className="govuk-body-s text-[#505a5f] ml-2">(Father) {formatLifespan(father)}</span>
              </li>
            )}
            {mother && (
              <li>
                <button type="button" onClick={() => navTo(mother.id)} className="govuk-link">
                  {formatDisplayName(mother)}
                </button>
                <span className="govuk-body-s text-[#505a5f] ml-2">(Mother) {formatLifespan(mother)}</span>
              </li>
            )}
          </ul>
        </section>
      )}

      {spouses.length > 0 && (
        <section className="mt-6">
          <h2 className="govuk-heading-m">{spouses.length === 1 ? 'Spouse' : 'Spouses'}</h2>
          <ul className="govuk-list">
            {spouses.map(s => (
              <li key={s.id}>
                <button type="button" onClick={() => navTo(s.id)} className="govuk-link">
                  {formatDisplayName(s)}
                </button>
                <span className="govuk-body-s text-[#505a5f] ml-2">{formatLifespan(s)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {children.length > 0 && (
        <section className="mt-6">
          <h2 className="govuk-heading-m">Children</h2>
          <ul className="govuk-list govuk-list--bullet">
            {children.map(c => (
              <li key={c.id}>
                <button type="button" onClick={() => navTo(c.id)} className="govuk-link">
                  {formatDisplayName(c)}
                </button>
                <span className="govuk-body-s text-[#505a5f] ml-2">{formatLifespan(c)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {siblings.length > 0 && (
        <section className="mt-6">
          <h2 className="govuk-heading-m">Siblings</h2>
          <ul className="govuk-list govuk-list--bullet">
            {siblings.map(s => (
              <li key={s.id}>
                <button type="button" onClick={() => navTo(s.id)} className="govuk-link">
                  {formatDisplayName(s)}
                </button>
                <span className="govuk-body-s text-[#505a5f] ml-2">{formatLifespan(s)}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {person.notes.length > 0 && (
        <section className="mt-6">
          <h2 className="govuk-heading-m">Notes</h2>
          {person.notes.map((note, i) => (
            <p key={i} className="govuk-body">{note}</p>
          ))}
        </section>
      )}

      {/* Actions */}
      <div className="flex gap-3 mt-8">
        <Link href={treeUrl} className="govuk-button govuk-button--secondary">
          ← View in tree
        </Link>
      </div>
    </div>
  )
}
