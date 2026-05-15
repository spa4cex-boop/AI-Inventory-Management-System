export interface MetricCard {
  title: string
  value: string
  delta: string
}

export interface ChartPoint {
  name: string
  value: number
}

export interface ProductSummary {
  id: number
  name: string
  quantity: number
  reorder_level: number
}
