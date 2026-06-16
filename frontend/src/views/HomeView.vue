<script setup lang="ts">
import { ref } from "vue"

const showWelcomePopup = ref(true)
const partnerLogos = ref([
  { label: "สคส.", src: "/logos/whaf.png" },
  { label: "ม.มหิดล", src: "/logos/mahidol.png" },
  { label: "สมาคม OT", src: "/logos/otat.jpg" },
  { label: "กระทรวงสาธารณสุข", src: "/logos/moph.png" },
  { label: "สสส.", src: "/logos/thaihealth.png" },
])

function hideMissingLogo(index: number) {
  const logo = partnerLogos.value[index]
  if (logo) {
    logo.src = ""
  }
}
</script>

<template>
  <main class="home-page">
    <nav class="top-nav" aria-label="Main navigation">
      <a class="brand" href="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </a>

      <div class="nav-actions">
        <a class="nav-link" href="/login">เข้าสู่ระบบ</a>
        <a class="nav-button" href="/register">สมัครใช้งาน</a>
      </div>
    </nav>

    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">ระบบบันทึกและติดตามกิจกรรมบำบัดที่บ้าน</p>
        <h1 id="home-title">ddddddddd
        dddddddddd
        dddddddddd
        dddddddd</h1>
        <p class="intro">
          dddddddddddddddddddddddd
          dddddddddddddddddddddddd
          
        </p>

        <div class="hero-actions" aria-label="Primary actions">
          <a class="primary-action" href="/login">เริ่มใช้งาน</a>
          <a class="secondary-action" href="/register">สร้างบัญชีใหม่</a>
        </div>
      </div>

      <div class="hero-visual" aria-label="OT@HOME care overview preview">
        <div class="care-card child-card">
          <span class="card-label">เด็กในความดูแล</span>
          <strong>0</strong>
          <small>กำลังติดตาม</small>
        </div>
        <div class="care-card visit-card">
          <span class="card-label">เยี่ยมบ้าน</span>
          <strong>0</strong>
          <small>สัปดาห์นี้</small>
        </div>
        <div class="care-card note-card">
          <span class="card-label">โฮมโปรแกรม</span>
          <strong>กระโดดเชือก</strong>
          <small>กิจกรรมกล้ามเนื้อมัดเล็ก</small>
        </div>
      </div>
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
          aria-label="เข้าสู่ระบบ"
          title="เข้าสู่ระบบ"
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
  overflow: hidden;
  position: relative;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.15), transparent 24rem),
    linear-gradient(135deg, #ffffff 0%, var(--color-background) 46%, var(--color-background-soft) 100%);
}

.home-page::before {
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
  content: "";
}

.brand-name {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: 0;
  white-space: nowrap;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.nav-link,
.nav-button,
.primary-action,
.secondary-action {
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

.nav-button,
.primary-action {
  padding: 0 1.1rem;
  color: #ffffff;
  background: var(--color-primary);
  box-shadow: 0 14px 26px rgb(59 130 246 / 0.22);
}

.hero {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(20rem, 29rem);
  gap: clamp(2rem, 7vw, 6rem);
  align-items: center;
  width: min(1120px, calc(100% - 2rem));
  min-height: calc(100vh - 5.5rem);
  margin: 0 auto;
  padding: 2rem 0 4rem;
}

.hero-copy {
  max-width: 42rem;
}

.eyebrow {
  margin: 0 0 1rem;
  color: var(--color-primary);
  font-size: 0.95rem;
  font-weight: 800;
}

h1 {
  max-width: 13ch;
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2.6rem, 6vw, 5.4rem);
  line-height: 1.02;
  letter-spacing: 0;
}

.intro {
  max-width: 38rem;
  margin: 1.4rem 0 0;
  color: var(--color-muted);
  font-size: 1.08rem;
  line-height: 1.8;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.85rem;
  margin-top: 2rem;
}

.primary-action,
.secondary-action {
  min-width: 9.5rem;
  padding: 0 1.4rem;
}

.secondary-action {
  border: 1px solid var(--color-border);
  color: var(--color-text);
  background: rgb(255 255 255 / 0.74);
}

.hero-visual {
  position: relative;
  min-height: 29rem;
}

.hero-visual::before {
  position: absolute;
  inset: 3rem 1rem 2rem;
  border: 1px solid rgb(219 231 245 / 0.8);
  border-radius: 2rem;
  background:
    linear-gradient(180deg, rgb(255 255 255 / 0.88), rgb(255 255 255 / 0.54)),
    repeating-linear-gradient(
      90deg,
      transparent 0,
      transparent 4.2rem,
      rgb(96 165 250 / 0.08) 4.2rem,
      rgb(96 165 250 / 0.08) 4.25rem
    );
  box-shadow: 0 28px 80px rgb(31 41 55 / 0.1);
  content: "";
}

.care-card {
  position: absolute;
  display: grid;
  gap: 0.45rem;
  width: min(15rem, 72%);
  min-height: 9rem;
  padding: 1.1rem;
  border: 1px solid rgb(219 231 245 / 0.9);
  border-radius: 0.5rem;
  background: var(--color-surface);
  box-shadow: var(--shadow-soft);
}

.care-card strong {
  color: var(--color-primary);
  font-size: 2.8rem;
  line-height: 1;
}

.care-card small,
.card-label {
  color: var(--color-muted);
}

.card-label {
  font-size: 0.92rem;
  font-weight: 700;
}

.child-card {
  top: 0.5rem;
  left: 0;
}

.visit-card {
  top: 9.5rem;
  right: 0;
}

.note-card {
  right: 5.4rem;
  bottom: 1rem;
}

.welcome-overlay {
  position: fixed;
  z-index: 4000;
  inset: 0;
  display: grid;
  place-items: center;
  padding: clamp(0.75rem, 2vw, 1.5rem);
  background:
    radial-gradient(circle at top, rgb(78 115 223 / 0.2), transparent 34rem),
    rgb(31 41 55 / 0.48);
  backdrop-filter: blur(5px);
}

.welcome-popup {
  position: relative;
  width: min(96vw, 1180px, calc((100vh - 3rem) * 1.777));
  aspect-ratio: 16 / 9;
  border: 0;
  border-radius: clamp(0.8rem, 2vw, 1.6rem);
  padding: 0;
  overflow: hidden;
  background:
    image-set(
      url("/welcome/ot-home-popup.jpg") 1x
    )
    center / cover no-repeat;
  box-shadow: 0 1.5rem 4rem rgb(31 41 55 / 0.32);
}

.welcome-header {
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

.welcome-kicker {
  justify-self: center;
  margin: 0.15rem 0 0.75rem;
  border: 1px solid rgb(59 130 246 / 0.18);
  border-radius: 999px;
  padding: 0.42rem 0.8rem;
  color: var(--color-primary);
  background: rgb(59 130 246 / 0.08);
  font-size: 0.84rem;
  font-weight: 800;
  line-height: 1;
}

.welcome-copy p {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(1rem, 2.1vw, 1.16rem);
  font-weight: 650;
  line-height: 1.72;
}

.welcome-copy strong {
  display: block;
  color: var(--color-primary);
  font-size: clamp(2.6rem, 7vw, 4.2rem);
  font-weight: 900;
  line-height: 1;
  letter-spacing: 0;
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

@media (max-width: 820px) {
  .top-nav {
    align-items: flex-start;
  }

  .nav-actions {
    gap: 0.35rem;
  }

  .nav-link,
  .nav-button {
    min-height: 2.5rem;
    padding: 0 0.75rem;
    font-size: 0.92rem;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 1.5rem;
    min-height: auto;
    padding-top: 2.5rem;
  }

  h1 {
    max-width: 11ch;
    font-size: 3rem;
  }

  .hero-visual {
    min-height: 24rem;
  }

  .note-card {
    right: 2rem;
  }
}

@media (max-width: 560px) {
  .top-nav {
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

  .hero {
    width: min(100% - 1.25rem, 1120px);
    padding-bottom: 2.5rem;
  }

  h1 {
    font-size: 2.55rem;
  }

  .intro {
    font-size: 1rem;
  }

  .primary-action,
  .secondary-action {
    width: 100%;
  }

  .hero-visual {
    min-height: 22rem;
  }

  .care-card {
    width: min(13.5rem, 80%);
  }

  .partner-logo {
    height: 3.55rem;
  }
}
</style>
