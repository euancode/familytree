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

const sexColour: Record<string, string> = {
  M: '#1d70b8',
  F: '#d63ac3',
}

export function PersonNode({ individual, isSelected, role = 'default', onClick }: Props) {
  const lifespan = formatLifespan(individual)
  const sex = individual.sex ?? ''
  const sexIcon = sex === 'M' ? '♂' : sex === 'F' ? '♀' : ''

  return (
    <button
      type="button"
      onClick={() => onClick(individual.id)}
      style={{ width: '148px', padding: '4px 6px' }}
      className={`person-node text-left border-2 rounded ${roleStyles[role]} ${isSelected ? 'person-node-selected' : ''}`}
      aria-label={`${formatDisplayName(individual)}${lifespan ? ', ' + lifespan : ''}`}
      aria-pressed={isSelected}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '2px' }}>
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#0b0c0c', lineHeight: '1.2', wordBreak: 'break-word', fontFamily: 'Arial, sans-serif' }}>
          {individual.nameParts.given || '?'}
        </span>
        {sexIcon && (
          <span style={{ fontSize: '12px', flexShrink: 0, color: sexColour[sex] ?? '#505a5f' }}>
            {sexIcon}
          </span>
        )}
      </div>
      {individual.nameParts.surname && (
        <div style={{ fontSize: '10px', color: '#505a5f', textTransform: 'uppercase', lineHeight: '1.2', fontFamily: 'Arial, sans-serif' }}>
          {individual.nameParts.surname}
        </div>
      )}
      {lifespan && (
        <div style={{ fontSize: '10px', color: '#505a5f', marginTop: '2px', fontFamily: 'Arial, sans-serif' }}>
          {lifespan}
        </div>
      )}
    </button>
  )
}

export function EmptyNode() {
  return (
    <div style={{ width: '148px', height: '44px', border: '2px dashed #b1b4b6', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ fontSize: '10px', color: '#505a5f', fontFamily: 'Arial, sans-serif' }}>Unknown</span>
    </div>
  )
}
