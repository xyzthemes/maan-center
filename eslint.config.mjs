// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt(
  {
    ignores: ['.tmp/**', '.remember/**', 'prisma/generated/**']
  },
  {
    files: ['app/layouts/**/*.vue', 'app/pages/**/*.vue'],
    rules: {
      'vue/no-multiple-template-root': 'off'
    }
  }
)
