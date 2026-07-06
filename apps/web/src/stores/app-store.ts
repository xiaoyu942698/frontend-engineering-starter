import { defineStore } from 'pinia';

/**
 * UI preference store for shell-level controls that are independent of a feature module.
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    density: 'comfortable' as 'comfortable' | 'compact',
    inspectorOpen: true
  }),
  actions: {
    setDensity(density: 'comfortable' | 'compact') {
      this.density = density;
    },
    toggleInspector() {
      this.inspectorOpen = !this.inspectorOpen;
    }
  }
});
