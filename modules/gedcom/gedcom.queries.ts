import type { GedcomDatabase, Individual, Family } from './gedcom.types'

export function getIndividual(db: GedcomDatabase, id: string): Individual | undefined {
  return db.individuals.get(id)
}

export function getFamily(db: GedcomDatabase, id: string): Family | undefined {
  return db.families.get(id)
}

export function getParents(db: GedcomDatabase, individual: Individual): { father?: Individual; mother?: Individual } {
  if (individual.familyAsChild.length === 0) return {}
  const fam = getFamily(db, individual.familyAsChild[0])
  if (!fam) return {}
  return {
    father: fam.husbandId ? getIndividual(db, fam.husbandId) : undefined,
    mother: fam.wifeId ? getIndividual(db, fam.wifeId) : undefined,
  }
}

export function getSpouses(db: GedcomDatabase, individual: Individual): Individual[] {
  const spouses: Individual[] = []
  for (const famId of individual.familyAsSpouse) {
    const fam = getFamily(db, famId)
    if (!fam) continue
    const spouseId = individual.sex === 'F' ? fam.husbandId : fam.wifeId
    if (spouseId) {
      const spouse = getIndividual(db, spouseId)
      if (spouse) spouses.push(spouse)
    } else {
      // Unknown sex — try both
      if (fam.husbandId && fam.husbandId !== individual.id) {
        const s = getIndividual(db, fam.husbandId)
        if (s) spouses.push(s)
      }
      if (fam.wifeId && fam.wifeId !== individual.id) {
        const s = getIndividual(db, fam.wifeId)
        if (s) spouses.push(s)
      }
    }
  }
  return spouses
}

export function getChildren(db: GedcomDatabase, individual: Individual): Individual[] {
  const children: Individual[] = []
  for (const famId of individual.familyAsSpouse) {
    const fam = getFamily(db, famId)
    if (!fam) continue
    for (const childId of fam.childIds) {
      const child = getIndividual(db, childId)
      if (child) children.push(child)
    }
  }
  return children
}

export function getSiblings(db: GedcomDatabase, individual: Individual): Individual[] {
  if (individual.familyAsChild.length === 0) return []
  const fam = getFamily(db, individual.familyAsChild[0])
  if (!fam) return []
  return fam.childIds
    .filter(id => id !== individual.id)
    .map(id => getIndividual(db, id))
    .filter((i): i is Individual => i !== undefined)
}

export function getAllIndividuals(db: GedcomDatabase): Individual[] {
  return Array.from(db.individuals.values()).sort((a, b) => {
    const surnameComp = a.nameParts.surname.localeCompare(b.nameParts.surname)
    if (surnameComp !== 0) return surnameComp
    return a.nameParts.given.localeCompare(b.nameParts.given)
  })
}

export function searchIndividuals(db: GedcomDatabase, query: string): Individual[] {
  const q = query.toLowerCase()
  return getAllIndividuals(db).filter(ind => {
    const full = `${ind.nameParts.given} ${ind.nameParts.surname}`.toLowerCase()
    return full.includes(q)
  })
}

export function formatDisplayName(individual: Individual): string {
  const { given, surname } = individual.nameParts
  if (given && surname) return `${given} ${surname}`
  if (surname) return surname
  if (given) return given
  return 'Unknown'
}

export function formatYear(individual: Individual): { birth?: number; death?: number } {
  return {
    birth: individual.birth?.date?.year,
    death: individual.death?.date?.year,
  }
}

export function formatLifespan(individual: Individual): string {
  const { birth, death } = formatYear(individual)
  if (birth && death) return `${birth}–${death}`
  if (birth) return `b. ${birth}`
  if (death) return `d. ${death}`
  return ''
}
