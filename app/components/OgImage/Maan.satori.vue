<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  description?: string
  eyebrow?: string
  locale?: 'en' | 'ar'
}>(), {
  title: 'Maan Special Education Center',
  description: 'Individualized education, therapy, and family support for children with diverse learning needs.',
  eyebrow: 'Special Education Center',
  locale: 'en'
})
</script>

<template>
  <div
    :style="{
      width: '1200px',
      height: '630px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '58px 66px',
      background: 'linear-gradient(120deg, #fff9ea 0%, #f4f8ee 52%, #fbf8ef 100%)',
      color: '#24362f',
      fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
      direction: locale === 'ar' ? 'rtl' : 'ltr'
    }"
  >
    <div
      :style="{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '28px'
      }"
    >
      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          gap: '18px'
        }"
      >
        <div
          :style="{
            width: '72px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50% 46% 48% 44%',
            background: '#6c8f78',
            color: '#fff9ea',
            fontSize: '34px',
            fontWeight: 800,
            transform: 'rotate(-4deg)',
            boxShadow: '0 18px 38px rgba(64, 91, 77, 0.22)'
          }"
        >
          م
        </div>
        <div
          :style="{
            display: 'flex',
            flexDirection: 'column',
            gap: '5px'
          }"
        >
          <div
            :style="{
              fontSize: '28px',
              fontWeight: 800,
              color: '#24362f'
            }"
          >
            {{ locale === 'ar' ? 'مركز معا' : 'Maan Center' }}
          </div>
          <div
            :style="{
              fontSize: '18px',
              color: '#557765'
            }"
          >
            {{ locale === 'ar' ? 'تعليم خاص ودعم علاجي' : 'Special education and therapy support' }}
          </div>
        </div>
      </div>

      <div
        :style="{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '12px 20px',
          borderRadius: '999px',
          background: 'rgba(255, 225, 168, 0.7)',
          color: '#405b4d',
          fontSize: '20px',
          fontWeight: 700
        }"
      >
        {{ eyebrow }}
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'space-between',
        gap: '54px'
      }"
    >
      <div
        :style="{
          width: '720px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '28px'
        }"
      >
        <h1
          :style="{
            margin: 0,
            color: '#24362f',
            fontSize: locale === 'ar' ? '64px' : '68px',
            lineHeight: 1.04,
            fontWeight: 850,
            letterSpacing: '0'
          }"
        >
          {{ title }}
        </h1>
        <p
          :style="{
            margin: 0,
            maxWidth: '690px',
            color: '#557765',
            fontSize: '28px',
            lineHeight: 1.36,
            fontWeight: 500
          }"
        >
          {{ description }}
        </p>
      </div>

      <div
        :style="{
          width: '290px',
          minHeight: '330px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '30px',
          borderRadius: '44px 44px 18px 44px',
          background: 'rgba(255, 255, 255, 0.58)',
          border: '2px solid rgba(108, 143, 120, 0.22)',
          boxShadow: '0 30px 70px rgba(64, 91, 77, 0.16)'
        }"
      >
        <div
          v-for="item in (locale === 'ar' ? ['تقييم', 'تواصل', 'استقلالية'] : ['Assess', 'Communicate', 'Grow'])"
          :key="item"
          :style="{
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
            color: '#405b4d',
            fontSize: '24px',
            fontWeight: 800
          }"
        >
          <div
            :style="{
              width: '42px',
              height: '42px',
              borderRadius: '16px',
              background: '#cfe0c3'
            }"
          />
          <span>{{ item }}</span>
        </div>
      </div>
    </div>

    <div
      :style="{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        color: '#746452',
        fontSize: '22px',
        fontWeight: 650
      }"
    >
      <span>{{ locale === 'ar' ? 'maan-center' : 'maan-center' }}</span>
      <span>{{ locale === 'ar' ? 'دعم الأسرة والطفل' : 'Family-centered child support' }}</span>
    </div>
  </div>
</template>
