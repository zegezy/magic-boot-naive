import { defineAsyncComponent } from 'vue'

const components = import.meta.glob('./**/*.vue')
export function setupComponents(app) {
  for (const [key, value] of Object.entries(components)) {
    const name = key.substring(key.lastIndexOf('/') + 1, key.lastIndexOf('.'))
    app.component(name, defineAsyncComponent(value))
  }
}
