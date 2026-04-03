export interface Scenario {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string

  options: Option[]
  factors: Factor[]
  alignments: Alignment[]
}

export interface Option {
  id: string
  name: string
  description?: string
  color?: string
}

export interface Factor {
  id: string
  name: string
  notes?: string
  priority: number     // 0 to 1
  uncertainty: number  // 0 to 1
}

export interface Alignment {
  optionId: string
  factorId: string
  value: number        // -1 to 1
}
