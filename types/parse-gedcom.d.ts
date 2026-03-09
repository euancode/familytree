declare module 'parse-gedcom' {
  export interface GedcomNode {
    tag: string
    data: string
    tree: GedcomNode[]
  }
  export function parse(input: string): GedcomNode[]
}
