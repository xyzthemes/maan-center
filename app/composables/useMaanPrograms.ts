// Phase 4 — Program landing pages content model.
// Single source of truth so the Arabic and English shells stay in sync and
// drift is impossible.

export type ProgramId = 'autism' | 'down-syndrome' | 'learning-difficulties'
export type ProgramVariant = 'autism' | 'down' | 'ld'

export type ProgramContent = {
  id: ProgramId
  variant: ProgramVariant
  // Top-level
  eyebrow: string
  title: string
  lead: string
  // Sections
  whoHeading: string
  whoItems: string[]
  assessHeading: string
  assessIntro: string
  assessItems: Array<{ icon: string, name: string, desc: string }>
  methodsHeading: string
  methodsIntro: string
  methodsItems: Array<{ icon: string, name: string, desc: string }>
  involvementHeading: string
  involvementBody: string
  processHeading: string
  processSteps: Array<{ title: string, body: string }>
  faqHeading: string
  faqs: Array<{ q: string, a: string }>
  ctaHeading: string
  ctaBody: string
  ctaPrimaryLabel: string
  ctaSecondaryLabel: string
  relatedHeading: string
  seoTitle: string
  seoDescription: string
}

const PROGRAM_IDS: ReadonlySet<ProgramId> = new Set(['autism', 'down-syndrome', 'learning-difficulties'])

export const isProgramId = (id: string): id is ProgramId => PROGRAM_IDS.has(id as ProgramId)

const variantFor = (id: ProgramId): ProgramVariant => {
  if (id === 'down-syndrome') return 'down'
  if (id === 'learning-difficulties') return 'ld'
  return 'autism'
}

// ────────────────────────────────────────────────────────────────────
// ARABIC CONTENT
// ────────────────────────────────────────────────────────────────────
const ARABIC: Record<ProgramId, ProgramContent> = {
  'autism': {
    id: 'autism',
    variant: 'autism',
    eyebrow: 'برامج اضطراب طيف التوحد',
    title: 'دعم متخصص للأطفال على طيف التوحد.',
    lead: 'في مركز معاً نقدم تقييماً علمياً دقيقاً وخططاً تعليمية وعلاجية فردية تركز على بناء التواصل والاستقلالية والمهارات الاجتماعية في بيئة هادئة ومناسبة حسياً.',
    whoHeading: 'لمن هذا البرنامج؟',
    whoItems: [
      'الأطفال الذين لديهم تشخيص بطيف التوحد.',
      'الأطفال الذين تظهر عليهم مؤشرات وتحتاج الأسرة إلى تقييم شامل.',
      'الأسر التي تبحث عن خطة تعليمية وعلاجية متكاملة بدلاً من جلسات متفرقة.',
      'الأطفال الذين يحتاجون إلى دعم تواصل بديل أو تعديل سلوكي مكثف.'
    ],
    assessHeading: 'كيف نقيّم طفلك؟',
    assessIntro: 'نبدأ دائماً بفهم الطفل قبل وضع أي خطة. التقييم يجمع بين الملاحظة المنظمة وأدوات علمية معتمدة.',
    assessItems: [
      { icon: 'i-lucide-clipboard-check', name: 'مقياس CARS', desc: 'تقييم منظم لشدة سمات طيف التوحد لدى الأطفال.' },
      { icon: 'i-lucide-list-checks', name: 'مقياس GILLIAM', desc: 'أداة فحص شائعة لرصد المؤشرات السلوكية المرتبطة بالتوحد.' },
      { icon: 'i-lucide-brain', name: 'مقاييس الذكاء', desc: 'لرسم صورة كاملة لنقاط القوة المعرفية والاحتياجات.' }
    ],
    methodsHeading: 'المناهج التي نستخدمها',
    methodsIntro: 'نختار من بين مناهج معتمدة دولياً بحسب احتياج الطفل، ونمزج بينها حين يكون ذلك مناسباً.',
    methodsItems: [
      { icon: 'i-lucide-target', name: 'Lovaas / ABA', desc: 'تحليل سلوكي تطبيقي يبني المهارات بخطوات صغيرة قابلة للقياس.' },
      { icon: 'i-lucide-grid-3x3', name: 'TEACCH', desc: 'تعليم بصري منظم يدعم الاستقلالية في الصف والمنزل.' },
      { icon: 'i-lucide-message-circle-heart', name: 'تواصل بديل', desc: 'PECS أو تطبيقات تواصل لمنح الطفل صوتاً واضحاً.' }
    ],
    involvementHeading: 'دور الأسرة',
    involvementBody: 'الأسرة شريك أساسي في كل مرحلة. نعقد جلسات إرشاد ونزودكم بخطة منزلية مكتوبة ومصورة، ونتابع التقدم معكم بصورة دورية حتى يستمر الأثر بين الجلسات.',
    processHeading: 'مراحل البرنامج',
    processSteps: [
      { title: 'لقاء الأسرة', body: 'لقاء مفتوح لجمع تاريخ الطفل واهتمامات الأسرة.' },
      { title: 'التقييم العلمي', body: 'تطبيق المقاييس وملاحظة الطفل في بيئة مناسبة.' },
      { title: 'الخطة الفردية', body: 'تقرير مكتوب وأهداف قابلة للقياس.' },
      { title: 'جلسات ومتابعة', body: 'جلسات منتظمة مع مراجعات دورية للأهداف.' }
    ],
    faqHeading: 'أسئلة شائعة',
    faqs: [
      { q: 'هل يلزم التشخيص قبل البدء؟', a: 'لا، يمكن البدء بالتقييم لدينا ثم بناء الخطة المناسبة للطفل بناءً على النتائج.' },
      { q: 'كم تستغرق الجلسة؟', a: 'بين ٤٥ و٦٠ دقيقة، وتتحدد بدقة بعد التقييم الأولي.' },
      { q: 'هل تعملون مع أعمار صغيرة؟', a: 'نعم، نستقبل التدخل المبكر ونوصي به كلما كان ممكناً.' }
    ],
    ctaHeading: 'احجزوا جلسة تقييم لطفلكم.',
    ctaBody: 'فريق المختصين جاهز للرد خلال يوم العمل، وكل تواصل يبقى سرياً.',
    ctaPrimaryLabel: 'احجز التقييم',
    ctaSecondaryLabel: 'دردشة واتساب',
    relatedHeading: 'مقالات ذات صلة',
    seoTitle: 'برامج اضطراب طيف التوحد | مركز معاً للتربية الخاصة',
    seoDescription: 'تقييم وخطط تعليمية وعلاجية فردية للأطفال على طيف التوحد في البحرين. ABA، TEACCH، تواصل بديل، ومرافقة الأسرة.'
  },
  'down-syndrome': {
    id: 'down-syndrome',
    variant: 'down',
    eyebrow: 'برامج متلازمة داون',
    title: 'تدخل مبكر يبني الاستقلالية اليومية.',
    lead: 'نرافق الأطفال ذوي متلازمة داون منذ السنوات الأولى ببرامج تركز على التواصل والحركة الدقيقة وتقوية العضلات والاستعداد الأكاديمي، بإيقاع يحترم قدرات كل طفل.',
    whoHeading: 'لمن هذا البرنامج؟',
    whoItems: [
      'الأطفال الذين لديهم تشخيص بمتلازمة داون من سن مبكرة.',
      'الأطفال الذين يحتاجون إلى دعم حركي ولغوي مكثف.',
      'الأسر التي تبحث عن برنامج تدخل مبكر منهجي وموثوق.',
      'الأطفال في مرحلة الاستعداد للدمج المدرسي.'
    ],
    assessHeading: 'كيف نقيّم طفلك؟',
    assessIntro: 'نركز على رسم صورة شاملة عن نقاط القوة والاحتياجات الحركية واللغوية والإدراكية.',
    assessItems: [
      { icon: 'i-lucide-activity', name: 'تقييم حركي', desc: 'مهارات حركية كبيرة ودقيقة وتوازن وقوة عضلية.' },
      { icon: 'i-lucide-message-circle-heart', name: 'تقييم لغوي', desc: 'مستوى التواصل، فهم اللغة، ومهارات التعبير.' },
      { icon: 'i-lucide-brain', name: 'تقييم إدراكي', desc: 'مهارات الانتباه والذاكرة والاستعداد الأكاديمي.' }
    ],
    methodsHeading: 'المناهج التي نستخدمها',
    methodsIntro: 'برامج معتمدة دولياً نصممها لكل طفل وفق احتياجاته وعمره.',
    methodsItems: [
      { icon: 'i-lucide-baby', name: 'Portage', desc: 'تدخل مبكر منزلي بمشاركة الأسرة في كل خطوة.' },
      { icon: 'i-lucide-hand-heart', name: 'علاج وظيفي', desc: 'تنمية المهارات الحركية الدقيقة ومهارات الحياة.' },
      { icon: 'i-lucide-dumbbell', name: 'تقوية عضلية', desc: 'تمارين منهجية لتحسين الوضعية والتحمل والتوازن.' }
    ],
    involvementHeading: 'دور الأسرة',
    involvementBody: 'البرنامج لا يكتمل دون مشاركة الأسرة. نقدم لكم خططاً منزلية واضحة وزيارات إرشادية ومتابعة دورية لكل هدف.',
    processHeading: 'مراحل البرنامج',
    processSteps: [
      { title: 'لقاء الأسرة', body: 'مراجعة التاريخ الطبي والاحتياجات الراهنة.' },
      { title: 'التقييم الشامل', body: 'جلسات تقييم حركية ولغوية وإدراكية.' },
      { title: 'الخطة الفردية', body: 'أهداف ربع سنوية ومناهج تدخل واضحة.' },
      { title: 'الجلسات والمتابعة', body: 'جلسات منتظمة مع مراجعات أسرية دورية.' }
    ],
    faqHeading: 'أسئلة شائعة',
    faqs: [
      { q: 'متى ينبغي البدء؟', a: 'الأبكر أفضل. التدخل المبكر يصنع فرقاً واضحاً في التواصل والاستقلالية.' },
      { q: 'هل يحتاج طفلي إلى جلسات متعددة الاختصاصات؟', a: 'غالباً نعم، ونعمل بفريق متكامل من معالج وظيفي ومعالج نطق ومتخصص تربية خاصة.' },
      { q: 'هل تساعدون في الاستعداد للمدرسة؟', a: 'نعم، نوفر برنامجاً متخصصاً للاستعداد الأكاديمي والاجتماعي.' }
    ],
    ctaHeading: 'لنخطّط معاً لمستقبل طفلكم.',
    ctaBody: 'حدثونا عن طفلكم وسنرشدكم إلى أنسب نقطة بداية.',
    ctaPrimaryLabel: 'احجز التقييم',
    ctaSecondaryLabel: 'دردشة واتساب',
    relatedHeading: 'مقالات ذات صلة',
    seoTitle: 'برامج متلازمة داون | مركز معاً للتربية الخاصة',
    seoDescription: 'برامج تدخل مبكر للأطفال ذوي متلازمة داون في البحرين — دعم حركي وفق بورتاج، علاج وظيفي، وتقوية عضلية.'
  },
  'learning-difficulties': {
    id: 'learning-difficulties',
    variant: 'ld',
    eyebrow: 'برامج صعوبات التعلم',
    title: 'دعم أكاديمي يعيد الثقة لطفلك.',
    lead: 'نساعد الأطفال الذين يواجهون صعوبات في القراءة أو الكتابة أو الحساب على بناء أساس متين بأدوات بصرية وتعليم منهجي يحترم وتيرتهم.',
    whoHeading: 'لمن هذا البرنامج؟',
    whoItems: [
      'الأطفال الذين يعانون من صعوبات في القراءة (عسر القراءة).',
      'الأطفال الذين يجدون صعوبة في الكتابة أو الإملاء.',
      'الأطفال الذين لا يستجيبون لطرق التدريس التقليدية في الحساب.',
      'الأسر التي تلاحظ فجوة بين قدرات الطفل وأدائه الأكاديمي.'
    ],
    assessHeading: 'كيف نقيّم طفلك؟',
    assessIntro: 'نحدد بدقة نوع الصعوبة ومستواها قبل اقتراح أي خطة، ونناقش معكم النتائج بلغة بسيطة.',
    assessItems: [
      { icon: 'i-lucide-book-open-check', name: 'تقييم القراءة والكتابة', desc: 'تحليل مهارات فك الترميز والطلاقة والفهم.' },
      { icon: 'i-lucide-calculator', name: 'تقييم الحساب', desc: 'فحص مهارات العدد والعمليات والاستدلال الرياضي.' },
      { icon: 'i-lucide-brain', name: 'مقاييس الذكاء', desc: 'لاستبعاد العوامل الأخرى وفهم نقاط القوة.' }
    ],
    methodsHeading: 'المناهج التي نستخدمها',
    methodsIntro: 'أساليب تعليم منهجية متعددة الحواس تجعل التعلم ملموساً وقابلاً للتطبيق.',
    methodsItems: [
      { icon: 'i-lucide-eye', name: 'تعليم بصري متعدد الحواس', desc: 'دمج البصر والسمع واللمس لترسيخ المفاهيم.' },
      { icon: 'i-lucide-pen-line', name: 'برامج علاج عسر القراءة', desc: 'برامج منهجية لبناء مهارات فك الترميز خطوة بخطوة.' },
      { icon: 'i-lucide-calculator', name: 'حساب متطور', desc: 'بناء المفاهيم الرياضية بأدوات ملموسة قبل المجردة.' }
    ],
    involvementHeading: 'دور الأسرة',
    involvementBody: 'نمنحكم أدوات عملية لدعم طفلكم في المنزل دون ضغط، ونحرص على التواصل مع المدرسة عند الحاجة.',
    processHeading: 'مراحل البرنامج',
    processSteps: [
      { title: 'لقاء الأسرة', body: 'مراجعة الأداء الأكاديمي وتقارير المدرسة.' },
      { title: 'التقييم المتخصص', body: 'تحديد نوع الصعوبة ومستواها.' },
      { title: 'الخطة الفردية', body: 'أهداف أكاديمية واضحة وقابلة للقياس.' },
      { title: 'الجلسات والمتابعة', body: 'جلسات منتظمة مع تواصل مع الأسرة والمدرسة.' }
    ],
    faqHeading: 'أسئلة شائعة',
    faqs: [
      { q: 'هل صعوبات التعلم مرض؟', a: 'لا، هي اختلاف في طريقة معالجة الدماغ للمعلومات. بالدعم الصحيح يصل الطفل لأقصى إمكاناته.' },
      { q: 'متى أنتبه أن طفلي يحتاج تقييماً؟', a: 'عند فجوة واضحة بين قدراته الواضحة وأدائه الأكاديمي رغم الجهد.' },
      { q: 'هل تتواصلون مع مدرسة طفلي؟', a: 'نعم، بإذن الأسرة، نشارك المعلمين بتوصيات داعمة.' }
    ],
    ctaHeading: 'لنبدأ من نقطة قوة طفلكم.',
    ctaBody: 'تقييم متخصص يحدد بدقة ما يحتاجه طفلكم — لا تخمين.',
    ctaPrimaryLabel: 'احجز التقييم',
    ctaSecondaryLabel: 'دردشة واتساب',
    relatedHeading: 'مقالات ذات صلة',
    seoTitle: 'برامج صعوبات التعلم | مركز معاً للتربية الخاصة',
    seoDescription: 'تقييم وعلاج صعوبات التعلم — عسر القراءة، صعوبات الكتابة والحساب — للأطفال في البحرين بمنهجية بصرية متعددة الحواس.'
  }
}

// ────────────────────────────────────────────────────────────────────
// ENGLISH CONTENT
// ────────────────────────────────────────────────────────────────────
const ENGLISH: Record<ProgramId, ProgramContent> = {
  'autism': {
    id: 'autism',
    variant: 'autism',
    eyebrow: 'Autism Spectrum Programs',
    title: 'Specialist support for children on the autism spectrum.',
    lead: 'Maan delivers accurate scientific assessment and individualized education and therapy plans focused on communication, independence, and social skills — in a calm, sensory-friendly environment.',
    whoHeading: 'Who this program is for',
    whoItems: [
      'Children with a diagnosis on the autism spectrum.',
      'Children showing early indicators whose family wants a thorough assessment.',
      'Families looking for a coordinated plan rather than scattered sessions.',
      'Children who would benefit from alternative communication or intensive behavioral support.'
    ],
    assessHeading: 'How we assess your child',
    assessIntro: 'We always understand the child before recommending a plan. Assessment combines structured observation with internationally recognized measures.',
    assessItems: [
      { icon: 'i-lucide-clipboard-check', name: 'CARS Scale', desc: 'Structured assessment of autism spectrum trait intensity.' },
      { icon: 'i-lucide-list-checks', name: 'GILLIAM Scale', desc: 'Widely used screening for behavioral indicators of autism.' },
      { icon: 'i-lucide-brain', name: 'Intelligence Measures', desc: 'Maps cognitive strengths and learning needs.' }
    ],
    methodsHeading: 'Methods we use',
    methodsIntro: 'We select among internationally recognized methodologies based on the child’s needs, and blend them where appropriate.',
    methodsItems: [
      { icon: 'i-lucide-target', name: 'Lovaas / ABA', desc: 'Applied behavior analysis that builds skills in measurable steps.' },
      { icon: 'i-lucide-grid-3x3', name: 'TEACCH', desc: 'Structured visual teaching that supports classroom and home independence.' },
      { icon: 'i-lucide-message-circle-heart', name: 'Alternative communication', desc: 'PECS and communication apps that give the child a clear voice.' }
    ],
    involvementHeading: 'Family involvement',
    involvementBody: 'The family is a core partner throughout. We run parent coaching sessions, share a written and illustrated home plan, and review progress on a recurring schedule so impact continues between sessions.',
    processHeading: 'How the program runs',
    processSteps: [
      { title: 'Family meeting', body: 'A relaxed conversation about the child’s history and the family’s concerns.' },
      { title: 'Scientific assessment', body: 'Applicable measures plus observation in a calm setting.' },
      { title: 'Individualized plan', body: 'A written report with measurable goals.' },
      { title: 'Sessions & follow-up', body: 'Regular sessions with recurring goal reviews.' }
    ],
    faqHeading: 'Frequently asked',
    faqs: [
      { q: 'Do we need a diagnosis to start?', a: 'No — you can start with assessment at Maan and the plan is built from the results.' },
      { q: 'How long is a session?', a: '45–60 minutes; the exact duration is set after the initial assessment.' },
      { q: 'Do you work with very young children?', a: 'Yes — early intervention is welcomed and strongly encouraged.' }
    ],
    ctaHeading: 'Book an assessment for your child.',
    ctaBody: 'Our specialists respond within one working day, and every conversation stays confidential.',
    ctaPrimaryLabel: 'Book assessment',
    ctaSecondaryLabel: 'WhatsApp chat',
    relatedHeading: 'Related articles',
    seoTitle: 'Autism Spectrum Programs | Maan Special Education Center',
    seoDescription: 'Assessment and individualized education and therapy plans for children on the autism spectrum in Bahrain — ABA, TEACCH, alternative communication, and full family support.'
  },
  'down-syndrome': {
    id: 'down-syndrome',
    variant: 'down',
    eyebrow: 'Down Syndrome Programs',
    title: 'Early intervention that builds daily independence.',
    lead: 'Maan walks alongside children with Down syndrome from the early years with programs that focus on communication, fine motor skills, muscle strengthening, and academic readiness — at a pace that respects each child.',
    whoHeading: 'Who this program is for',
    whoItems: [
      'Children with a Down syndrome diagnosis from the early years.',
      'Children who need intensive motor and language support.',
      'Families looking for a structured, trusted early-intervention program.',
      'Children preparing for school integration.'
    ],
    assessHeading: 'How we assess your child',
    assessIntro: 'We draw a complete picture of motor, language, and cognitive strengths and needs.',
    assessItems: [
      { icon: 'i-lucide-activity', name: 'Motor assessment', desc: 'Gross and fine motor skills, balance, and muscle strength.' },
      { icon: 'i-lucide-message-circle-heart', name: 'Language assessment', desc: 'Communication level, comprehension, and expressive skills.' },
      { icon: 'i-lucide-brain', name: 'Cognitive assessment', desc: 'Attention, memory, and academic readiness.' }
    ],
    methodsHeading: 'Methods we use',
    methodsIntro: 'Internationally recognized programs we tailor per child and per age.',
    methodsItems: [
      { icon: 'i-lucide-baby', name: 'Portage', desc: 'Home-based early intervention with the family as full partner.' },
      { icon: 'i-lucide-hand-heart', name: 'Occupational therapy', desc: 'Fine motor and daily-living skills development.' },
      { icon: 'i-lucide-dumbbell', name: 'Muscle strengthening', desc: 'Structured exercises improving posture, endurance, and balance.' }
    ],
    involvementHeading: 'Family involvement',
    involvementBody: 'The program is incomplete without the family. We provide a clear home plan, parent coaching sessions, and follow-up on every goal.',
    processHeading: 'How the program runs',
    processSteps: [
      { title: 'Family meeting', body: 'Review medical history and current needs.' },
      { title: 'Comprehensive assessment', body: 'Motor, language, and cognitive sessions.' },
      { title: 'Individualized plan', body: 'Quarterly goals with clear methodology.' },
      { title: 'Sessions & follow-up', body: 'Regular sessions with recurring family reviews.' }
    ],
    faqHeading: 'Frequently asked',
    faqs: [
      { q: 'When should we start?', a: 'The earlier the better — early intervention makes a clear difference in communication and independence.' },
      { q: 'Will my child need multi-disciplinary sessions?', a: 'Often yes — we work as a coordinated team across OT, speech, and special education.' },
      { q: 'Do you help with school readiness?', a: 'Yes — we offer a dedicated academic and social readiness program.' }
    ],
    ctaHeading: 'Let’s plan your child’s next year together.',
    ctaBody: 'Tell us about your child and we’ll guide you to the right starting point.',
    ctaPrimaryLabel: 'Book assessment',
    ctaSecondaryLabel: 'WhatsApp chat',
    relatedHeading: 'Related articles',
    seoTitle: 'Down Syndrome Programs | Maan Special Education Center',
    seoDescription: 'Early intervention programs for children with Down syndrome in Bahrain — Portage-based motor support, occupational therapy, and muscle strengthening.'
  },
  'learning-difficulties': {
    id: 'learning-difficulties',
    variant: 'ld',
    eyebrow: 'Learning Difficulties Programs',
    title: 'Academic support that rebuilds your child’s confidence.',
    lead: 'Maan helps children who struggle with reading, writing, or math build a solid foundation with visual, multi-sensory teaching that respects their pace.',
    whoHeading: 'Who this program is for',
    whoItems: [
      'Children with reading difficulties (dyslexia).',
      'Children who struggle with writing or spelling.',
      'Children who don’t respond to traditional math instruction.',
      'Families who notice a gap between their child’s clear abilities and academic performance.'
    ],
    assessHeading: 'How we assess your child',
    assessIntro: 'We precisely identify the type and level of the difficulty before recommending a plan, and we discuss findings with you in plain language.',
    assessItems: [
      { icon: 'i-lucide-book-open-check', name: 'Reading & writing assessment', desc: 'Decoding, fluency, and comprehension analysis.' },
      { icon: 'i-lucide-calculator', name: 'Math assessment', desc: 'Number sense, operations, and mathematical reasoning.' },
      { icon: 'i-lucide-brain', name: 'Intelligence measures', desc: 'Rule out other factors and understand strengths.' }
    ],
    methodsHeading: 'Methods we use',
    methodsIntro: 'Structured, multi-sensory teaching that makes learning tangible and transferable.',
    methodsItems: [
      { icon: 'i-lucide-eye', name: 'Multi-sensory visual teaching', desc: 'Sight, sound, and touch combined to anchor concepts.' },
      { icon: 'i-lucide-pen-line', name: 'Dyslexia programs', desc: 'Structured programs that build decoding step by step.' },
      { icon: 'i-lucide-calculator', name: 'Developed arithmetic', desc: 'Mathematical concepts built with concrete tools before abstract symbols.' }
    ],
    involvementHeading: 'Family involvement',
    involvementBody: 'We give you practical tools to support your child at home without pressure, and we coordinate with school where helpful.',
    processHeading: 'How the program runs',
    processSteps: [
      { title: 'Family meeting', body: 'Review academic performance and school reports.' },
      { title: 'Specialist assessment', body: 'Identify type and level of the difficulty.' },
      { title: 'Individualized plan', body: 'Clear, measurable academic goals.' },
      { title: 'Sessions & follow-up', body: 'Regular sessions with family and school coordination.' }
    ],
    faqHeading: 'Frequently asked',
    faqs: [
      { q: 'Is a learning difficulty a disease?', a: 'No — it’s a different way the brain processes information. With the right support, children reach their full potential.' },
      { q: 'When should I be alert?', a: 'When there is a clear gap between obvious ability and academic performance despite effort.' },
      { q: 'Do you communicate with my child’s school?', a: 'Yes, with family permission, we share supportive recommendations with teachers.' }
    ],
    ctaHeading: 'Let’s start from your child’s strengths.',
    ctaBody: 'A specialist assessment identifies precisely what your child needs — no guessing.',
    ctaPrimaryLabel: 'Book assessment',
    ctaSecondaryLabel: 'WhatsApp chat',
    relatedHeading: 'Related articles',
    seoTitle: 'Learning Difficulties Programs | Maan Special Education Center',
    seoDescription: 'Assessment and treatment for learning difficulties — dyslexia, writing, and arithmetic — for children in Bahrain, with a structured multi-sensory approach.'
  }
}

export const useMaanPrograms = () => {
  const getProgram = (id: ProgramId, locale: 'en' | 'ar' = 'en'): ProgramContent => {
    const source = locale === 'ar' ? ARABIC : ENGLISH
    return source[id] ?? source.autism
  }
  return { getProgram, isProgramId, variantFor }
}
