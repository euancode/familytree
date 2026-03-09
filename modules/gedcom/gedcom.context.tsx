'use client'
import { createContext, useContext, useReducer, type ReactNode } from 'react'
import type { GedcomState, GedcomAction, GedcomDatabase } from './gedcom.types'

const initialState: GedcomState = {
  db: null,
  selectedId: null,
}

function reducer(state: GedcomState, action: GedcomAction): GedcomState {
  switch (action.type) {
    case 'LOAD':
      return { db: action.db, selectedId: null }
    case 'SELECT_PERSON':
      return { ...state, selectedId: action.id }
    case 'CLEAR':
      return initialState
    default:
      return state
  }
}

type GedcomContextType = {
  state: GedcomState
  dispatch: React.Dispatch<GedcomAction>
}

const GedcomContext = createContext<GedcomContextType | null>(null)

export function GedcomProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <GedcomContext.Provider value={{ state, dispatch }}>
      {children}
    </GedcomContext.Provider>
  )
}

export function useGedcom() {
  const ctx = useContext(GedcomContext)
  if (!ctx) throw new Error('useGedcom must be used within GedcomProvider')
  return ctx
}
