import { parse } from 'parse-gedcom'
import type { GedcomDatabase, Individual, Family, GedcomEvent, GedcomDate } from './gedcom.types'

interface GedcomNode {
  tag: string
  data: string
  tree: GedcomNode[]
}

function stripAt(id: string): string {
  return id.replace(/@/g, '').trim()
}

function parseDate(raw: string): GedcomDate {
  const qualifiers = ['ABT', 'BEF', 'AFT', 'EST', 'CAL'] as const
  let qualifier: GedcomDate['qualifier']
  let rest = raw.trim()

  for (const q of qualifiers) {
    if (rest.startsWith(q + ' ')) {
      qualifier = q
      rest = rest.slice(q.length + 1).trim()
      break
    }
  }

  const months: Record<string, number> = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
    JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12,
  }

  const parts = rest.split(' ')
  let day: number | undefined
  let month: number | undefined
  let year: number | undefined

  for (const part of parts) {
    const num = parseInt(part, 10)
    if (!isNaN(num)) {
      if (num > 31) year = num
      else if (day === undefined) day = num
    } else if (months[part.toUpperCase()]) {
      month = months[part.toUpperCase()]
    }
  }

  return { raw, qualifier, day, month, year }
}

function parseName(raw: string): Individual['nameParts'] {
  const match = raw.match(/^(.*?)\s*\/(.+?)\/\s*(.*)$/)
  if (match) {
    return {
      given: match[1].trim(),
      surname: match[2].trim(),
      suffix: match[3].trim(),
    }
  }
  return { given: raw.trim(), surname: '', suffix: '' }
}

function getTag(nodes: GedcomNode[], tag: string): GedcomNode | undefined {
  return nodes.find(n => n.tag === tag)
}

function getTags(nodes: GedcomNode[], tag: string): GedcomNode[] {
  return nodes.filter(n => n.tag === tag)
}

function parseEvent(node: GedcomNode): GedcomEvent {
  const dateNode = getTag(node.tree, 'DATE')
  const placeNode = getTag(node.tree, 'PLAC')
  const noteNode = getTag(node.tree, 'NOTE')
  return {
    date: dateNode?.data ? parseDate(dateNode.data) : undefined,
    place: placeNode?.data,
    note: noteNode?.data,
  }
}

function parseIndividual(node: GedcomNode): Individual {
  const id = stripAt(node.data)
  const nameNode = getTag(node.tree, 'NAME')
  const nameRaw = nameNode?.data ?? ''
  const nameParts = parseName(nameRaw)
  const sexNode = getTag(node.tree, 'SEX')
  const sex = sexNode?.data as Individual['sex'] | undefined

  const birthNode = getTag(node.tree, 'BIRT')
  const deathNode = getTag(node.tree, 'DEAT')

  const familyAsSpouse = getTags(node.tree, 'FAMS').map(n => stripAt(n.data))
  const familyAsChild = getTags(node.tree, 'FAMC').map(n => stripAt(n.data))

  const notes = getTags(node.tree, 'NOTE').map(n => n.data).filter(Boolean)

  return {
    id,
    name: nameRaw,
    nameParts,
    sex,
    birth: birthNode ? parseEvent(birthNode) : undefined,
    death: deathNode ? parseEvent(deathNode) : undefined,
    familyAsSpouse,
    familyAsChild,
    notes,
  }
}

function parseFamily(node: GedcomNode): Family {
  const id = stripAt(node.data)
  const husbNode = getTag(node.tree, 'HUSB')
  const wifeNode = getTag(node.tree, 'WIFE')
  const childNodes = getTags(node.tree, 'CHIL')
  const marrNode = getTag(node.tree, 'MARR')
  const divNode = getTag(node.tree, 'DIV')

  return {
    id,
    husbandId: husbNode ? stripAt(husbNode.data) : undefined,
    wifeId: wifeNode ? stripAt(wifeNode.data) : undefined,
    childIds: childNodes.map(n => stripAt(n.data)),
    marriage: marrNode ? parseEvent(marrNode) : undefined,
    divorce: divNode ? parseEvent(divNode) : undefined,
  }
}

export function parseGedcom(content: string, fileName: string): GedcomDatabase {
  const nodes: GedcomNode[] = parse(content)

  const individuals = new Map<string, Individual>()
  const families = new Map<string, Family>()

  for (const node of nodes) {
    if (node.tag === 'INDI') {
      const ind = parseIndividual(node)
      individuals.set(ind.id, ind)
    } else if (node.tag === 'FAM') {
      const fam = parseFamily(node)
      families.set(fam.id, fam)
    }
  }

  return { individuals, families, fileName }
}
