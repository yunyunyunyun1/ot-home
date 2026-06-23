<script setup lang="ts">
import { computed, ref } from 'vue'
import { RouterLink } from 'vue-router'

import ProfileMenu from '../components/ProfileMenu.vue'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const showWelcomePopup = ref(true)
const partnerLogos = ref([
  { label: 'สคส.', src: '/logos/whaf.png' },
  { label: 'ม.มหิดล', src: '/logos/mahidol.png' },
  { label: 'สมาคม OT', src: '/logos/otat.jpg' },
  { label: 'กระทรวงสาธารณสุข', src: '/logos/moph.png' },
  { label: 'สสส.', src: '/logos/thaihealth.png' },
])

const roleLabels: Record<string, string> = {
  admin: 'ผู้ดูแลระบบ',
  parent: 'ผู้ปกครอง',
  case_manager: 'Case Manager',
  caregiver: 'นักกิจกรรมบำบัด',
  village_volunteer: 'ผู้ดูแลเด็ก',
}

const roleHomeRoutes: Record<string, string> = {
  admin: '/admin',
  parent: '/parent',
  case_manager: '/case-manager',
  caregiver: '/caregiver',
  village_volunteer: '/village-volunteer',
}

const userRole = computed(() => authStore.user?.role ?? '')
const userRoleLabel = computed(() => (userRole.value ? roleLabels[userRole.value] : 'ผู้ใช้งาน'))
const roleHomePath = computed(() => roleHomeRoutes[userRole.value] ?? '/login')
const isLoggedIn = computed(() => Boolean(authStore.token && authStore.user))

function hideMissingLogo(index: number) {
  const logo = partnerLogos.value[index]
  if (logo) {
    logo.src = ''
  }
}
</script>

<template>
  <main class="home-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="nav-actions">
        <template v-if="isLoggedIn">
          <ProfileMenu />
          <RouterLink class="nav-button" :to="roleHomePath">ไปยังหน้าทำงาน</RouterLink>
        </template>
        <template v-else>
          <RouterLink class="nav-link" to="/login">เข้าสู่ระบบ</RouterLink>
          <RouterLink class="nav-button" to="/register">สมัครใช้งาน</RouterLink>
        </template>
      </div>
    </nav>

    <section class="home-shell" aria-labelledby="home-title">
      <header class="hero-panel">
        <div class="hero-copy">
          <p class="eyebrow">ระบบบริการแบบไร้รอยต่อ</p>
          <h1 id="home-title">OT@HOME</h1>
          <p class="intro">
            ระบบบริการส่งเสริมพัฒนาการเด็กปฐมวัยด้วยโปรแกรมกิจกรรมบำบัดแบบเข้มข้นที่บ้าน
          </p>
        </div>

        <aside class="privacy-panel" aria-label="นโยบายความเป็นส่วนตัว">
          <span class="privacy-icon"><i class="bi bi-shield-lock" aria-hidden="true"></i></span>
          <h2>พื้นที่ข้อมูลส่วนบุคคล</h2>
          <p>
            หน้าหลักแสดงเฉพาะข้อมูลสรุประดับระบบ รายละเอียดเด็ก ครอบครัว
            และผลประเมินจะแสดงหลังเข้าสู่ระบบตามสิทธิ์เท่านั้น
          </p>
        </aside>
      </header>

      <section class="objective-panel" aria-labelledby="objective-title">
        <div class="objective-heading">
          <p class="eyebrow">Project Objective</p>
          <h2 id="objective-title">วัตถุประสงค์ของโครงการ</h2>
        </div>

        <div class="objective-content">
          <article class="objective-primary">
            <h3>วัตถุประสงค์หลัก</h3>
            <p>
              เพื่อให้เด็กปฐมวัยที่ต้องได้รับบริการส่งเสริมพัฒนาการ โดยเฉพาะเด็กพัฒนาการล่าช้า
              สามารถเข้าถึงบริการการส่งเสริมพัฒนาการ ด้วยโปรแกรมกิจกรรมบำบัดแบบเข้มข้นที่บ้าน
              เพื่อส่งเสริมและฟื้นฟูพัฒนาการให้เหมาะสมตามวัย
              และเพิ่มศักยภาพการดำรงชีวิตและคุณภาพชีวิตของเด็กในระยะยาว
            </p>
          </article>

          <article class="objective-secondary">
            <h3>วัตถุประสงค์ย่อย</h3>
            <ol class="objective-list">
              <li>
                พัฒนารูปแบบระบบการให้บริการส่งเสริมพัฒนาการเด็กปฐมวัย
                ด้วยโปรแกรมกิจกรรมบำบัดแบบเข้มข้นที่บ้าน รวมถึงการบริหารจัดการที่มีประสิทธิภาพ
              </li>
              <li>พัฒนาระบบการให้บริการโดยการร่วมบริการระหว่างภาครัฐและเอกชน</li>
              <li>
                ประเมินผลการให้บริการ โดยครอบคลุมการประเมินเด็ก ผลกระทบต่อครอบครัว
                และการประเมินผู้ให้บริการแต่ละระดับ
              </li>
              <li>
                พัฒนาระบบข้อมูลทางอิเล็กทรอนิกส์ที่รองรับการให้บริการ
                โดยเน้นการให้ผู้ปกครองมีส่วนร่วมในการรายงานข้อมูล
              </li>
              <li>
                พัฒนาเป็นข้อเสนอชุดสิทธิประโยชน์ภายใต้ระบบหลักประกันสุขภาพแห่งชาติ Universal
                Coverage Benefit Package (UCBP)
              </li>
            </ol>
          </article>
        </div>
      </section>

      <section class="summary-grid" aria-label="ภาพรวมระบบ">
        <article class="summary-card">
          <span class="summary-icon summary-icon--blue">
            <i class="bi bi-shield-lock" aria-hidden="true"></i>
          </span>
          <h2>เข้าถึงตามบทบาท</h2>
          <p>ผู้ใช้แต่ละประเภทเห็นเฉพาะหน้าที่และข้อมูลที่เกี่ยวข้องกับความรับผิดชอบของตน</p>
        </article>

        <article class="summary-card">
          <span class="summary-icon summary-icon--green">
            <i class="bi bi-clipboard2-pulse" aria-hidden="true"></i>
          </span>
          <h2>ติดตามการดูแล</h2>
          <p>รองรับการนัดหมาย การประเมิน และการมอบหมาย Home Program อย่างต่อเนื่อง</p>
        </article>

        <article class="summary-card">
          <span class="summary-icon summary-icon--amber">
            <i class="bi bi-people" aria-hidden="true"></i>
          </span>
          <h2>ทำงานร่วมกัน</h2>
          <p>เชื่อมโยง Case Manager นักกิจกรรมบำบัด ผู้ดูแลเด็ก และครอบครัวในกระบวนการเดียวกัน</p>
        </article>
      </section>
    </section>

    <div
      v-if="showWelcomePopup"
      class="welcome-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-popup-title"
    >
      <section class="welcome-popup">
        <header class="welcome-header">
          <div class="partner-logos" aria-label="หน่วยงานร่วมสนับสนุน">
            <div
              v-for="(logo, index) in partnerLogos"
              :key="logo.label"
              class="partner-logo"
              :aria-label="logo.label"
            >
              <img
                v-if="logo.src"
                :src="logo.src"
                :alt="logo.label"
                @error="hideMissingLogo(index)"
              />
              <span v-else>{{ logo.label }}</span>
            </div>
          </div>
        </header>

        <div class="welcome-copy">
          <strong>OT@HOME</strong>
          <p id="welcome-popup-title">ขอต้อนรับเข้าสู่ระบบบริการส่งเสริมพัฒนาการเด็กปฐมวัย</p>
          <p>ด้วยโปรแกรมกิจกรรมบำบัดแบบเข้มข้นที่บ้าน</p>
          <p>เพื่อเพิ่มโอกาสการเข้าถึงบริการแบบไร้รอยต่อ</p>
        </div>

        <button
          class="welcome-button"
          type="button"
          aria-label="เข้าสู่เว็บไซต์"
          title="เข้าสู่เว็บไซต์"
          @click="showWelcomePopup = false"
        >
          เข้าสู่เว็บไซต์
        </button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  overflow-x: hidden;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.16), transparent 24rem),
    linear-gradient(135deg, #ffffff 0%, var(--color-background) 48%, #eef6ff 100%);
}

.top-nav,
.home-shell {
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
}

.top-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  padding: 1.25rem 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 0.8rem;
  min-width: 0;
}

.logo-slot {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border: 1px solid var(--color-border);
  border-radius: 0.8rem;
  background: var(--color-surface);
  box-shadow: 0 10px 28px rgb(59 130 246 / 0.12);
}

.logo-slot::before {
  width: 1.25rem;
  height: 1.25rem;
  border: 0.3rem solid var(--color-primary);
  border-top-color: var(--color-secondary);
  border-radius: 50%;
  content: '';
}

.brand-name {
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 850;
  letter-spacing: 0;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link,
.nav-button {
  display: inline-flex;
  min-height: 2.65rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 850;
  line-height: 1;
  white-space: nowrap;
}

.nav-link {
  padding: 0 0.85rem;
  color: var(--color-muted);
}

.nav-button {
  padding: 0 1.1rem;
  color: #ffffff;
  background: var(--color-primary);
  box-shadow: 0 14px 26px rgb(59 130 246 / 0.22);
}

.user-chip {
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 999px;
  padding: 0.58rem 0.85rem;
  color: var(--color-text);
  background: #ffffff;
  font-size: 0.88rem;
  font-weight: 850;
}

.home-shell {
  display: grid;
  gap: 1.25rem;
  padding: 1rem 0 4rem;
}

.hero-panel,
.objective-panel,
.summary-card {
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 1rem;
  background: rgb(255 255 255 / 0.9);
  box-shadow: 0 20px 54px rgb(31 41 55 / 0.08);
}

.hero-panel {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.42fr);
  gap: 1.25rem;
  align-items: stretch;
  padding: clamp(1.25rem, 4vw, 2rem);
}

.hero-copy {
  display: grid;
  align-content: center;
}

.eyebrow {
  margin: 0 0 0.65rem;
  color: var(--color-primary);
  font-size: 0.82rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

h1,
h2,
p {
  margin: 0;
}

h1,
h2 {
  color: var(--color-text);
  letter-spacing: 0;
}

h1 {
  font-family: var(--brand-font);
  font-size: clamp(2.7rem, 7vw, 5rem);
  font-weight: 900;
  line-height: 0.95;
}

#home-title {
  color: var(--color-primary);
  text-wrap: balance;
}

h2 {
  font-size: clamp(1.15rem, 2.4vw, 1.45rem);
}

.intro {
  max-width: 44rem;
  margin-top: 1rem;
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.8;
}

.privacy-panel {
  display: grid;
  align-content: center;
  gap: 0.65rem;
  border: 1px solid rgb(59 130 246 / 0.18);
  border-radius: 0.9rem;
  padding: 1rem;
  background: linear-gradient(135deg, rgb(59 130 246 / 0.1), transparent 46%), #fbfdff;
}

.privacy-icon,
.summary-icon {
  display: inline-grid;
  place-items: center;
  border-radius: 0.85rem;
}

.privacy-icon {
  width: 3.1rem;
  height: 3.1rem;
  color: #2563eb;
  background: #dbeafe;
  font-size: 1.35rem;
}

.privacy-panel p,
.objective-primary p,
.objective-list,
.summary-card p {
  color: var(--color-muted);
  line-height: 1.7;
}

.objective-panel {
  display: grid;
  gap: 1.1rem;
  padding: clamp(1.1rem, 3vw, 1.5rem);
}

.objective-heading {
  display: grid;
  gap: 0.2rem;
}

.objective-heading .eyebrow {
  margin-bottom: 0;
}

.objective-content {
  display: grid;
  grid-template-columns: minmax(0, 0.95fr) minmax(0, 1.35fr);
  gap: 1rem;
  align-items: start;
}

.objective-primary,
.objective-secondary {
  display: grid;
  gap: 0.7rem;
  min-height: 100%;
  border: 1px solid rgb(219 231 245 / 0.78);
  border-radius: 0.85rem;
  padding: 1rem;
  background: #fbfdff;
}

.objective-primary {
  border-left: 0.3rem solid var(--color-primary);
}

.objective-secondary {
  border-left: 0.3rem solid #34d399;
}

.objective-panel h3 {
  margin: 0;
  color: var(--color-text);
  font-size: 1rem;
  line-height: 1.35;
}

.objective-list {
  display: grid;
  gap: 0.65rem;
  margin: 0;
  padding-left: 1.25rem;
}

.objective-list li::marker {
  color: var(--color-primary);
  font-weight: 900;
}

:global(:root[data-theme='dark']) .objective-panel {
  border-color: rgb(148 163 184 / 0.24);
  background: rgb(30 41 59 / 0.92);
}

:global(:root[data-theme='dark']) .objective-primary,
:global(:root[data-theme='dark']) .objective-secondary {
  border-color: rgb(148 163 184 / 0.22);
  background: rgb(15 23 42 / 0.56);
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
}

.summary-card {
  display: grid;
  gap: 0.75rem;
  align-content: start;
  padding: 1rem;
}

.summary-icon {
  width: 3rem;
  height: 3rem;
  font-size: 1.3rem;
}

.summary-icon--blue {
  color: #2563eb;
  background: #dbeafe;
}

.summary-icon--green {
  color: #047857;
  background: #d1fae5;
}

.summary-icon--amber {
  color: #b45309;
  background: #fef3c7;
}

.welcome-overlay {
  position: fixed;
  z-index: 4000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background:
    radial-gradient(circle at top, rgb(78 115 223 / 0.2), transparent 34rem), rgb(31 41 55 / 0.48);
  backdrop-filter: blur(5px);
}

.welcome-popup {
  position: relative;
  width: min(96vw, 1180px, calc((100vh - 3rem) * 1.738));
  aspect-ratio: 2048 / 1178;
  border: 0;
  border-radius: clamp(0.8rem, 2vw, 1.6rem);
  padding: 0;
  overflow: hidden;
  background: #f8f4ed image-set(url('/welcome/ot-home-popup.jpg') 1x) center / contain no-repeat;
  box-shadow: 0 1.5rem 4rem rgb(31 41 55 / 0.32);
}

.welcome-header,
.welcome-copy {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  clip-path: inset(50%);
  pointer-events: none;
  white-space: nowrap;
}

.partner-logos {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.7rem;
  align-items: center;
}

.partner-logo {
  display: grid;
  height: 4.8rem;
  place-items: center;
  padding: 0.2rem;
  background: transparent;
}

.partner-logo img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.partner-logo span {
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 800;
  text-align: center;
}

.welcome-button {
  position: absolute;
  z-index: 2;
  display: block;
  left: 50%;
  bottom: 15%;
  width: 34%;
  min-width: 12rem;
  height: 10.4%;
  min-height: 2.8rem;
  transform: translateX(-50%);
  border: 0;
  border-radius: 999px;
  color: transparent;
  background: transparent;
  box-shadow: none;
  font-size: 0;
  cursor: pointer;
  appearance: none;
  -webkit-tap-highlight-color: transparent;
  pointer-events: auto;
}

.welcome-button:focus-visible {
  outline: 0.25rem solid rgb(255 255 255 / 0.92);
  outline-offset: 0.25rem;
}

@media (max-width: 860px) {
  .hero-panel,
  .objective-content,
  .summary-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .top-nav,
  .home-shell {
    width: min(100% - 1.25rem, 1120px);
  }

  .top-nav {
    align-items: flex-start;
  }

  .nav-actions {
    gap: 0.45rem;
  }

  .nav-link {
    display: none;
  }

  .brand {
    gap: 0.55rem;
  }

  .logo-slot {
    width: 2.55rem;
    height: 2.55rem;
    border-radius: 0.65rem;
  }

  .brand-name {
    font-size: 1.05rem;
  }

  .user-chip {
    display: none;
  }

  h1 {
    font-size: 3rem;
  }
}
</style>
