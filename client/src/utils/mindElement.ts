import * as XLSX from 'xlsx'
import { toMindSlug } from './mindSlug'

export type MindElementRow = {
  id: string
  name: string
  group: string
  counts: Record<string, number>
  total?: number
}

// Legacy export kept for compatibility.
export const toMindIdSlug = (value: string): string => toMindSlug(value)

export async function loadMindElementRows(): Promise<MindElementRow[]> {
  const response = await fetch('/MindElement.xlsx')
  if (!response.ok) {
    throw new Error(`Failed to fetch MindElement.xlsx (status ${response.status})`)
  }

  const buffer = await response.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const sheetName = workbook.SheetNames[0]
  if (!sheetName) return []

  const sheet = workbook.Sheets[sheetName]
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, {
    header: 1,
    raw: false,
    blankrows: false,
  })

  if (rows.length < 3) return []

  const headerRow = rows[1] ?? []
  let currentGroup = ''
  const result: MindElementRow[] = []

  rows.slice(2).forEach((row) => {
    if (!Array.isArray(row)) return
    const [groupCell, nameCell, ...rest] = row

    if (typeof groupCell === 'string' && groupCell.trim()) {
      currentGroup = groupCell.trim()
    }

    const name = typeof nameCell === 'string' ? nameCell.trim() : ''
    if (!name) return

    const counts: Record<string, number> = {}
    rest.forEach((value, idx) => {
      const header = headerRow[idx + 2]
      const label = typeof header === 'string' ? header.trim() : ''
      const numeric = typeof value === 'string' && value.trim() === '' ? NaN : Number(value)
      if (!label || Number.isNaN(numeric)) return
      counts[label] = numeric
    })

    const totalValues = Object.values(counts)
    const total = totalValues.length ? totalValues.reduce((sum, val) => sum + val, 0) : undefined

    result.push({
      id: toMindSlug(name),
      name,
      group: currentGroup,
      counts,
      total,
    })
  })

  return result
}


