import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, ref, nextTick } from 'vue'
import VTable from '../src/VTable'

const testData = [
  { id: 1, name: 'Alice', age: 25 },
  { id: 2, name: 'Bob', age: 30 },
  { id: 3, name: 'Charlie', age: 35 },
]

describe('VTable', () => {
  it('renders a table element', () => {
    const wrapper = mount(VTable, {
      props: { data: testData },
      slots: {
        head: () => h('tr', [h('th', 'Name')]),
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    expect(wrapper.find('table.smart-table').exists()).toBe(true)
    expect(wrapper.find('thead').exists()).toBe(true)
    expect(wrapper.find('tbody').exists()).toBe(true)
  })

  it('passes rows to body slot', () => {
    const wrapper = mount(VTable, {
      props: { data: testData },
      slots: {
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    const tds = wrapper.findAll('td')
    expect(tds).toHaveLength(3)
    expect(tds[0].text()).toBe('Alice')
    expect(tds[1].text()).toBe('Bob')
    expect(tds[2].text()).toBe('Charlie')
  })

  it('emits stateChanged on mount', async () => {
    const wrapper = mount(VTable, {
      props: { data: testData },
      slots: {
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    await nextTick()
    const events = wrapper.emitted('stateChanged')
    expect(events).toBeTruthy()
    expect(events!.length).toBeGreaterThan(0)
  })

  it('applies pagination', async () => {
    const wrapper = mount(VTable, {
      props: { data: testData, pageSize: 2, currentPage: 1 },
      slots: {
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    await nextTick()
    const tds = wrapper.findAll('td')
    expect(tds).toHaveLength(2)
    expect(tds[0].text()).toBe('Alice')
    expect(tds[1].text()).toBe('Bob')
  })

  it('applies filters', async () => {
    const wrapper = mount(VTable, {
      props: {
        data: testData,
        filters: {
          name: { value: 'bob', keys: ['name'] },
        },
      },
      slots: {
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    await nextTick()
    const tds = wrapper.findAll('td')
    expect(tds).toHaveLength(1)
    expect(tds[0].text()).toBe('Bob')
  })

  it('exposes selectAll and deselectAll', async () => {
    const wrapper = mount(VTable, {
      props: { data: testData, selectionMode: 'multiple' },
      slots: {
        body: (props: any) =>
          props.rows.map((row: any) => h('tr', { key: row.id }, [h('td', row.name)])),
      },
    })

    const vm = wrapper.vm as any
    vm.selectAll()
    await nextTick()

    const state = wrapper.emitted('stateChanged')
    const lastState = state![state!.length - 1][0] as any
    expect(lastState.selectedRows).toHaveLength(3)

    vm.deselectAll()
    await nextTick()

    const state2 = wrapper.emitted('stateChanged')
    const lastState2 = state2![state2!.length - 1][0] as any
    expect(lastState2.selectedRows).toHaveLength(0)
  })
})
