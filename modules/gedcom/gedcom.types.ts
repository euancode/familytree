export type GedcomDate = {
  raw: string
  year?: number
  month?: number
  day?: number
  qualifier?: 'ABT' | 'BEF' | 'AFT' | 'EST' | 'CAL'
}

export type GedcomEvent = {
  date?: GedcomDate
  place?: string
  note?: string
}

export type Individual = {
  id: string
  name: string
  nameParts: {
    given: string
    surname: string
    suffix: string
  }
  sex?: 'M' | 'F' | 'U'
  birth?: GedcomEvent
  death?: GedcomEvent
  familyAsSpouse: string[]
  familyAsChild: string[]
  notes: string[]
}

export type Family = {
  id: string
  husbandId?: string
  wifeId?: string
  childIds: string[]
  marriage?: GedcomEvent
  divorce?: GedcomEvent
}

export type GedcomDatabase = {
  individuals: Map<string, Individual>
  families: Map<string, Family>
  fileName: string
}

export type GedcomState = {
  db: GedcomDatabase | null
  selectedId: string | null
}

export type GedcomAction =
  | { type: 'LOAD'; db: GedcomDatabase }
  | { type: 'SELECT_PERSON'; id: string }
  | { type: 'CLEAR' }
