export interface Scenario {
  id: string
  name: string
  createdAt: string
  updatedAt: string

  options: Option[]
  factors: Factor[]
  alignments: Alignment[]
}

export interface Option {
  id: string
  name: string
  color?: string
}

export interface Factor {
  id: string
  name: string
  notes?: string
  priority: number     // 0 to 1
  uncertainty: number  // 0 to 1 — causes score to decay over time; mutually exclusive with momentum
  momentum: number     // 0 to 1 — causes score to grow over time (5x max at t=10); mutually exclusive with uncertainty
}

export interface Alignment {
  optionId: string
  factorId: string
  value: number        // -1 to 1
}
