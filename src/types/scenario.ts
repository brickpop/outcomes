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
  priority: number  // 0 to 1
}

export interface Alignment {
  optionId: string
  factorId: string
  value: number  // -1 to 1 — how well this option delivers on this factor
  drift: number  // -1 to 1 — negative = uncertainty (decays), positive = momentum (grows), 0 = stable
}
