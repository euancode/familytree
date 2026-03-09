import type { Individual } from '@/modules/gedcom/gedcom.types'
import { formatDisplayName, formatLifespan } from '@/modules/gedcom/gedcom.queries'

type Props = {
  individual: Individual
  isSelected?: boolean
  role?: 'ancestor' | 'descendant' | 'spouse' | 'default'
  onClick: (id: string) => void
}

const roleStyles: Record<string, string> = {
  ancestor:   'border-[#1d70b8] bg-[#f0f4fb]',
  descendant: 'border-[#00703c] bg-[#f0faf4]',
  spouse:     'border-[#912b88] bg-[#faf0f8]',
  default:    'border-[#b1b4b6] bg-white',
}

export function PersonNode({ individual, isSelected, role = 'default', onClick }: Props) {
  const displayName = formatDisplayName(individual)
  const lifespan = formatLifespan(individual)
  const sexIcon = individual.sex === 'M' ? '♂' : individual.sex === 'F' ? '♀' : ''

  return (
    <button
      type="button"
      onClick={() => onClick(individual.id)}
      className={`person-node w-36 text-left border-2 rounded p-2 ${roleStyles[role]} ${isSelected ? 'person-node-selected' : ''}`}
      aria-label={`${displayName}${lifespan ? ', ' + lifespan : ''}`}
      aria-pressed={isSelected}
    >
      <div className="flex items-start justify-between gap-1">
        <span className="govuk-body-s font-bold leading-tight text-[#0b0c0c] break-words" style={{ fontSize: '13px' }}>
          {individual.nameParts.given || '?'}
        </span>
        {sexIcon && <span className="text-[#505a5f] text-xs flex-shrink-0">{sexIcon}</span>}
      </div>
      {individual.nameParts.surname && (
        <div className="govuk-body-s text-[#505a5f] leading-tight uppercase" style={{ fontSize: '11px' }}>
          {individual.nameParts.surname}
        </div>
      )}
      {lifespan && (
        <div className="govuk-body-s text-[#505a5f] mt-1" style={{ fontSize: '11px' }}>
          {lifespan}
        </div>
      )}
    </button>
  )
}

export function EmptyNode() {
  return (
    <div className="w-36 h-16 border-2 border-dashed border-[#b1b4b6] rounded flex items-center justify-center">
      <span className="text-[#505a5f]" style={{ fontSize: '11px' }}>Unknown</span>
    </div>
  )
}
