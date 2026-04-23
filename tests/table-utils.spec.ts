import { describe, it, expect } from 'vitest'
import {
  getPropertyValue,
  isNumeric,
  doSort,
  doFilter,
  passFilter,
  doPaginate,
  calculateTotalPages,
} from '../src/table-utils'
import { SortOrder } from '../src/types'

describe('getPropertyValue', () => {
  const obj = { name: 'Alice', address: { state: 'CA', zip: '90210' }, tags: ['a', 'b'] }

  it('gets top-level property', () => {
    expect(getPropertyValue(obj, 'name')).toBe('Alice')
  })

  it('gets nested property via dot notation', () => {
    expect(getPropertyValue(obj, 'address.state')).toBe('CA')
  })

  it('gets array element via bracket notation', () => {
    expect(getPropertyValue(obj, 'tags[0]')).toBe('a')
  })

  it('returns undefined for missing key', () => {
    expect(getPropertyValue(obj, 'nonexistent')).toBeUndefined()
  })

  it('returns undefined for deeply missing key', () => {
    expect(getPropertyValue(obj, 'address.city')).toBeUndefined()
  })
})

describe('isNumeric', () => {
  it('returns true for numbers', () => {
    expect(isNumeric(42)).toBe(true)
    expect(isNumeric(3.14)).toBe(true)
    expect(isNumeric(0)).toBe(true)
  })

  it('returns true for numeric strings', () => {
    expect(isNumeric('42')).toBe(true)
    expect(isNumeric('3.14')).toBe(true)
  })

  it('returns false for non-numeric values', () => {
    expect(isNumeric('abc')).toBe(false)
    expect(isNumeric(NaN)).toBe(false)
    expect(isNumeric(Infinity)).toBe(false)
    expect(isNumeric([1])).toBe(false)
    expect(isNumeric(null)).toBe(false)
  })
})

describe('doSort', () => {
  const data = [
    { name: 'Charlie', age: 30 },
    { name: 'Alice', age: 25 },
    { name: 'Bob', age: 35 },
  ]

  it('sorts by string key ascending', () => {
    const result = doSort(data, 'name', null, SortOrder.ASC)
    expect(result.map(r => r.name)).toEqual(['Alice', 'Bob', 'Charlie'])
  })

  it('sorts by string key descending', () => {
    const result = doSort(data, 'name', null, SortOrder.DESC)
    expect(result.map(r => r.name)).toEqual(['Charlie', 'Bob', 'Alice'])
  })

  it('sorts by numeric key ascending', () => {
    const result = doSort(data, 'age', null, SortOrder.ASC)
    expect(result.map(r => r.age)).toEqual([25, 30, 35])
  })

  it('sorts by numeric key descending', () => {
    const result = doSort(data, 'age', null, SortOrder.DESC)
    expect(result.map(r => r.age)).toEqual([35, 30, 25])
  })

  it('sorts with custom sort function', () => {
    const customSort = (a: any, b: any, order: number) => (a.age - b.age) * order
    const result = doSort(data, null, customSort, SortOrder.DESC)
    expect(result.map(r => r.age)).toEqual([35, 30, 25])
  })

  it('sorts with sortKey as function', () => {
    const sortKeyFn = (obj: any) => obj.name.length
    const result = doSort(data, sortKeyFn, null, SortOrder.ASC)
    expect(result.map(r => r.name)).toEqual(['Bob', 'Alice', 'Charlie'])
  })

  it('does not mutate the original array', () => {
    const original = [...data]
    doSort(data, 'name', null, SortOrder.ASC)
    expect(data).toEqual(original)
  })
})

describe('doFilter', () => {
  const data = [
    { name: 'Alice', age: 25, address: { state: 'CA' } },
    { name: 'Bob', age: 30, address: { state: 'NY' } },
    { name: 'Charlie', age: 35, address: { state: 'CA' } },
  ]

  it('filters by basic filter (partial match)', () => {
    const result = doFilter(data, {
      name: { value: 'ali', keys: ['name'] },
    })
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('Alice')
  })

  it('filters by basic filter (exact match)', () => {
    const result = doFilter(data, {
      name: { value: 'Alice', keys: ['name'], exact: true },
    })
    expect(result).toHaveLength(1)
  })

  it('exact match rejects partial', () => {
    const result = doFilter(data, {
      name: { value: 'Ali', keys: ['name'], exact: true },
    })
    expect(result).toHaveLength(0)
  })

  it('filters by nested key', () => {
    const result = doFilter(data, {
      state: { value: 'CA', keys: ['address.state'] },
    })
    expect(result).toHaveLength(2)
  })

  it('filters with custom filter function', () => {
    const result = doFilter(data, {
      age: { value: 30, custom: (val, row) => row.age >= val },
    })
    expect(result).toHaveLength(2)
    expect(result.map(r => r.name)).toEqual(['Bob', 'Charlie'])
  })

  it('returns all when filter value is empty', () => {
    const result = doFilter(data, {
      name: { value: '', keys: ['name'] },
    })
    expect(result).toHaveLength(3)
  })
})

describe('passFilter', () => {
  const item = { name: 'Alice', age: 25 }

  it('passes when filter value is empty', () => {
    expect(passFilter(item, { value: '', keys: ['name'] })).toBe(true)
  })

  it('passes when filter value is null', () => {
    expect(passFilter(item, { value: null as any, keys: ['name'] })).toBe(true)
  })

  it('fails when no key matches', () => {
    expect(passFilter(item, { value: 'Bob', keys: ['name'] })).toBe(false)
  })

  it('passes custom filter', () => {
    expect(passFilter(item, { custom: (_val, row) => row.age > 20 })).toBe(true)
  })

  it('fails custom filter', () => {
    expect(passFilter(item, { custom: (_val, row) => row.age > 30 })).toBe(false)
  })
})

describe('doPaginate', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

  it('returns first page', () => {
    expect(doPaginate(data, 3, 1)).toEqual([1, 2, 3])
  })

  it('returns second page', () => {
    expect(doPaginate(data, 3, 2)).toEqual([4, 5, 6])
  })

  it('returns last page (partial)', () => {
    expect(doPaginate(data, 3, 4)).toEqual([10])
  })

  it('returns all when page size exceeds data', () => {
    expect(doPaginate(data, 20, 1)).toEqual(data)
  })

  it('returns all when page size is 0', () => {
    expect(doPaginate(data, 0, 1)).toEqual(data)
  })

  it('returns all when current page is 0', () => {
    expect(doPaginate(data, 3, 0)).toEqual(data)
  })
})

describe('calculateTotalPages', () => {
  it('returns 1 when items fit in one page', () => {
    expect(calculateTotalPages(5, 10)).toBe(1)
  })

  it('returns correct pages for exact division', () => {
    expect(calculateTotalPages(10, 5)).toBe(2)
  })

  it('rounds up for partial pages', () => {
    expect(calculateTotalPages(11, 5)).toBe(3)
  })

  it('returns 1 when items equal page size', () => {
    expect(calculateTotalPages(10, 10)).toBe(1)
  })
})
