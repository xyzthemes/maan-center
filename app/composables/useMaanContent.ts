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
}

type DirectusPost = {
  id: string
  slug?: string
  title?: string
  description?: string
  content?: string
  image?: string | { id?: string }
  published_at?: string
  date_created?: string
  status?: string
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

export const useMaanContent = () => {
  const directusUrl = useDirectusUrl()

  const getAssetUrl = (asset?: string | { id?: string }) => {
    const id = typeof asset === 'string' ? asset : asset?.id

    return id ? `${directusUrl}/assets/${id}` : undefined
  }

  const normalizePosts = (posts: DirectusPost[] = [], locale: 'en' | 'ar' = 'en') => {
    const relevantTerms = [
      'maan',
      'education',
      'therapy',
      'parent',
      'family',
      'special',
      'inclusive',
      'autism',
      'speech',
      'occupational',
      'behavior',
      'sensory',
      'student',
      'school',
      'center',
      'routine',
      'routines',
      'families',
      'communication',
      'play',
      'language',
      'confidence'
    ]
    const arabicRelevantTerms = ['معا', 'تعليم', 'تربية', 'علاج', 'أسرة', 'الأسر', 'تواصل', 'طفل', 'الأطفال', 'مركز', 'دعم', 'توحد', 'روتين', 'اللعب', 'الثقة']

    const normalized: MaanPost[] = posts
      .filter(post => post.status === undefined || post.status === 'published')
      .map((post) => {
        const searchable = `${post.title ?? ''} ${post.description ?? ''}`.toLowerCase()
        const postLocale = post.slug?.startsWith('ar-') || /[\u0600-\u06FF]/.test(searchable) ? 'ar' : 'en'
        const isRelevant = postLocale === 'ar'
          ? arabicRelevantTerms.some(term => searchable.includes(term))
          : relevantTerms.some(term => searchable.includes(term))

        if (!isRelevant || postLocale !== locale || !post.slug || !post.title) {
          return undefined
        }

        const normalizedPost: MaanPost = {
          slug: post.slug,
          locale: postLocale,
          title: post.title,
          description: post.description || 'Insights and updates from Maan Special Education Center.',
          category: postLocale === 'ar' ? 'مدونة المركز' : 'Center Blog',
          publishedAt: post.published_at || post.date_created || new Date().toISOString(),
          readTime: postLocale === 'ar' ? '٤ دقائق' : '4 min read',
          image: getAssetUrl(post.image),
          content: post.content || '<p>More details will be available soon.</p>'
        }

        return normalizedPost
      })
      .filter(Boolean) as MaanPost[]

    return normalized.length ? normalized : locale === 'ar' ? fallbackPostsAr : fallbackPostsEn
  }

  const getPosts = async (locale: 'en' | 'ar' = 'en') => {
    try {
      const { getItems } = useDirectusItems()
      const posts = await getItems<DirectusPost>({
        collection: 'posts',
        params: {
          filter: { status: { _eq: 'published' } },
          sort: ['-published_at'],
          fields: ['id', 'slug', 'title', 'description', 'content', 'image', 'published_at', 'date_created', 'status'],
          limit: 6
        }
      })

      return normalizePosts(posts, locale)
    } catch {
      return locale === 'ar' ? fallbackPostsAr : fallbackPostsEn
    }
  }

  const getPostBySlug = async (slug: string, locale: 'en' | 'ar' = 'en') => {
    const posts = await getPosts(locale)

    return posts.find(post => post.slug === slug)
  }

  return {
    fallbackPosts: fallbackPostsEn,
    fallbackPostsAr,
    getAssetUrl,
    getPosts,
    getPostBySlug
  }
}
