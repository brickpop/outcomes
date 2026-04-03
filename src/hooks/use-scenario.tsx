import { createContext, useContext, useEffect, useReducer, type ReactNode } from 'react'
import type { Scenario, Option, Factor } from '@/types/scenario'
import { setAlignment, setDrift } from '@/lib/scenario'
import { generateId } from '@/lib/id'
import { loadScenario, saveScenario } from '@/lib/storage'

type Action =
  | { type: 'SET_SCENARIO'; scenario: Scenario }
  | { type: 'SET_NAME'; name: string }
  | { type: 'ADD_OPTION'; option?: Partial<Option> }
  | { type: 'UPDATE_OPTION'; id: string; changes: Partial<Option> }
  | { type: 'REMOVE_OPTION'; id: string }
  | { type: 'MOVE_OPTION'; id: string; direction: 'up' | 'down' }
  | { type: 'ADD_FACTOR'; factor?: Partial<Factor> }
  | { type: 'UPDATE_FACTOR'; id: string; changes: Partial<Factor> }
  | { type: 'REMOVE_FACTOR'; id: string }
  | { type: 'MOVE_FACTOR'; id: string; direction: 'up' | 'down' }
  | { type: 'SORT_FACTORS' }
  | { type: 'SET_ALIGNMENT'; optionId: string; factorId: string; value: number }
  | { type: 'SET_DRIFT'; optionId: string; factorId: string; drift: number }

const OPTION_COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#06b6d4', '#f97316', '#6366f1', '#14b8a6',
]

function reducer(state: Scenario, action: Action): Scenario {
  const now = new Date().toISOString()

  switch (action.type) {
    case 'SET_SCENARIO':
      return action.scenario

    case 'SET_NAME':
      return { ...state, name: action.name, updatedAt: now }

    case 'ADD_OPTION': {
      const option: Option = {
        id: generateId(),
        name: action.option?.name ?? `Option ${state.options.length + 1}`,
        color: action.option?.color ?? OPTION_COLORS[state.options.length % OPTION_COLORS.length],
      }
      return { ...state, options: [...state.options, option], updatedAt: now }
    }

    case 'UPDATE_OPTION':
      return {
        ...state,
        options: state.options.map(o =>
          o.id === action.id ? { ...o, ...action.changes } : o
        ),
        updatedAt: now,
      }

    case 'REMOVE_OPTION':
      return {
        ...state,
        options: state.options.filter(o => o.id !== action.id),
        alignments: state.alignments.filter(a => a.optionId !== action.id),
        updatedAt: now,
      }

    case 'MOVE_OPTION': {
      const idx = state.options.findIndex(o => o.id === action.id)
      const target = action.direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= state.options.length) return state
      const options = [...state.options]
      ;[options[idx], options[target]] = [options[target], options[idx]]
      return { ...state, options, updatedAt: now }
    }

    case 'ADD_FACTOR': {
      const factor: Factor = {
        id: generateId(),
        name: action.factor?.name ?? `Factor ${state.factors.length + 1}`,
        priority: action.factor?.priority ?? 0.5,
      }
      return { ...state, factors: [...state.factors, factor], updatedAt: now }
    }

    case 'UPDATE_FACTOR':
      return {
        ...state,
        factors: state.factors.map(f =>
          f.id === action.id ? { ...f, ...action.changes } : f
        ),
        updatedAt: now,
      }

    case 'REMOVE_FACTOR':
      return {
        ...state,
        factors: state.factors.filter(f => f.id !== action.id),
        alignments: state.alignments.filter(a => a.factorId !== action.id),
        updatedAt: now,
      }

    case 'MOVE_FACTOR': {
      const idx = state.factors.findIndex(f => f.id === action.id)
      const target = action.direction === 'up' ? idx - 1 : idx + 1
      if (target < 0 || target >= state.factors.length) return state
      const factors = [...state.factors]
      ;[factors[idx], factors[target]] = [factors[target], factors[idx]]
      return { ...state, factors, updatedAt: now }
    }

    case 'SORT_FACTORS':
      return {
        ...state,
        factors: [...state.factors].sort((a, b) => b.priority - a.priority),
        updatedAt: now,
      }

    case 'SET_ALIGNMENT':
      return {
        ...state,
        alignments: setAlignment(state.alignments, action.optionId, action.factorId, action.value),
        updatedAt: now,
      }

    case 'SET_DRIFT':
      return {
        ...state,
        alignments: setDrift(state.alignments, action.optionId, action.factorId, action.drift),
        updatedAt: now,
      }

    default:
      return state
  }
}

interface ScenarioContextValue {
  scenario: Scenario
  dispatch: React.Dispatch<Action>
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null)

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [scenario, dispatch] = useReducer(reducer, null, loadScenario)

  useEffect(() => {
    const timer = setTimeout(() => saveScenario(scenario), 300)
    return () => clearTimeout(timer)
  }, [scenario])

  return (
    <ScenarioContext.Provider value={{ scenario, dispatch }}>
      {children}
    </ScenarioContext.Provider>
  )
}

export function useScenario() {
  const ctx = useContext(ScenarioContext)
  if (!ctx) throw new Error('useScenario must be used within ScenarioProvider')
  return ctx
}
