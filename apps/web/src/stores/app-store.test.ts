import { beforeEach, describe, expect, it } from 'vitest';
import { createPinia, setActivePinia } from 'pinia';
import { useAppStore } from './app-store';

beforeEach(() => {
  setActivePinia(createPinia());
});

describe('app store', () => {
  it('updates density and inspector state', () => {
    const appStore = useAppStore();

    appStore.setDensity('compact');
    appStore.toggleInspector();

    expect(appStore.density).toBe('compact');
    expect(appStore.inspectorOpen).toBe(false);
  });
});
