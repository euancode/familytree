declare module 'parse-gedcom' {
  export interface GedcomNode {
    type: string
    value?: string
    data: {
      xref_id?: string
      pointer?: string
      formal_name?: string
      custom_tag?: boolean
    }
    children: GedcomNode[]
  }
  export interface GedcomRoot {
    type: 'root'
    children: GedcomNode[]
    data: Record<string, unknown>
    value?: string
  }
  export function parse(input: string): GedcomRoot
}
