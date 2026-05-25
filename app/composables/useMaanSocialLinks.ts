// Centralised social + outreach link directory for the /connect page and
// any future "follow us" widget. Grouped by audience, not by platform —
// parents researching a specific condition shouldn't have to scan past 12
// platform sections to find the Down-Syndrome community.

export type SocialLink = {
  /** Brand or descriptive label, locale-aware. */
  label: { en: string, ar: string }
  /** Icon name. Prefer Simple Icons for brand glyphs (`i-simple-icons-…`),
   *  Lucide for non-brand affordances (map pin, mail). */
  icon: string
  href: string
  /** Optional short description to disambiguate similar handles. */
  hint?: { en: string, ar: string }
  /** Optional brand colour for the icon chip — defaults to autism blue. */
  color?: string
}

export type SocialGroup = {
  id: string
  title: { en: string, ar: string }
  description: { en: string, ar: string }
  links: SocialLink[]
}

// Brand colors — match the official palette of each platform. Used as a
// soft tint on the icon chip; never on text (always reads against
// surface-alt + ink).
const BRAND = {
  instagram: '#E1306C',
  facebook: '#1877F2',
  x: '#000000',
  tiktok: '#010101',
  youtube: '#FF0000',
  linkedin: '#0A66C2',
  pinterest: '#BD081C',
  telegram: '#26A5E4',
  threads: '#000000',
  whatsapp: '#25D366',
  blogger: '#FF8000',
  vk: '#0077FF',
  tumblr: '#36465D',
  flickr: '#FF0084',
  email: '#4B5668',
  maps: '#4285F4'
} as const

export const useMaanSocialLinks = (): SocialGroup[] => [
  // ───────────────────────────────────────────────────────────────
  // Maan Center — the institution
  // ───────────────────────────────────────────────────────────────
  {
    id: 'maan',
    title: { en: 'Maan Center', ar: 'مركز معاً' },
    description: {
      en: 'The center’s official channels — start here for assessment, programs, and community updates.',
      ar: 'القنوات الرسمية للمركز — ابدأوا هنا للتقييم والبرامج وتحديثات المجتمع.'
    },
    links: [
      {
        label: { en: 'WhatsApp', ar: 'واتساب' },
        icon: 'i-simple-icons-whatsapp',
        color: BRAND.whatsapp,
        href: 'https://wa.me/97332055666?text=' + encodeURIComponent('أود استشارة بخصوص طفلي'),
        hint: { en: '+973 3205 5666', ar: '+973 3205 5666' }
      },
      {
        label: { en: 'Instagram', ar: 'إنستغرام' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/maancenter/',
        hint: { en: '@maancenter', ar: '@maancenter' }
      },
      {
        label: { en: 'Facebook', ar: 'فيسبوك' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/maancenter.bh'
      },
      {
        label: { en: 'X (Twitter)', ar: 'إكس (تويتر)' },
        icon: 'i-simple-icons-x',
        color: BRAND.x,
        href: 'https://x.com/maan_center_bh'
      },
      {
        label: { en: 'LinkedIn', ar: 'لينكدإن' },
        icon: 'i-simple-icons-linkedin',
        color: BRAND.linkedin,
        href: 'https://www.linkedin.com/company/maancenter'
      },
      {
        label: { en: 'Pinterest', ar: 'بينترست' },
        icon: 'i-simple-icons-pinterest',
        color: BRAND.pinterest,
        href: 'https://www.pinterest.com/MaanCenter'
      },
      {
        label: { en: 'Email', ar: 'البريد الإلكتروني' },
        icon: 'i-lucide-mail',
        color: BRAND.email,
        href: 'mailto:maancenter.bh@gmail.com',
        hint: { en: 'maancenter.bh@gmail.com', ar: 'maancenter.bh@gmail.com' }
      },
      {
        label: { en: 'Google Maps', ar: 'خرائط جوجل' },
        icon: 'i-lucide-map-pin',
        color: BRAND.maps,
        href: 'https://maps.app.goo.gl/GNB7VK94az3Wcrrq8',
        hint: { en: 'Find us in Bahrain', ar: 'موقعنا في البحرين' }
      }
    ]
  },

  // ───────────────────────────────────────────────────────────────
  // Dr. Osama Madbooly — the person
  // ───────────────────────────────────────────────────────────────
  {
    id: 'osama',
    title: { en: 'Dr. Osama Madbooly', ar: 'د. أسامة مدبولي' },
    description: {
      en: 'Dr. Osama’s personal channels — long-form education, professional updates, and direct contact.',
      ar: 'قنوات د. أسامة الشخصية — محتوى تعليمي موسع وتحديثات مهنية وتواصل مباشر.'
    },
    links: [
      {
        label: { en: 'WhatsApp', ar: 'واتساب' },
        icon: 'i-simple-icons-whatsapp',
        color: BRAND.whatsapp,
        href: 'https://wa.me/97339960623',
        hint: { en: '+973 3996 0623', ar: '+973 3996 0623' }
      },
      {
        label: { en: 'Telegram', ar: 'تلغرام' },
        icon: 'i-simple-icons-telegram',
        color: BRAND.telegram,
        href: 'https://t.me/osama_madbooly'
      },
      {
        label: { en: 'Facebook', ar: 'فيسبوك' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/madbooly'
      },
      {
        label: { en: 'X (Twitter)', ar: 'إكس (تويتر)' },
        icon: 'i-simple-icons-x',
        color: BRAND.x,
        href: 'https://twitter.com/madbooly2030'
      },
      {
        label: { en: 'Threads', ar: 'ثردز' },
        icon: 'i-simple-icons-threads',
        color: BRAND.threads,
        href: 'https://www.threads.net/@osama_madbooly'
      },
      {
        label: { en: 'TikTok', ar: 'تيك توك' },
        icon: 'i-simple-icons-tiktok',
        color: BRAND.tiktok,
        href: 'https://www.tiktok.com/@osama.madbooly'
      },
      {
        label: { en: 'YouTube', ar: 'يوتيوب' },
        icon: 'i-simple-icons-youtube',
        color: BRAND.youtube,
        href: 'https://www.youtube.com/user/madboolyzm',
        hint: { en: 'Osama Madbooly', ar: 'أسامة مدبولي' }
      },
      {
        label: { en: 'YouTube — Archive', ar: 'يوتيوب — أرشيف' },
        icon: 'i-simple-icons-youtube',
        color: BRAND.youtube,
        href: 'https://www.youtube.com/user/tafaol2012/videos',
        hint: { en: 'Older channel (tafaol2012)', ar: 'قناة أقدم (tafaol2012)' }
      },
      {
        label: { en: 'LinkedIn', ar: 'لينكدإن' },
        icon: 'i-simple-icons-linkedin',
        color: BRAND.linkedin,
        href: 'https://www.linkedin.com/in/osama-madbooly-88958432/'
      },
      {
        label: { en: 'Pinterest', ar: 'بينترست' },
        icon: 'i-simple-icons-pinterest',
        color: BRAND.pinterest,
        href: 'https://www.pinterest.com/osamamadbooly/'
      },
      {
        label: { en: 'Blog', ar: 'مدونة' },
        icon: 'i-simple-icons-blogger',
        color: BRAND.blogger,
        href: 'https://osama-madbooly2.blogspot.com/'
      },
      {
        label: { en: 'Tumblr', ar: 'تمبلر' },
        icon: 'i-simple-icons-tumblr',
        color: BRAND.tumblr,
        href: 'https://osamamadbooly.tumblr.com/'
      },
      {
        label: { en: 'VK', ar: 'في كي' },
        icon: 'i-simple-icons-vk',
        color: BRAND.vk,
        href: 'https://vk.com/oam2020'
      },
      {
        label: { en: 'Flickr', ar: 'فليكر' },
        icon: 'i-simple-icons-flickr',
        color: BRAND.flickr,
        href: 'https://www.flickr.com/photos/113169934@N07/'
      },
      {
        label: { en: 'Email', ar: 'البريد الإلكتروني' },
        icon: 'i-lucide-mail',
        color: BRAND.email,
        href: 'mailto:oam2002@hotmail.com',
        hint: { en: 'oam2002@hotmail.com', ar: 'oam2002@hotmail.com' }
      }
    ]
  },

  // ───────────────────────────────────────────────────────────────
  // Specialist communities — outreach accounts curated by Dr. Osama
  // ───────────────────────────────────────────────────────────────
  {
    id: 'down-syndrome',
    title: { en: 'Down Syndrome', ar: 'متلازمة داون' },
    description: {
      en: 'Community accounts focused on Down syndrome — local + regional.',
      ar: 'حسابات مجتمعية مخصصة لمتلازمة داون — محلياً وإقليمياً.'
    },
    links: [
      {
        label: { en: 'Instagram — Down Syndrome', ar: 'إنستغرام — متلازمة داون' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/downsyndrome_madbooly/'
      },
      {
        label: { en: 'Facebook — Down Syndrome', ar: 'فيسبوك — متلازمة داون' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/downsyndrome.madbooly'
      },
      {
        label: { en: 'Arab Down Syndrome Federation (IG)', ar: 'الاتحاد العربي لمتلازمة داون (IG)' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/arab_downsyndrome_federation/'
      },
      {
        label: { en: 'Arab Down Syndrome Federation (FB)', ar: 'الاتحاد العربي لمتلازمة داون (FB)' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/arab.downsyndrome.federation/'
      },
      {
        label: { en: 'Down Syndrome is Beautiful', ar: 'متلازمة داون جميلة' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/down_syndrome_is_beautiful/'
      }
    ]
  },
  {
    id: 'autism',
    title: { en: 'Autism Spectrum', ar: 'طيف التوحد' },
    description: {
      en: 'Outreach accounts dedicated to autism awareness and family support.',
      ar: 'حسابات مخصصة للتوعية بالتوحد ودعم الأسرة.'
    },
    links: [
      {
        label: { en: 'Instagram — Autism', ar: 'إنستغرام — التوحد' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/autism_madbooly/'
      },
      {
        label: { en: 'Facebook — Autism', ar: 'فيسبوك — التوحد' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/autism.madbooly'
      }
    ]
  },
  {
    id: 'learning-difficulties',
    title: { en: 'Learning Difficulties', ar: 'صعوبات التعلم' },
    description: {
      en: 'Accounts focused on dyslexia and academic-skill support.',
      ar: 'حسابات تركز على عسر القراءة ودعم المهارات الأكاديمية.'
    },
    links: [
      {
        label: { en: 'Instagram — Learning Difficulties', ar: 'إنستغرام — صعوبات التعلم' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/learning_disability_madbooly/'
      },
      {
        label: { en: 'Facebook — Learning Difficulties', ar: 'فيسبوك — صعوبات التعلم' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/learning.disability.madbooly'
      }
    ]
  },
  {
    id: 'other-conditions',
    title: { en: 'Other Conditions & Initiatives', ar: 'متلازمات ومبادرات أخرى' },
    description: {
      en: 'Awareness accounts for rare diseases, assistive technology, and related advocacy.',
      ar: 'حسابات توعية بالأمراض النادرة والتكنولوجيا المساعدة ومبادرات ذات صلة.'
    },
    links: [
      {
        label: { en: 'Rare Diseases (Bahrain)', ar: 'الأمراض النادرة (البحرين)' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/rarediseasebahrain/'
      },
      {
        label: { en: 'Assistive Technology', ar: 'التكنولوجيا المساعدة' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/assistivetechnology_ar/'
      },
      {
        label: { en: 'Special-needs Agriculture', ar: 'زراعة لذوي الاحتياجات' },
        icon: 'i-simple-icons-instagram',
        color: BRAND.instagram,
        href: 'https://www.instagram.com/specialneedagriculture/'
      },
      {
        label: { en: 'Turner Syndrome', ar: 'متلازمة تيرنر' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/profile.php?id=100086432363418'
      },
      {
        label: { en: 'William Syndrome', ar: 'متلازمة وليامز' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/profile.php?id=100086894404084'
      },
      {
        label: { en: 'Stroke Awareness', ar: 'التوعية بالجلطة الدماغية' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/profile.php?id=100089803931881'
      },
      {
        label: { en: '“Planting a Better Tomorrow”', ar: '«معاً نزرع غداً أفضل»' },
        icon: 'i-simple-icons-facebook',
        color: BRAND.facebook,
        href: 'https://www.facebook.com/profile.php?id=61560746062636'
      },
      {
        label: { en: '“Planting a Better Tomorrow” (X)', ar: '«معاً نزرع» (X)' },
        icon: 'i-simple-icons-x',
        color: BRAND.x,
        href: 'https://x.com/maanforspecial'
      }
    ]
  }
]
