<script setup lang="ts">
import { ref } from 'vue'

const privacyNoticeStorageKey = 'otathome-registration-privacy-notice-accepted'
const showPrivacyNotice = ref(
  typeof window !== 'undefined' && localStorage.getItem(privacyNoticeStorageKey) !== 'true',
)

function acceptPrivacyNotice() {
  localStorage.setItem(privacyNoticeStorageKey, 'true')
  showPrivacyNotice.value = false
}

const roles = [
  {
    title: 'ผู้ปกครอง',
    description: 'สำหรับผู้ปกครองที่ต้องการติดตามข้อมูลและบันทึกการดูแลเด็กที่บ้าน',
    path: '/register/parent',
    accent: 'parent',
  },
  {
    title: 'นักกิจกรรมบำบัด',
    description: 'สำหรับนักกิจกรรมบำบัดหรือผู้เชี่ยวชาญที่ดูแลและบันทึกแผนการบำบัด',
    path: '/register/caregiver',
    accent: 'caregiver',
  },
  {
    title: 'ผู้ดูแลเด็ก',
    description: 'สำหรับผู้ดูแลในชุมชนหรืออสม. ที่ช่วยติดตามและส่งต่อข้อมูลการดูแล',
    path: '/register/village-volunteer',
    accent: 'volunteer',
  },
]
</script>

<template>
  <main class="register-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>

      <div class="nav-actions">
        <RouterLink class="nav-link" to="/">หน้าแรก</RouterLink>
        <RouterLink class="nav-button" to="/login">เข้าสู่ระบบ</RouterLink>
      </div>
    </nav>

    <section class="register-shell" aria-labelledby="register-title">
      <div class="page-heading">
        <h1 id="register-title">เลือกประเภทบัญชี</h1>
        <p>เลือกบทบาทที่ตรงกับการใช้งานของท่าน</p>
      </div>

      <div class="role-grid">
        <RouterLink v-for="role in roles" :key="role.path" class="role-card" :to="role.path">
          <span class="role-content">
            <strong>{{ role.title }}</strong>
            <span>{{ role.description }}</span>
          </span>
          <span class="role-arrow" aria-hidden="true">›</span>
        </RouterLink>
      </div>
    </section>

    <div
      v-if="showPrivacyNotice"
      class="registration-notice-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="registration-notice-title"
    >
      <section class="registration-notice-card">
        <span class="notice-icon" aria-hidden="true">
          <i class="bi bi-shield-lock"></i>
        </span>
        <div>
          <p class="eyebrow">Privacy Notice</p>
          <h2 id="registration-notice-title">การใช้งานข้อมูลส่วนบุคคล</h2>
          <p>
            ระบบจะแสดงข้อมูลเด็ก ครอบครัว และผลประเมินเฉพาะผู้ใช้งานที่มีสิทธิ์ตามบทบาทเท่านั้น
            กรุณาใช้งานข้อมูลเพื่อการให้บริการส่งเสริมพัฒนาการเด็กตามวัตถุประสงค์ของโครงการ
          </p>
        </div>
        <button type="button" class="primary-action" @click="acceptPrivacyNotice">รับทราบ</button>
      </section>
    </div>
  </main>
</template>

<style scoped>
.register-page {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.15), transparent 24rem),
    linear-gradient(
      135deg,
      #ffffff 0%,
      var(--color-background) 46%,
      var(--color-background-soft) 100%
    );
}

.register-page::before {
  display: none;
}

.top-nav {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  width: min(1120px, calc(100% - 2rem));
  margin: 0 auto;
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
  font-weight: 800;
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
  min-height: 2.75rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.5rem;
  font-weight: 700;
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

.register-shell {
  position: relative;
  z-index: 1;
  width: min(980px, calc(100% - 2rem));
  margin: 0 auto;
  padding: clamp(2.5rem, 8vw, 5.5rem) 0 4rem;
}

.page-heading {
  max-width: 42rem;
}

.eyebrow {
  margin: 0 0 0.85rem;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 800;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2.1rem, 5vw, 4.2rem);
  line-height: 1.08;
  letter-spacing: 0;
}

.page-heading p:not(.eyebrow) {
  max-width: 38rem;
  margin: 1rem 0 0;
  color: var(--color-muted);
  font-size: 1.05rem;
  line-height: 1.8;
}

.role-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  margin-top: 2.5rem;
}

.role-card {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1rem;
  align-items: start;
  min-height: 15rem;
  padding: 1.15rem;
  border: 1px solid var(--color-border);
  border-radius: 0.5rem;
  background: rgb(255 255 255 / 0.92);
  box-shadow: var(--shadow-soft);
  transition:
    border-color 160ms ease,
    box-shadow 160ms ease,
    transform 160ms ease;
}

.role-card:hover,
.role-card:focus-visible {
  border-color: rgb(59 130 246 / 0.55);
  box-shadow: 0 24px 56px rgb(59 130 246 / 0.16);
  transform: translateY(-2px);
  outline: none;
}

.role-content {
  display: grid;
  gap: 0.7rem;
}

.role-content strong {
  color: var(--color-text);
  font-size: 1.35rem;
  line-height: 1.25;
}

.role-content span {
  color: var(--color-muted);
  font-size: 0.98rem;
  line-height: 1.75;
}

.role-arrow {
  color: var(--color-primary);
  font-size: 2rem;
  line-height: 1;
}

.registration-notice-overlay {
  position: fixed;
  z-index: 4200;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 1rem;
  background: rgb(15 23 42 / 0.58);
  backdrop-filter: blur(5px);
}

.registration-notice-card {
  display: grid;
  gap: 1rem;
  width: min(92vw, 34rem);
  border: 1px solid rgb(219 231 245 / 0.92);
  border-radius: 1rem;
  padding: 1.25rem;
  background: var(--color-surface);
  box-shadow: 0 24px 60px rgb(31 41 55 / 0.24);
}

.notice-icon {
  display: inline-grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 0.85rem;
  color: #2563eb;
  background: #dbeafe;
  font-size: 1.35rem;
}

.registration-notice-card h2 {
  margin: 0;
  color: var(--color-text);
  font-size: 1.35rem;
}

.registration-notice-card p:not(.eyebrow) {
  margin: 0.65rem 0 0;
  color: var(--color-muted);
  line-height: 1.75;
}

:global(:root[data-theme='dark']) .registration-notice-card {
  border-color: rgb(148 163 184 / 0.24);
  background: rgb(30 41 59 / 0.96);
}

:global(:root[data-theme='dark']) .registration-notice-card h2 {
  color: #eef4ff;
}

:global(:root[data-theme='dark']) .registration-notice-card p:not(.eyebrow) {
  color: #cbd8ee;
}

@media (max-width: 860px) {
  .role-grid {
    grid-template-columns: 1fr;
  }

  .role-card {
    min-height: 0;
  }
}

@media (max-width: 560px) {
  .top-nav,
  .register-shell {
    width: min(100% - 1.25rem, 1120px);
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

  .nav-link {
    display: none;
  }

  .nav-button {
    min-height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.92rem;
  }

  .role-arrow {
    display: none;
  }
}
</style>
