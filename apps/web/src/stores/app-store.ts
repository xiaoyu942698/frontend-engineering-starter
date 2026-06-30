import { defineStore } from 'pinia';

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
