import { getRequestURL } from 'h3'

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:html', (html, { event }) => {
    const pathname = getRequestURL(event).pathname
    const isArabic = pathname === '/ar' || pathname.startsWith('/ar/')
    const lang = isArabic ? 'ar' : 'en'
    const dir = isArabic ? 'rtl' : 'ltr'

    const htmlAttrs = html.htmlAttrs
      .map(attr => attr.replace(/\s*(lang|dir)=(["']).*?\2/g, '').trim())
      .filter(Boolean)

    html.htmlAttrs = [`lang="${lang}" dir="${dir}"`, ...htmlAttrs]
  })
})
