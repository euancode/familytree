import { parse } from 'parse-gedcom'
import type { GedcomNode } from 'parse-gedcom'
import type { GedcomDatabase, Individual, Family, GedcomEvent, GedcomDate } from './gedcom.types'

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

function getChild(nodes: GedcomNode[], type: string): GedcomNode | undefined {
  return nodes.find(n => n.type === type)
}

function getChildren(nodes: GedcomNode[], type: string): GedcomNode[] {
  return nodes.filter(n => n.type === type)
}

function parseEvent(node: GedcomNode): GedcomEvent {
  const dateNode = getChild(node.children, 'DATE')
  const placeNode = getChild(node.children, 'PLAC')
  const noteNode = getChild(node.children, 'NOTE')
  return {
    date: dateNode?.value ? parseDate(dateNode.value) : undefined,
    place: placeNode?.value,
    note: noteNode?.value,
  }
}

function parseIndividual(node: GedcomNode): Individual {
  const id = stripAt(node.data.xref_id ?? '')
  const nameNode = getChild(node.children, 'NAME')
  const nameRaw = nameNode?.value ?? ''
  const nameParts = parseName(nameRaw)
  const sexNode = getChild(node.children, 'SEX')
  const sex = sexNode?.value as Individual['sex'] | undefined

  const birthNode = getChild(node.children, 'BIRT')
  const deathNode = getChild(node.children, 'DEAT')

  // FAMS/FAMC store the family xref as data.pointer
  const familyAsSpouse = getChildren(node.children, 'FAMS')
    .map(n => stripAt(n.data.pointer ?? n.value ?? ''))
    .filter(Boolean)

  const familyAsChild = getChildren(node.children, 'FAMC')
    .map(n => stripAt(n.data.pointer ?? n.value ?? ''))
    .filter(Boolean)

  const notes = getChildren(node.children, 'NOTE')
    .map(n => n.value ?? '')
    .filter(Boolean)

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
  const id = stripAt(node.data.xref_id ?? '')

  const husbNode = getChild(node.children, 'HUSB')
  const wifeNode = getChild(node.children, 'WIFE')
  const childNodes = getChildren(node.children, 'CHIL')
  const marrNode = getChild(node.children, 'MARR')
  const divNode = getChild(node.children, 'DIV')

  return {
    id,
    husbandId: husbNode ? stripAt(husbNode.data.pointer ?? husbNode.value ?? '') : undefined,
    wifeId: wifeNode ? stripAt(wifeNode.data.pointer ?? wifeNode.value ?? '') : undefined,
    childIds: childNodes.map(n => stripAt(n.data.pointer ?? n.value ?? '')).filter(Boolean),
    marriage: marrNode ? parseEvent(marrNode) : undefined,
    divorce: divNode ? parseEvent(divNode) : undefined,
  }
}

export function parseGedcom(content: string, fileName: string): GedcomDatabase {
  const root = parse(content)

  const individuals = new Map<string, Individual>()
  const families = new Map<string, Family>()

  for (const node of root.children) {
    if (node.type === 'INDI') {
      const ind = parseIndividual(node)
      if (ind.id) individuals.set(ind.id, ind)
    } else if (node.type === 'FAM') {
      const fam = parseFamily(node)
      if (fam.id) families.set(fam.id, fam)
    }
  }

  return { individuals, families, fileName }
}
