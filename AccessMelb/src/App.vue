<template>
  <a href="#main-content" class="skip-link">Skip to main content</a>

  <AppNav />

  <main id="main-content" tabindex="-1">
    <RouterView v-slot="{ Component }">
      <Transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </main>

  <footer class="site-footer" role="contentinfo">
    <div class="page-container site-footer-inner">
      <span class="site-footer-logo">Access<span>Melb</span></span>
      <p class="site-footer-copy">© {{ year }} AccessMelb · Data: City of Melbourne Open Data · Maps: Geoapify / OpenStreetMap</p>
    </div>
  </footer>
</template>

<script setup>
import AppNav from '../src/components/AppNav.vue'
const year = new Date().getFullYear()
</script>

<style>
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to   { opacity: 0; transform: translateY(-8px); }

.site-footer {
  background: var(--t900);
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 32px 0;
}
.site-footer-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.site-footer-logo {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--w0);
}
.site-footer-logo span { color: var(--t300); }
.site-footer-copy {
  font-size: 12px;
  color: rgba(255,255,255,0.30);
}
</style>