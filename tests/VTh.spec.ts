import { describe, it, expect } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import { defineComponent, h, nextTick, provide } from 'vue'
import VTh from '../src/VTh'
import { storeKey } from '../src/VTable'
import { Store } from '../src/Store'

function mountVTh(props: Record<string, any> = {}, slotContent = 'Name') {
  const emit = () => {}

  const Wrapper = defineComponent({
    setup() {
      const store = new Store(emit as any)
      store.state.data = [{ name: 'Alice' }]
      provide(storeKey, store)
      return { store }
    },
    render() {
      return h('table', [
        h('thead', [
          h(VTh, { sortKey: 'name', ...props }, {
            default: () => slotContent,
          }),
        ]),
      ])
    },
  })

  return mount(Wrapper)
}

describe('VTh', () => {
  it('renders a th element', () => {
    const wrapper = mountVTh()
    expect(wrapper.find('th.v-th').exists()).toBe(true)
  })

  it('renders slot content', () => {
    const wrapper = mountVTh()
    expect(wrapper.find('th').text()).toContain('Name')
  })

  it('shows sort icons by default', () => {
    const wrapper = mountVTh()
    expect(wrapper.find('svg').exists()).toBe(true)
  })

  it('hides sort icons when hideSortIcons is set', () => {
    const Wrapper = defineComponent({
      setup() {
        const store = new Store((() => {}) as any)
        store.state.data = [{ name: 'Alice' }]
        store.state.hideSortIcons = true
        provide(storeKey, store)
      },
      render() {
        return h('table', [
          h('thead', [
            h(VTh, { sortKey: 'name' }, { default: () => 'Name' }),
          ]),
        ])
      },
    })

    const wrapper = mount(Wrapper)
    expect(wrapper.find('svg').exists()).toBe(false)
  })

  it('responds to click for sorting', async () => {
    const wrapper = mountVTh()
    const th = wrapper.find('th.v-th')
    await th.trigger('click')
    await nextTick()
    // After first click, sorting should be applied
    expect(wrapper.vm.store.state.sortKey).toBe('name')
  })
})
