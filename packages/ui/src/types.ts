/**
 * Visual status tone shared by UI primitives.
 */
export type UiTone = 'neutral' | 'primary' | 'success' | 'warning' | 'danger';

/**
 * Navigation item rendered by UiSurfaceNav.
 */
export type UiSurfaceNavItem = {
  id: string;
  label: string;
  description?: string;
  meta?: string;
};

/**
 * Label-value row rendered by UiKeyValueList.
 */
export type UiKeyValueItem = {
  label: string;
  value: string | number;
  tone?: UiTone;
};

/**
 * Timeline row rendered by UiTimeline.
 */
export type UiTimelineItem = {
  id: string;
  title: string;
  meta?: string;
  description?: string;
  code?: string;
  tone?: UiTone;
};
