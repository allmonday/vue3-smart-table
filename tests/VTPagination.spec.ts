import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import VTPagination from '../src/VTPagination'

describe('VTPagination', () => {
  it('renders pagination nav', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    expect(wrapper.find('nav.vt-pagination').exists()).toBe(true)
    expect(wrapper.find('ul.pagination').exists()).toBe(true)
  })

  it('renders correct number of page links', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 5, directionLinks: false },
    })
    const items = wrapper.findAll('li.page-item')
    expect(items).toHaveLength(5)
  })

  it('marks active page', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 3, totalPages: 5, directionLinks: false },
    })
    const activeItems = wrapper.findAll('li.page-item.active')
    expect(activeItems).toHaveLength(1)
    expect(activeItems[0].text()).toBe('3')
  })

  it('emits update:currentPage on page click', async () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 5, directionLinks: false },
    })
    const pageLinks = wrapper.findAll('li.page-item a.page-link')
    await pageLinks[2].trigger('click') // click page 3
    expect(wrapper.emitted('update:currentPage')).toBeTruthy()
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([3])
  })

  it('hides when single page and hideSinglePage is true', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 1, hideSinglePage: true },
    })
    expect(wrapper.find('nav').exists()).toBe(false)
  })

  it('shows when single page and hideSinglePage is false', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 1, hideSinglePage: false },
    })
    expect(wrapper.find('nav.vt-pagination').exists()).toBe(true)
  })

  it('renders direction links by default', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 2, totalPages: 5 },
    })
    // 5 pages + 2 direction links (prev, next)
    const items = wrapper.findAll('li.page-item')
    expect(items).toHaveLength(7)
  })

  it('emits next page on next click', async () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 2, totalPages: 5 },
    })
    const items = wrapper.findAll('li.page-item')
    const nextLink = items[items.length - 1].find('a')
    await nextLink.trigger('click')
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([3])
  })

  it('emits previous page on previous click', async () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 3, totalPages: 5 },
    })
    const items = wrapper.findAll('li.page-item')
    const prevLink = items[0].find('a')
    await prevLink.trigger('click')
    expect(wrapper.emitted('update:currentPage')![0]).toEqual([2])
  })

  it('disables previous on first page', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 5 },
    })
    const items = wrapper.findAll('li.page-item')
    expect(items[0].classes()).toContain('disabled')
  })

  it('disables next on last page', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 5, totalPages: 5 },
    })
    const items = wrapper.findAll('li.page-item')
    expect(items[items.length - 1].classes()).toContain('disabled')
  })

  it('renders boundary links when enabled', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 3, totalPages: 5, boundaryLinks: true },
    })
    // 5 pages + 2 direction + 2 boundary = 9
    const items = wrapper.findAll('li.page-item')
    expect(items).toHaveLength(9)
  })

  it('respects maxPageLinks', () => {
    const wrapper = mount(VTPagination, {
      props: { currentPage: 1, totalPages: 10, maxPageLinks: 3, directionLinks: false },
    })
    const items = wrapper.findAll('li.page-item')
    // 3 page links + 1 ellipsis (...) = 4
    expect(items).toHaveLength(4)
  })
})
