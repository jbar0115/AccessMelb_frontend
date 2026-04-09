<template>
  <header class="nav" role="banner">
    <div class="nav-inner page-container">

      <!-- Logo -->
      <RouterLink to="/" class="logo" aria-label="AccessMelb home">
        Access<span>Melb</span>
      </RouterLink>

      <!-- Desktop links -->
      <nav class="nav-links" aria-label="Main navigation">
        <RouterLink to="/" :class="['nav-link', { active: route.name === 'home' }]">
          Destinations
        </RouterLink>
        <a href="#about" class="nav-link">About</a>
      </nav>

      <!-- Mobile hamburger -->
      <button
        class="hamburger"
        :aria-expanded="menuOpen.toString()"
        aria-controls="mobile-menu"
        aria-label="Toggle navigation menu"
        @click="toggleMenu"
      >
        <span class="ham-bar" :class="{ open: menuOpen }" />
        <span class="ham-bar" :class="{ open: menuOpen }" />
        <span class="ham-bar" :class="{ open: menuOpen }" />
      </button>
    </div>

    <!-- Mobile dropdown menu -->
    <Transition name="menu-slide">
      <div
        v-if="menuOpen"
        id="mobile-menu"
        class="mobile-menu"
        role="navigation"
        aria-label="Mobile navigation"
      >
        <RouterLink to="/" class="mobile-link" @click="closeMenu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
            <polyline points="9,22 9,12 15,12 15,22"/>
          </svg>
          Destinations
        </RouterLink>
        <a href="#about" class="mobile-link" @click="closeMenu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          About
        </a>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const menuOpen = ref(false)

const toggleMenu = () => { menuOpen.value = !menuOpen.value }
const closeMenu  = () => { menuOpen.value = false }
</script>

<style scoped>
.nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--t800);
  border-bottom: 1px solid rgba(255,255,255,0.07);
}

.nav-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--nav-height);
}

/* Logo */
.logo {
  font-family: 'DM Serif Display', serif;
  font-size: 20px;
  color: var(--w0);
  letter-spacing: -0.3px;
  flex-shrink: 0;
}
.logo span { color: var(--t300); }

/* Desktop nav links */
.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}
.nav-link {
  padding: 8px 16px;
  min-height: var(--touch-min);
  display: flex;
  align-items: center;
  border-radius: var(--r-xs);
  font-size: 14px;
  font-weight: 500;
  color: rgba(255,255,255,0.68);
  transition: background var(--tr), color var(--tr);
}
.nav-link:hover,
.nav-link.active {
  background: rgba(255,255,255,0.10);
  color: var(--w0);
}
.nav-link.active { font-weight: 700; }

/* Hamburger */
.hamburger {
  display: none;
  flex-direction: column;
  justify-content: center;
  gap: 5px;
  padding: 10px;
  background: rgba(255,255,255,0.08);
  border-radius: var(--r-xs);
  border: 1px solid rgba(255,255,255,0.12);
  min-width: var(--touch-min);
  min-height: var(--touch-min);
}
.ham-bar {
  width: 20px;
  height: 2px;
  background: var(--w0);
  border-radius: 2px;
  transition: transform var(--tr), opacity var(--tr);
  display: block;
}
.ham-bar.open:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
.ham-bar.open:nth-child(2) { opacity: 0; }
.ham-bar.open:nth-child(3) { transform: rotate(-45deg) translate(5px, -5px); }

/* Mobile menu */
.mobile-menu {
  background: var(--t900);
  border-top: 1px solid rgba(255,255,255,0.07);
  padding: 8px 0 16px;
}
.mobile-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px var(--page-px);
  font-size: 15px;
  font-weight: 500;
  color: rgba(255,255,255,0.80);
  min-height: var(--touch-min);
  transition: background var(--tr), color var(--tr);
}
.mobile-link:hover {
  background: rgba(255,255,255,0.07);
  color: var(--w0);
}

/* Menu animation */
.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.menu-slide-enter-from,
.menu-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Responsive */
@media (max-width: 640px) {
  .nav-links  { display: none; }
  .hamburger  { display: flex; }
}
</style>