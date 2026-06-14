export type MaanPost = {
  slug: string
  locale: 'en' | 'ar'
  title: string
  description: string
  category: string
  publishedAt: string
  readTime: string
  image?: string
  content: string
  seo?: MaanSeo
  /** Category slugs the post is filed under (S13 related-posts selection). */
  categories?: string[]
}

export type MaanSeo = {
  title?: string
  description?: string
  ogImage?: string
  noIndex?: boolean
  noFollow?: boolean
  canonicalUrl?: string
  focusKeyphrase?: string
}

// Stored SEO shape on Post/Page (matches the JSON column written by the
// dashboard editors). Names are snake_case for parity with the original
// Directus shape — the dashboard composables still consume them as-is.
type StoredSeo = {
  title?: string
  meta_description?: string
  og_image?: string
  no_index?: boolean
  no_follow?: boolean
  canonical_url?: string
  focus_keyphrase?: string
}

type ApiPost = {
  id: string
  slug: string
  title: string
  description: string | null
  image: string | null
  content: string | null
  publishedAt: string | null
  createdAt: string
  seo: StoredSeo | null
  // Layer 1 taxonomy — present on every response since the migration.
  // Optional in the type so we don't break callers compiled against the
  // older shape while server endpoints catch up in a hot-reloaded dev
  // window.
  categories?: string[]
  placements?: string[]
}

export type GetPostsOptions = {
  /** Limit returned items (server clamps to [1, 50]). Defaults to 6. */
  limit?: number
  /** Filter to posts that include this placement id (e.g. 'homepage-featured'). */
  placement?: string
  /** Filter to posts that include this category id (e.g. 'autism'). */
  category?: string
  /** Free-text search over title + description (case-insensitive). */
  q?: string
  /** 1-based page index for "Load More" pagination. Defaults to 1. */
  page?: number
}

const fallbackPostsEn: MaanPost[] = [
  {
    slug: 'building-confident-routines-at-home',
    locale: 'en',
    title: 'Building Confident Routines at Home',
    description: 'Simple ways families can create predictable routines that support communication, learning, and independence.',
    category: 'Family Support',
    publishedAt: '2026-04-18T08:00:00.000Z',
    readTime: '4 min read',
    content: `
      <p>Children make steadier progress when home routines feel predictable, visual, and achievable. A clear morning, homework, or bedtime rhythm can reduce stress and help each child understand what comes next.</p>
      <h2>Start with one routine</h2>
      <p>Choose the part of the day that currently creates the most friction. Break it into three to five small steps, use the same language every time, and celebrate completion before adding complexity.</p>
      <h2>Use visual cues</h2>
      <p>Pictures, checklists, and first-then cards help children process expectations without relying only on verbal instructions. Keep the visuals close to where the routine happens.</p>
      <h2>Share what works</h2>
      <p>When families and educators use similar prompts and supports, children do not have to relearn expectations in each setting. A short note, photo, or message can keep everyone aligned.</p>
    `
  },
  {
    slug: 'how-early-assessment-guides-support',
    locale: 'en',
    title: 'How Early Assessment Guides Support',
    description: 'A practical look at how observation, family input, and specialist screening shape an individualized education plan.',
    category: 'Assessment',
    publishedAt: '2026-03-26T08:00:00.000Z',
    readTime: '5 min read',
    content: `
      <p>Assessment is most useful when it helps a team understand a child clearly: strengths, communication style, sensory preferences, learning needs, and the supports that unlock participation.</p>
      <h2>Families are part of the evidence</h2>
      <p>Parents and caregivers know what regulation, motivation, and frustration look like in daily life. Their observations help specialists interpret what they see in class or therapy.</p>
      <h2>Goals should be usable</h2>
      <p>Strong goals are specific, measurable, and connected to real routines: asking for help, joining group play, completing a transition, or using a communication tool independently.</p>
      <h2>Review progress often</h2>
      <p>Plans should change as children grow. Short review cycles help the team keep support relevant instead of waiting for a major milestone to adjust instruction.</p>
    `
  },
  {
    slug: 'supporting-communication-through-play',
    locale: 'en',
    title: 'Supporting Communication Through Play',
    description: 'Why structured play is a powerful setting for language, turn-taking, emotional regulation, and social confidence.',
    category: 'Therapy',
    publishedAt: '2026-02-14T08:00:00.000Z',
    readTime: '3 min read',
    content: `
      <p>Play gives children a natural reason to communicate. It creates repeated chances to request, respond, wait, choose, imitate, and repair misunderstandings in a low-pressure setting.</p>
      <h2>Follow the child’s interest</h2>
      <p>Motivation comes first. When adults join an activity the child already enjoys, communication has a clear purpose and practice feels less like a task.</p>
      <h2>Model, pause, respond</h2>
      <p>Simple language, patient pauses, and consistent responses help children learn that their signals are meaningful. Gestures, pictures, devices, and spoken words all count as communication.</p>
      <h2>Make it repeatable</h2>
      <p>Favorite games become powerful because they repeat. Each repetition gives the child another chance to anticipate, initiate, and participate with more confidence.</p>
    `
  }
]

const fallbackPostsAr: MaanPost[] = [
  {
    slug: 'ar-building-confident-routines-at-home',
    locale: 'ar',
    title: 'بناء روتين يومي يمنح الطفل الثقة',
    description: 'خطوات عملية تساعد الأسرة على بناء روتين واضح يدعم التواصل والاستقلالية والهدوء اليومي.',
    category: 'دعم الأسرة',
    publishedAt: '2026-04-18T08:00:00.000Z',
    readTime: '٤ دقائق',
    content: `
      <p>يتقدم الأطفال بثبات أكبر عندما يكون الروتين اليومي واضحا ومتوقعا. يساعد التسلسل البسيط للخطوات الطفل على فهم ما سيحدث بعد ذلك ويقلل التوتر في أوقات الانتقال.</p>
      <h2>ابدأ بروتين واحد</h2>
      <p>اختر جزءا واحدا من اليوم، مثل الصباح أو وقت النوم، وقسمه إلى ثلاث أو خمس خطوات قصيرة. استخدم الكلمات نفسها كل مرة واحتفل بإتمام الخطوات قبل إضافة تفاصيل جديدة.</p>
      <h2>استخدم دعما بصريا</h2>
      <p>تساعد الصور والقوائم وبطاقات أولا ثم الأطفال على فهم التوقعات من دون الاعتماد على التعليمات الشفهية فقط.</p>
      <h2>شارك ما ينجح</h2>
      <p>عندما تستخدم الأسرة وفريق المركز إشارات متشابهة، يصبح التعلم أكثر اتساقا بين البيت والصف وجلسات العلاج.</p>
    `
  },
  {
    slug: 'ar-how-early-assessment-guides-support',
    locale: 'ar',
    title: 'كيف يوجه التقييم المبكر خطة الدعم',
    description: 'نظرة عملية على دور الملاحظة ومشاركة الأسرة والتقييم المتخصص في بناء خطة تعليمية فردية.',
    category: 'التقييم',
    publishedAt: '2026-03-26T08:00:00.000Z',
    readTime: '٥ دقائق',
    content: `
      <p>يكون التقييم مفيدا عندما يساعد الفريق على فهم الطفل بوضوح: نقاط القوة، أسلوب التواصل، الاحتياجات الحسية، والمهارات التي تحتاج إلى دعم.</p>
      <h2>الأسرة جزء من الصورة</h2>
      <p>يعرف الوالدان ومقدمو الرعاية تفاصيل مهمة عن يوم الطفل. تساعد هذه الملاحظات المختصين على تفسير السلوك ووضع أهداف واقعية.</p>
      <h2>الأهداف يجب أن تكون قابلة للتطبيق</h2>
      <p>الهدف الجيد واضح وقابل للقياس ومرتبط بروتين حقيقي، مثل طلب المساعدة أو المشاركة في نشاط جماعي أو الانتقال بين الأنشطة بهدوء.</p>
      <h2>المراجعة المستمرة مهمة</h2>
      <p>تتغير الخطة كلما تطور الطفل. تساعد المراجعات القصيرة والمتكررة على إبقاء الدعم مناسبا وعمليا.</p>
    `
  },
  {
    slug: 'ar-supporting-communication-through-play',
    locale: 'ar',
    title: 'دعم التواصل من خلال اللعب',
    description: 'لماذا يعد اللعب المنظم مساحة فعالة لبناء اللغة وتبادل الأدوار وتنظيم المشاعر والثقة الاجتماعية.',
    category: 'العلاج',
    publishedAt: '2026-02-14T08:00:00.000Z',
    readTime: '٣ دقائق',
    content: `
      <p>يوفر اللعب سببا طبيعيا للتواصل. يمنح الطفل فرصا متكررة للاختيار والطلب والانتظار والاستجابة في بيئة مريحة.</p>
      <h2>اتبع اهتمام الطفل</h2>
      <p>تبدأ المشاركة من الدافعية. عندما ينضم الكبار إلى نشاط يحبه الطفل، يصبح التواصل ذا معنى واضح.</p>
      <h2>نمذج، توقف، ثم استجب</h2>
      <p>تساعد اللغة البسيطة وفترات الانتظار والاستجابة الثابتة الطفل على إدراك أن إشاراته مفهومة ومؤثرة.</p>
      <h2>اجعل النشاط قابلا للتكرار</h2>
      <p>تمنح الألعاب المتكررة الطفل فرصة للتوقع والمبادرة والمشاركة بثقة أكبر في كل مرة.</p>
    `
  }
]

const normalizeSeo = (seo: StoredSeo | null | undefined, fallback: Partial<MaanSeo> = {}): MaanSeo => ({
  title: seo?.title || fallback.title,
  description: seo?.meta_description || fallback.description,
  // `og_image` is a full URL now (Tigris CDN). Passes through verbatim.
  ogImage: seo?.og_image || fallback.ogImage,
  noIndex: seo?.no_index ?? fallback.noIndex ?? false,
  noFollow: seo?.no_follow ?? fallback.noFollow ?? false,
  canonicalUrl: seo?.canonical_url || fallback.canonicalUrl,
  focusKeyphrase: seo?.focus_keyphrase || fallback.focusKeyphrase
})

const toMaanPost = (p: ApiPost, locale: 'en' | 'ar'): MaanPost => {
  const description = p.description || 'Insights and updates from Maan Special Education Center.'
  return {
    slug: p.slug,
    locale,
    title: p.title,
    description,
    category: locale === 'ar' ? 'مدونة المركز' : 'Center Blog',
    publishedAt: p.publishedAt || p.createdAt || new Date().toISOString(),
    readTime: locale === 'ar' ? '٤ دقائق' : '4 min read',
    image: p.image ?? undefined,
    content: p.content || '<p>More details will be available soon.</p>',
    categories: p.categories ?? [],
    seo: normalizeSeo(p.seo, {
      title: p.title,
      description,
      ogImage: p.image ?? undefined
    })
  }
}

export const useMaanContent = () => {
  // `getPosts` accepts either (locale) — legacy positional signature, kept
  // for the dozen existing call sites — or (locale, { placement, category,
  // limit }) for Layer-1 surface filtering.
  //
  // When a placement is requested but the DB returns nothing, we do NOT
  // fall back to the local fallback array, because the fallback isn't
  // tagged: it would surface unrelated posts on a "Down Syndrome
  // related articles" slot. Empty placement → empty result is the right
  // behaviour and the calling component can render a graceful empty
  // state.
  const getPosts = async (
    locale: 'en' | 'ar' = 'en',
    opts: GetPostsOptions = {}
  ): Promise<MaanPost[]> => {
    const { limit = 6, placement, category, q, page = 1 } = opts
    try {
      const res = await $fetch<{ posts: ApiPost[], total?: number }>('/api/public/posts', {
        query: {
          locale,
          limit,
          page,
          ...(placement ? { placement } : {}),
          ...(category ? { category } : {}),
          ...(q ? { q } : {})
        }
      })
      const mapped = res.posts.map(p => toMaanPost(p, locale))
      if (mapped.length) return mapped
      // Only fall back to typed fallbacks when no taxonomy/search was
      // requested — a placement/category/search query that hit zero rows
      // means "nothing matched", not "show me anything".
      if (placement || category || q) return []
      return locale === 'ar' ? fallbackPostsAr : fallbackPostsEn
    } catch {
      if (placement || category || q) return []
      return locale === 'ar' ? fallbackPostsAr : fallbackPostsEn
    }
  }

  // Pagination-aware sibling of `getPosts` (S2). Returns the requested page
  // of posts plus the locale's `total` so a "Load More" control can decide
  // whether more remain. No fallback array here: a real, empty published
  // list must read as `total: 0`, not as the seeded placeholder posts.
  const getPostsPage = async (
    locale: 'en' | 'ar' = 'en',
    opts: GetPostsOptions = {}
  ): Promise<{ posts: MaanPost[], total: number }> => {
    const { limit = 6, placement, category, q, page = 1 } = opts
    try {
      const res = await $fetch<{ posts: ApiPost[], total: number }>('/api/public/posts', {
        query: {
          locale,
          limit,
          page,
          ...(placement ? { placement } : {}),
          ...(category ? { category } : {}),
          ...(q ? { q } : {})
        }
      })
      return { posts: res.posts.map(p => toMaanPost(p, locale)), total: res.total ?? 0 }
    } catch {
      return { posts: [], total: 0 }
    }
  }

  // Fetches a single published post by slug from its dedicated endpoint
  // (S1) rather than scanning the list result — the list's `limit`/locale
  // defaults previously hid any post past the default window, which was
  // the detail-page "freeze" cause. Returns `undefined` on a 404 so the
  // pages' `if (!post.value)` guard still fires.
  const getPostBySlug = async (slug: string, locale: 'en' | 'ar' = 'en'): Promise<MaanPost | undefined> => {
    try {
      const res = await $fetch<{ post: ApiPost }>(`/api/public/posts/${encodeURIComponent(slug)}`)
      return toMaanPost(res.post, locale)
    } catch {
      return undefined
    }
  }

  // S10: DB-backed category options for the public blog filter. Hits the
  // public, read-only categories route (NOT the auth-gated dashboard one)
  // so the public filter tracks admin-managed categories. Returns localized
  // `{ value: slug, label }` options; degrades to [] on any failure so the
  // filter just disappears rather than crashing the page.
  const getCategoryOptions = async (
    locale: 'en' | 'ar' = 'en'
  ): Promise<Array<{ value: string, label: string }>> => {
    try {
      const res = await $fetch<{ categories: Array<{ slug: string, name_en: string, name_ar: string }> }>('/api/public/categories')
      return res.categories.map(c => ({
        value: c.slug,
        label: locale === 'ar' ? c.name_ar : c.name_en
      }))
    } catch {
      return []
    }
  }

  const getPageSeo = async (permalink: string, fallback: Partial<MaanSeo> = {}): Promise<MaanSeo> => {
    try {
      const res = await $fetch<{ page: { title?: string, seo?: { title?: string, metaDescription?: string, focusKeyphrase?: string } } | null }>('/api/pages/by-permalink', { query: { permalink } })
      const page = res.page
      // by-permalink emits camelCase SEO; map back to snake_case StoredSeo
      return normalizeSeo(
        page?.seo
          ? {
              title: page.seo.title,
              meta_description: page.seo.metaDescription,
              focus_keyphrase: page.seo.focusKeyphrase
            }
          : undefined,
        { ...fallback, title: page?.title || fallback.title }
      )
    } catch {
      return normalizeSeo(undefined, fallback)
    }
  }

  return { getPosts, getPostsPage, getPostBySlug, getCategoryOptions, getPageSeo }
}
