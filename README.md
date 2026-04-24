# Vue3 Smart Table

[![npm version](https://img.shields.io/npm/v/vue3-smart-table-next.svg)](https://www.npmjs.com/package/vue3-smart-table-next)

> Vue 3 rewrite of [vuejs-smart-table](https://github.com/tochoromero/vuejs-smart-table). Removed `vue-demi`, targeting Vue 3.5+ only.

There are a lot of Data Table plugins out there, some of them are very good but pretty much all of them are very complicated to use.
What I really wanted was the simplicity of a vanilla HTML table but with the power of the more complex Data Table plugins.

Vue3 Smart Table is the answer to that need. Creating a Smart Table is almost as simply as creating a Vanilla HTML Table.
When you need it, you can enable extra functionality in a way that feels natural. It is very straight forward, you can learn everything you need to know on one sit.

## Changes from vuejs-smart-table

- Removed `vue-demi` — no longer supports Vue 2
- Requires **Vue 3.5+**
- Upgraded build toolchain: Vite 6, TypeScript 5, vue-tsc 2
- Uses Vue 3.5 `useId()` internally
- Added Vitest test suite

## Documentation
You can find the documentation [here](https://vue-smart-table.netlify.app).

## Installation
```
npm install vue3-smart-table-next
```

Then in your `main.js`
```js
import { createApp } from 'vue'
import SmartTable from 'vue3-smart-table-next'
import App from './App.vue'

const app = createApp(App)
app.use(SmartTable)
app.mount('#app')
```

This will globally register four Components: `VTable`, `VTh`, `VTr` and `VTPagination`
