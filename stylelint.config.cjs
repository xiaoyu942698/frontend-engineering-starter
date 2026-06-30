const namespacePattern =
  '(?:ui|app|agent|studio|surface|task|message|session|workflow|audit|adapter|resource|catalog|approval|artifact|canvas|composer|overview|sidebar|brand|nav|capability|node|is|has|el|vue-flow|muted)';

module.exports = {
  extends: ['stylelint-config-standard', 'stylelint-config-standard-vue'],
  rules: {
    'alpha-value-notation': null,
    'color-function-alias-notation': null,
    'color-function-notation': null,
    'color-hex-length': null,
    'custom-property-empty-line-before': null,
    'declaration-empty-line-before': null,
    'import-notation': null,
    'media-feature-range-notation': null,
    'no-descending-specificity': null,
    'selector-class-pattern': [
      `^${namespacePattern}[a-z0-9]*(?:-[a-z0-9]+)*(?:__[a-z0-9]+(?:-[a-z0-9]+)*)?(?:--[a-z0-9]+(?:-[a-z0-9]+)*)?$`,
      {
        message:
          'Class selectors must use the approved namespace and kebab/BEM form: ui-*, app-*, feature-block, block__element, block--modifier, is-*, has-*.',
        resolveNestedSelectors: true
      }
    ],
    'value-keyword-case': null,
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['deep', 'global', 'slotted']
      }
    ]
  }
};
