<script setup lang="ts">
import { computed } from "vue"
import { RouterLink } from "vue-router"

const props = defineProps<{
  title: string
}>()

const pageTitle = computed(() => props.title)
</script>

<template>
  <main class="role-page">
    <nav class="top-nav" aria-label="Main navigation">
      <RouterLink class="brand" to="/" aria-label="OT@HOME home">
        <span class="logo-slot" aria-hidden="true"></span>
        <span class="brand-name">OT@HOME</span>
      </RouterLink>
    </nav>

    <section class="blank-shell" aria-labelledby="role-title">
      <h1 id="role-title">{{ pageTitle }}</h1>
    </section>
  </main>
</template>

<style scoped>
.role-page {
  min-height: 100vh;
  background:
    radial-gradient(circle at top right, rgb(96 165 250 / 0.15), transparent 24rem),
    linear-gradient(135deg, #ffffff 0%, var(--color-background) 46%, var(--color-background-soft) 100%);
}

.top-nav,
.blank-shell {
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
  color: var(--color-text);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: 0;
  white-space: nowrap;
}

.blank-shell {
  display: grid;
  min-height: calc(100vh - 5.5rem);
  place-items: center;
  padding: 2rem 0 5rem;
}

h1 {
  margin: 0;
  color: var(--color-text);
  font-size: clamp(2rem, 5vw, 4rem);
  line-height: 1.08;
  letter-spacing: 0;
}
</style>
