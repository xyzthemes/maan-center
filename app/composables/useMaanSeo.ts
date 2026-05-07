type MaanOgFallback = {
  title: string
  description: string
  eyebrow: string
  locale: 'en' | 'ar'
}

type MaanSeoOptions = {
  seo?: MaanSeo
  fallback: {
    title: string
    description: string
  }
  ogFallback: MaanOgFallback
  ogType?: 'website' | 'article'
  articlePublishedTime?: string
}

export const useMaanSeo = (options: MaanSeoOptions) => {
  const title = options.seo?.title || options.fallback.title
  const description = options.seo?.description || options.fallback.description
  const robots = [
    options.seo?.noIndex ? 'noindex' : 'index',
    options.seo?.noFollow ? 'nofollow' : 'follow'
  ].join(', ')

  if (options.seo?.title) {
    useHead({
      titleTemplate: '%s'
    })
  }

  if (options.seo?.canonicalUrl) {
    useHead({
      link: [
        { key: 'canonical', rel: 'canonical', href: options.seo.canonicalUrl }
      ]
    })
  }

  useSeoMeta({
    title,
    description,
    ogTitle: title,
    ogDescription: description,
    ogType: options.ogType,
    ogImage: options.seo?.ogImage,
    twitterImage: options.seo?.ogImage,
    robots,
    articlePublishedTime: options.articlePublishedTime
  })

  if (!options.seo?.ogImage) {
    defineOgImage('Maan', {
      title: options.ogFallback.title,
      description: options.ogFallback.description,
      eyebrow: options.ogFallback.eyebrow,
      locale: options.ogFallback.locale
    })
  }

  return {
    title,
    description,
    ogImage: options.seo?.ogImage
  }
}
