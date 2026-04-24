import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, provide } from 'vue'
import VTr from '../src/VTr'
import { storeKey } from '../src/VTable'
import { Store } from '../src/Store'

const row = { id: 1, name: 'Alice' }

function mountVTr(storeOptions: Partial<{ selectOnClick: boolean; selectionMode: string }> = {}) {
  const Wrapper = defineComponent({
    setup() {
      const store = new Store((() => {}) as any)
      store.state.data = [row]
      store.state.selectOnClick = storeOptions.selectOnClick ?? true
      store.state.selectedClass = 'vt-selected'
      if (storeOptions.selectionMode) {
        store.state.selectionMode = storeOptions.selectionMode as any
      }
      provide(storeKey, store)
      // Use the reactive version of the row (as VTable would in practice)
      const reactiveRow = store.state.data[0]
      return { store, reactiveRow }
    },
    render() {
      return h('table', [
        h('tbody', [
          h(VTr, { row: this.reactiveRow }, {
            default: (props: any) => [
              h('td', `${row.name} ${props.isSelected ? '(selected)' : ''}`),
            ],
          }),
        ]),
      ])
    },
  })

  return mount(Wrapper)
}

describe('VTr', () => {
  it('renders a tr element', () => {
    const wrapper = mountVTr()
    expect(wrapper.find('tr').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountVTr()
    expect(wrapper.find('td').text()).toContain('Alice')
  })

  it('applies cursor pointer when selectOnClick is true', () => {
    const wrapper = mountVTr({ selectOnClick: true })
    const tr = wrapper.find('tr')
    expect(tr.attributes('style')).toContain('cursor')
  })

  it('does not apply cursor pointer when selectOnClick is false', () => {
    const wrapper = mountVTr({ selectOnClick: false })
    const tr = wrapper.find('tr')
    const style = tr.attributes('style') || ''
    expect(style).not.toContain('cursor')
  })

  it('selects row on td click', async () => {
    const wrapper = mountVTr({ selectOnClick: true })
    const td = wrapper.find('td')
    await td.trigger('click')
    await nextTick()
    expect(wrapper.vm.store.state.selectedRows).toHaveLength(1)
    expect(wrapper.vm.store.state.selectedRows[0]).toEqual(row)
  })

  it('deselects row on second td click', async () => {
    const wrapper = mountVTr({ selectOnClick: true })
    const td = wrapper.find('td')
    await td.trigger('click')
    await nextTick()
    await td.trigger('click')
    await nextTick()
    expect(wrapper.vm.store.state.selectedRows).not.toContain(row)
  })

  it('applies selected class when row is selected', async () => {
    const wrapper = mountVTr({ selectOnClick: true })
    const td = wrapper.find('td')
    await td.trigger('click')
    await nextTick()
    await nextTick()
    await nextTick()
    expect(wrapper.html()).toContain('vt-selected')
  })
})
