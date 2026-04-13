<template>
  <div class="home">
    <section class="hero" aria-label="AccessMelb homepage hero">
      <div class="hero-atmo" aria-hidden="true"></div>
      <div class="hero-grid" aria-hidden="true"></div>

      <!-- Floating decorative icons -->
      <div class="hero-floats" aria-hidden="true">
        <i class="pi pi-user float-icon" style="top:12%;left:68%;animation-duration:7s"></i>
        <i class="pi pi-car float-icon" style="top:55%;left:82%;animation-delay:1.5s;animation-duration:9s"></i>
        <i class="pi pi-map-marker float-icon" style="top:78%;left:62%;animation-delay:3s;animation-duration:8s"></i>
        <i class="pi pi-building-columns float-icon" style="top:25%;left:90%;animation-delay:0.8s;animation-duration:10s"></i>
        <i class="pi pi-heart float-icon" style="top:65%;left:72%;animation-delay:2s;animation-duration:7.5s"></i>
      </div>

      <div class="hero-inner page-container">

        <!-- LEFT: Copy -->
        <div class="hero-copy">
          <div class="hero-eyebrow">
            <span class="eyebrow-dot" aria-hidden="true"></span>
            City of Melbourne - Accessibility Guide
          </div>

          <h1>What <em>accessible</em> destinations exist in Melbourne?</h1>

          <p class="hero-sub">
            Explore community and cultural venues across Melbourne with
            nearby accessible toilet information - all in one place,
            built for everyone.
          </p>

          <!-- Stats -->
          <div class="hero-stats" role="list" aria-label="Site statistics">
            <div class="stat-item" role="listitem">
              <div class="stat-num">{{ displayCount }}</div>
              <div class="stat-label">Destinations</div>
            </div>
            <div class="stat-div" aria-hidden="true"></div>
            <div class="stat-item" role="listitem">
              <div class="stat-num">{{ categories.length }}</div>
              <div class="stat-label">Categories</div>
            </div>
            <div class="stat-div" aria-hidden="true"></div>
            <div class="stat-item" role="listitem">
              <div class="stat-num">Live</div>
              <div class="stat-label">Updated data</div>
            </div>
          </div>

          <!-- Search -->
          <div class="search-wrap" role="search">
            <label for="hero-search" class="sr-only">Search destinations</label>
            <i class="pi pi-search search-icon" aria-hidden="true"></i>
            <input
              id="hero-search"
              v-model="searchQuery"
              @input="onSearch"
              class="search-input"
              type="search"
              placeholder="Search for a gallery, library, theatre..."
              autocomplete="off"
            />
          </div>
        </div>

        <!-- RIGHT: City illustration -->
        <div class="hero-illustration-col" aria-hidden="true">
          <div class="hero-illus-wrap">

            <!-- Badge 1 -->
            <div class="illus-badge">
              <i class="pi pi-check badge-check-icon"></i>
              <span class="badge-text">Wheelchair accessible</span>
            </div>

            <!-- Badge 2 -->
            <div class="illus-badge2">
              <i class="pi pi-map-marker badge-map-icon"></i>
              <span class="badge-text2">Accessible toilet nearby</span>
            </div>

            <!-- Melbourne city scene SVG (pure shapes, no emojis) -->
            <svg class="city-svg" viewBox="0 0 460 380" xmlns="http://www.w3.org/2000/svg" fill="none">
              <defs>
                <linearGradient id="skyG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(21,168,168,0.08)"/>
                  <stop offset="100%" stop-color="rgba(3,46,46,0.15)"/>
                </linearGradient>
                <linearGradient id="buildG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.18)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0.08)"/>
                </linearGradient>
                <linearGradient id="build2G" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.14)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0.06)"/>
                </linearGradient>
                <linearGradient id="roadG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="rgba(255,255,255,0.10)"/>
                  <stop offset="100%" stop-color="rgba(255,255,255,0.04)"/>
                </linearGradient>
              </defs>
              <rect width="460" height="380" fill="url(#skyG)" rx="20"/>
              <rect x="30" y="80" width="60" height="250" rx="4" fill="url(#buildG)" stroke="rgba(255,255,255,0.15)" stroke-width="1"/>
              <rect x="40" y="95"  width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="62" y="95"  width="14" height="10" rx="2" fill="rgba(255,255,255,0.20)"/>
              <rect x="40" y="115" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="62" y="115" width="14" height="10" rx="2" fill="rgba(255,255,255,0.35)"/>
              <rect x="40" y="135" width="14" height="10" rx="2" fill="rgba(255,255,255,0.20)"/>
              <rect x="62" y="135" width="14" height="10" rx="2" fill="rgba(255,255,255,0.25)"/>
              <rect x="40" y="155" width="14" height="10" rx="2" fill="rgba(255,255,255,0.30)"/>
              <rect x="62" y="155" width="14" height="10" rx="2" fill="rgba(255,255,255,0.20)"/>
              <rect x="105" y="130" width="80" height="200" rx="4" fill="url(#build2G)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
              <rect x="115" y="145" width="16" height="12" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="140" y="145" width="16" height="12" rx="2" fill="rgba(255,255,255,0.30)"/>
              <rect x="160" y="145" width="16" height="12" rx="2" fill="rgba(255,255,255,0.18)"/>
              <rect x="115" y="170" width="16" height="12" rx="2" fill="rgba(255,255,255,0.28)"/>
              <rect x="140" y="170" width="16" height="12" rx="2" fill="rgba(255,255,255,0.20)"/>
              <rect x="115" y="195" width="16" height="12" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="200" y="160" width="55" height="170" rx="3" fill="url(#buildG)" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
              <rect x="210" y="175" width="12" height="10" rx="2" fill="rgba(255,255,255,0.22)"/>
              <rect x="230" y="175" width="12" height="10" rx="2" fill="rgba(255,255,255,0.30)"/>
              <rect x="270" y="100" width="45" height="230" rx="3" fill="url(#build2G)" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
              <polygon points="292,60 283,100 302,100" fill="rgba(255,255,255,0.25)"/>
              <rect x="278" y="115" width="10" height="9" rx="2" fill="rgba(255,255,255,0.28)"/>
              <rect x="297" y="115" width="10" height="9" rx="2" fill="rgba(255,255,255,0.20)"/>
              <rect x="330" y="200" width="100" height="130" rx="3" fill="url(#buildG)" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
              <rect x="0" y="328" width="460" height="52" fill="url(#roadG)"/>
              <line x1="0" y1="354" x2="460" y2="354" stroke="rgba(255,255,255,0.12)" stroke-width="1" stroke-dasharray="30 14"/>
              <rect x="0" y="325" width="460" height="6" fill="rgba(255,255,255,0.10)"/>
              <!-- Animated tram -->
              <g class="illus-tram">
                <rect x="60" y="295" width="120" height="32" rx="6" fill="rgba(21,168,168,0.70)" stroke="rgba(255,255,255,0.35)" stroke-width="1.5"/>
                <rect x="70"  y="301" width="20" height="16" rx="3" fill="rgba(255,255,255,0.50)"/>
                <rect x="97"  y="301" width="20" height="16" rx="3" fill="rgba(255,255,255,0.40)"/>
                <rect x="124" y="301" width="20" height="16" rx="3" fill="rgba(255,255,255,0.50)"/>
                <rect x="60" y="295" width="120" height="5" rx="3" fill="rgba(255,255,255,0.25)"/>
                <circle cx="85"  cy="328" r="5" fill="rgba(255,255,255,0.60)"/>
                <circle cx="155" cy="328" r="5" fill="rgba(255,255,255,0.60)"/>
                <line x1="100" y1="295" x2="110" y2="278" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
                <line x1="110" y1="278" x2="140" y2="278" stroke="rgba(255,255,255,0.50)" stroke-width="1.5"/>
                <line x1="140" y1="278" x2="150" y2="295" stroke="rgba(255,255,255,0.40)" stroke-width="1.5"/>
              </g>
              <!-- Wheelchair user -->
              <g class="illus-person">
                <circle cx="356" cy="312" r="6.5" fill="rgba(255,255,255,0.92)"/>
                <line x1="356" y1="318" x2="356" y2="336" stroke="rgba(255,255,255,0.88)" stroke-width="5.5" stroke-linecap="round"/>
                <line x1="356" y1="326" x2="343" y2="326" stroke="rgba(255,255,255,0.82)" stroke-width="5" stroke-linecap="round"/>
                <line x1="341" y1="336" x2="362" y2="336" stroke="rgba(255,255,255,0.85)" stroke-width="5" stroke-linecap="round"/>
                <line x1="341" y1="336" x2="333" y2="347" stroke="rgba(255,255,255,0.80)" stroke-width="5" stroke-linecap="round"/>
                <line x1="326" y1="347" x2="340" y2="347" stroke="rgba(255,255,255,0.70)" stroke-width="4" stroke-linecap="round"/>
                <g>
                  <circle cx="348" cy="360" r="16" stroke="rgba(255,255,255,0.88)" stroke-width="3" fill="none"/>
                  <circle cx="348" cy="360" r="2.5" fill="rgba(255,255,255,0.92)"/>
                  <line x1="348" y1="344" x2="348" y2="376" stroke="rgba(255,255,255,0.42)" stroke-width="1.5"/>
                  <line x1="332" y1="360" x2="364" y2="360" stroke="rgba(255,255,255,0.42)" stroke-width="1.5"/>
                  <animateTransform attributeName="transform" type="rotate" from="0 348 360" to="-360 348 360" dur="0.85s" repeatCount="indefinite"/>
                </g>
              </g>
              <!-- Accessibility pin -->
              <g transform="translate(292,250)">
                <circle class="illus-pin-pulse"  cx="0" cy="0" r="10" stroke="rgba(61,201,201,0.6)" stroke-width="1.5" fill="none"/>
                <circle class="illus-pin-pulse2" cx="0" cy="0" r="10" stroke="rgba(61,201,201,0.4)" stroke-width="1" fill="none"/>
                <path d="M0 -22 C-8 -22 -14 -16 -14 -8 C-14 0 0 18 0 18 C0 18 14 0 14 -8 C14 -16 8 -22 0 -22 Z" fill="rgba(21,168,168,0.90)" stroke="rgba(255,255,255,0.50)" stroke-width="1.5"/>
                <circle cx="0" cy="-12" r="3.5" fill="white"/>
                <line x1="0" y1="-8" x2="0" y2="-1" stroke="white" stroke-width="2.2" stroke-linecap="round"/>
                <circle cx="0" cy="5" r="4" stroke="white" stroke-width="1.8" fill="none"/>
              </g>
              <circle cx="415" cy="310" r="18" fill="rgba(13,138,74,0.35)"/>
              <rect x="412" y="320" width="6" height="14" rx="2" fill="rgba(13,138,74,0.50)"/>
              <circle cx="420" cy="100" r="80" stroke="rgba(61,201,201,0.10)" stroke-width="1.5" fill="none"/>
            </svg>
          </div>
        </div>
      </div>
    </section>

    <!-- Wave -->
    <div class="wave-sep" aria-hidden="true">
      <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="height:52px;width:100%;">
        <path d="M0,0 L1440,0 L1440,20 Q1080,62 720,42 Q360,22 0,54 Z" fill="#054040"/>
      </svg>
    </div>

    <!-- DESTINATIONS SECTION -->
    <section class="venues-section" aria-labelledby="venues-heading">
      <div class="venues-inner page-container">

        <div class="venues-header">
          <h2 id="venues-heading" class="venues-title">Destinations in Melbourne</h2>
          <span class="venues-count-badge" aria-live="polite" aria-atomic="true">
            {{ totalCount }} destination{{ totalCount !== 1 ? 's' : '' }}
          </span>
        </div>

        <!-- Filters -->
        <div class="filters-light" role="group" aria-label="Filter destinations by category">
          <button
            v-for="cat in filterOptions"
            :key="cat.value"
            class="chip-light"
            :class="{ active: activeFilter === cat.value }"
            :aria-pressed="activeFilter === cat.value"
            @click="setFilter(cat.value)"
          >
            <i :class="['pi', cat.icon]" aria-hidden="true"></i>
            {{ cat.label }}
          </button>
        </div>

        <!-- Error state -->
        <div v-if="error" class="error-state" role="alert">
          <i class="pi pi-exclamation-circle" style="font-size:2rem;color:var(--red)" aria-hidden="true"></i>
          <p>Unable to load destinations. Please try again.</p>
          <button class="retry-btn" @click="fetchDestinations">
            <i class="pi pi-refresh" aria-hidden="true"></i>
            Retry
          </button>
        </div>

        <!-- Loading skeletons -->
        <div v-else-if="loading" class="venue-grid" aria-busy="true" aria-label="Loading destinations">
          <div v-for="n in 6" :key="n" class="venue-card-skeleton">
            <div class="skel-top">
              <div class="skeleton skel-title"></div>
              <div class="skeleton skel-icon"></div>
            </div>
            <div class="skeleton skel-addr"></div>
            <div class="skeleton skel-foot"></div>
          </div>
        </div>

        <!-- Destination cards -->
        <div v-else class="venue-grid" role="list" aria-label="Destinations list">
          <article
            v-for="dest in filteredDestinations"
            :key="dest.destination_id"
            class="venue-card"
            role="listitem"
            tabindex="0"
            :aria-label="`${dest.feature_name}, ${dest.sub_theme}. Click to view details.`"
            @click="goToDetail(dest.destination_id)"
            @keydown.enter="goToDetail(dest.destination_id)"
            @keydown.space.prevent="goToDetail(dest.destination_id)"
          >
            <div class="card-top">
              <h3 class="venue-name">{{ dest.feature_name }}</h3>
              <div class="venue-icon" :class="getCategoryStyle(dest.category).iconBg" aria-hidden="true">
                <i :class="['pi', getCategoryStyle(dest.category).icon]"></i>
              </div>
            </div>

            <div class="venue-address">
              <span class="addr-dot" aria-hidden="true"></span>
              {{ dest.sub_theme }}
            </div>

            <div class="card-foot">
              <span class="type-badge" :class="getCategoryStyle(dest.category).badge">
                {{ formatCategory(dest.category) }}
              </span>
              <i class="pi pi-arrow-right card-arr" aria-hidden="true"></i>
            </div>
          </article>

          <!-- No results -->
          <div v-if="filteredDestinations.length === 0 && !loading" class="no-results" role="status">
            <i class="pi pi-search" style="font-size:2rem;color:var(--w400)" aria-hidden="true"></i>
            <p>No destinations found for <strong>"{{ searchQuery }}"</strong></p>
            <button class="retry-btn" @click="clearSearch">
              <i class="pi pi-times" aria-hidden="true"></i>
              Clear search
            </button>
          </div>
        </div>

        <!-- PAGINATION -->
        <nav
          v-if="totalPages > 1"
          class="pagination"
          aria-label="Destination pages"
        >
          <button
            class="page-btn page-prev"
            :disabled="currentPage === 1"
            :aria-disabled="currentPage === 1"
            aria-label="Previous page"
            @click="goToPage(currentPage - 1)"
          >
            <i class="pi pi-chevron-left" aria-hidden="true"></i>
          </button>

          <button
            v-for="page in paginationPages"
            :key="page"
            class="page-btn"
            :class="{
              'page-active':   page === currentPage,
              'page-ellipsis': page === '...'
            }"
            :aria-label="page === '...' ? 'More pages' : `Page ${page}`"
            :aria-current="page === currentPage ? 'page' : undefined"
            :disabled="page === '...'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            class="page-btn page-next"
            :disabled="currentPage === totalPages"
            :aria-disabled="currentPage === totalPages"
            aria-label="Next page"
            @click="goToPage(currentPage + 1)"
          >
            <i class="pi pi-chevron-right" aria-hidden="true"></i>
          </button>
        </nav>

      </div>
    </section>
    <!-- ABOUT SECTION -->
    <section id="about" class="about-section" aria-labelledby="about-heading">
      <div class="about-inner page-container">
        <div class="about-grid">
          <div class="about-text">
            <h2 id="about-heading" class="about-title">About AccessMelb</h2>
            <p class="about-desc">
              AccessMelb helps people with mobility-related access needs discover
              destinations across the City of Melbourne - with nearby accessible
              toilet information, all in one place.
            </p>
            <p class="about-desc">
              AccessMelb gives you the information you need before you visit.
            </p>
          </div>
          <div class="about-cards">
            <div class="about-card">
              <div class="about-card-icon">
                <i class="pi pi-map-marker" aria-hidden="true"></i>
              </div>
              <h3 class="about-card-title">Destinations</h3>
              <p class="about-card-text">Browse community and cultural venues across Melbourne.</p>
            </div>
            <div class="about-card">
              <div class="about-card-icon">
                <i class="pi pi-info-circle" aria-hidden="true"></i>
              </div>
              <h3 class="about-card-title">Toilet Access</h3>
              <p class="about-card-text">Find nearby accessible toilets for every destination.</p>
            </div>
            <div class="about-card">
              <div class="about-card-icon">
                <i class="pi pi-database" aria-hidden="true"></i>
              </div>
              <h3 class="about-card-title">Open Data</h3>
              <p class="about-card-text">Sourced from the City of Melbourne Open Data Portal.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const destinations = ref([])
const loading      = ref(true)
const error        = ref(false)
const searchQuery  = ref('')
const activeFilter = ref('all')
const totalCount   = ref(0)
const currentPage   = ref(1)
const itemsPerPage  = 9

const filterOptions = [
  { value: 'all',       label: 'All venues',  icon: 'pi-th-large'          },
  { value: 'gallery',   label: 'Galleries',   icon: 'pi-palette'           },
  { value: 'library',   label: 'Libraries',   icon: 'pi-book'              },
  { value: 'theatre',   label: 'Theatres',    icon: 'pi-star'              },
  { value: 'community', label: 'Community',   icon: 'pi-users'             },
]

async function fetchDestinations() {
  loading.value = true
  error.value   = false
  const offset = (currentPage.value - 1) * itemsPerPage
  try {
    const params = new URLSearchParams({ limit: itemsPerPage, offset: offset,
      ...(activeFilter.value !== 'all' && { category: activeFilter.value }),
      ...(searchQuery.value && { search: searchQuery.value }) })
    const res  = await fetch(`${import.meta.env.VITE_API_BASE_URL}/destinations?${params}`)
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    destinations.value = data.destinations || []
    totalCount.value   = data.count || 0
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

const categories = computed(() => {
  const cats = new Set(destinations.value.map(d => d.category))
  return [...cats]
})

const displayCount = computed(() =>
  totalCount.value ? `${totalCount.value}+` : '...'
)

const filteredDestinations = computed(() => destinations.value)

const totalPages = computed(() => Math.ceil(totalCount.value / itemsPerPage))

const paginationPages = computed(() => {
  const total = totalPages.value
  const curr  = currentPage.value
  const pages = []
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i)
  } else {
    pages.push(1)
    if (curr > 3) pages.push('...')
    for (let i = Math.max(2, curr - 1); i <= Math.min(total - 1, curr + 1); i++) pages.push(i)
    if (curr < total - 2) pages.push('...')
    pages.push(total)
  }
  return pages
})

function setFilter(val) {
  activeFilter.value = val
  currentPage.value  = 1
  fetchDestinations()
}

function clearSearch() {
  searchQuery.value  = ''
  activeFilter.value = 'all'
  currentPage.value  = 1
  fetchDestinations()
}

let searchTimer = null
function onSearch() {
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    currentPage.value = 1
    fetchDestinations()
  }, 400)
}

function goToPage(page) {
  if (page === '...' || page === currentPage.value) return
  currentPage.value = page
  fetchDestinations()
  window.scrollTo({ top: document.querySelector('.venues-section')?.offsetTop - 80 || 0, behavior: 'smooth' })
}


function goToDetail(id) { router.push({ name: 'detail', params: { id } }) }

function getCategoryStyle(category) {
  const map = {
    gallery:   { icon: 'pi-palette',          iconBg: 'icon-bg-gallery',   badge: 'b-gallery'   },
    museum:    { icon: 'pi-building-columns',  iconBg: 'icon-bg-museum',    badge: 'b-museum'    },
    library:   { icon: 'pi-book',             iconBg: 'icon-bg-library',   badge: 'b-library'   },
    theatre:   { icon: 'pi-star',             iconBg: 'icon-bg-theatre',   badge: 'b-theatre'   },
    community: { icon: 'pi-users',            iconBg: 'icon-bg-community', badge: 'b-community' },
    sport:     { icon: 'pi-heart',            iconBg: 'icon-bg-sport',     badge: 'b-sport'     },
    landmark:  { icon: 'pi-map-marker',       iconBg: 'icon-bg-landmark',  badge: 'b-landmark'  },
  }
  return map[category?.toLowerCase()] || { icon: 'pi-map-marker', iconBg: 'icon-bg-default', badge: 'b-default' }
}

function formatCategory(cat) {
  if (!cat) return 'Venue'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

onMounted(fetchDestinations)
</script>

<style scoped>
/*  HERO  */
.hero {
  position: relative; overflow: hidden;
  background: var(--t800);
  min-height: calc(100svh - var(--nav-height));
  display: flex; align-items: center;
  padding: clamp(40px, 6vw, 80px) 0;
}
.hero-atmo {
  position: absolute; inset: 0; pointer-events: none;
  background:
    radial-gradient(ellipse 55% 70% at 78% 20%, rgba(21,168,168,0.22) 0%, transparent 55%),
    radial-gradient(ellipse 45% 55% at 10% 85%, rgba(3,46,46,0.80)    0%, transparent 50%),
    radial-gradient(ellipse 90% 60% at 50% 60%, rgba(10,92,92,0.30)   0%, transparent 80%);
}
.hero-grid {
  position: absolute; inset: 0;
  background-image:
    linear-gradient(rgba(255,255,255,0.045) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255,255,255,0.045) 1px, transparent 1px);
  background-size: 48px 48px;
}

/* Floating PrimeIcons */
.hero-floats { position: absolute; inset: 0; pointer-events: none; }
.float-icon {
  position: absolute;
  font-size: 22px;
  color: white;
  opacity: 0.10;
  animation: float-drift 8s ease-in-out infinite;
}
@keyframes float-drift {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  33%       { transform: translateY(-14px) rotate(3deg); }
  66%       { transform: translateY(8px) rotate(-2deg); }
}

.hero-inner {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 5vw, 80px);
  align-items: center;
  position: relative; z-index: 2; width: 100%;
}

.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.20);
  color: rgba(255,255,255,0.88);
  font-size: 11.5px; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  padding: 6px 14px; border-radius: 100px;
  margin-bottom: 20px;
  animation: fadeUp 0.5s ease both;
}
.eyebrow-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: var(--t300);
  animation: pulse 2.4s ease infinite;
}
.hero-copy h1 {
  color: var(--w0); margin-bottom: 20px;
  animation: fadeUp 0.55s 0.08s ease both;
  letter-spacing: -2px;
}
.hero-copy h1 em { font-style: italic; color: var(--t300); }
.hero-sub {
  font-size: clamp(15px, 1.6vw, 17px); font-weight: 300;
  color: rgba(255,255,255,0.68); max-width: 480px;
  line-height: 1.72; margin-bottom: 36px;
  animation: fadeUp 0.55s 0.16s ease both;
}
.hero-stats {
  display: flex; gap: 24px; margin-bottom: 36px;
  animation: fadeUp 0.55s 0.24s ease both;
}
.stat-item { text-align: left; }
.stat-num {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px, 2.5vw, 28px);
  color: var(--t300); line-height: 1;
}
.stat-label { font-size: 12px; color: rgba(255,255,255,0.52); font-weight: 500; margin-top: 2px; }
.stat-div   { width: 1px; background: rgba(255,255,255,0.12); align-self: stretch; }

/* Search */
.search-wrap {
  position: relative; max-width: 520px;
  animation: fadeUp 0.55s 0.32s ease both;
}
.search-icon {
  position: absolute; left: 20px; top: 50%;
  transform: translateY(-50%);
  color: var(--t500); pointer-events: none;
  font-size: 16px;
}
.search-input {
  width: 100%;
  padding: 17px 20px 17px 52px;
  border: 2px solid rgba(255,255,255,0.12);
  border-radius: var(--r-xl);
  background: rgba(255,255,255,0.97);
  font-family: inherit; font-size: 15px; color: var(--text);
  box-shadow: 0 10px 40px rgba(0,0,0,0.25);
  outline: none;
  transition: border-color var(--tr), box-shadow var(--tr);
  
}
.search-input::placeholder { color: var(--w400); }
.search-input:focus {
  border-color: var(--t400);
  box-shadow: 0 0 0 4px rgba(21,168,168,0.22), 0 10px 40px rgba(0,0,0,0.25);
}

/* Illustration */
.hero-illustration-col {
  position: relative; display: flex; align-items: center; justify-content: center;
  animation: fadeUp 0.6s 0.3s ease both;
}
.hero-illus-wrap {
  position: relative; width: 100%; max-width: 500px;
  filter: drop-shadow(0 20px 60px rgba(0,0,0,0.35));
}
.city-svg { width: 100%; height: auto; }

.illus-tram { animation: tram-slide 6s linear infinite; }
@keyframes tram-slide {
  0%   { transform: translateX(-40px); opacity: 0; }
  8%   { opacity: 1; }
  88%  { opacity: 1; }
  100% { transform: translateX(40px); opacity: 0; }
}
.illus-person { animation: person-move 4s ease-in-out infinite alternate; }
@keyframes person-move { from { transform: translateX(0); } to { transform: translateX(16px); } }
.illus-pin-pulse  { animation: pin-pulse 2s ease-out infinite; }
.illus-pin-pulse2 { animation: pin-pulse 2s ease-out infinite 0.7s; }
@keyframes pin-pulse { 0% { r: 10; opacity: 0.7; } 100% { r: 30; opacity: 0; } }

.illus-badge {
  position: absolute; top: 15%; right: -10px;
  background: var(--w0); border-radius: var(--r-sm);
  padding: 10px 14px; box-shadow: var(--sh-lg);
  display: flex; align-items: center; gap: 8px;
  animation: badge-float 3s ease-in-out infinite;
  white-space: nowrap;
}
.illus-badge2 {
  position: absolute; bottom: 18%; left: -8px;
  background: var(--t700); border-radius: var(--r-sm);
  padding: 10px 14px; box-shadow: 0 6px 28px rgba(10,92,92,0.35);
  display: flex; align-items: center; gap: 8px;
  animation: badge-float 3s ease-in-out infinite 1.2s;
  white-space: nowrap;
}
.badge-check-icon { color: var(--green); font-size: 16px; }
.badge-map-icon   { color: var(--t300);  font-size: 16px; }
.badge-text  { font-size: 12px; font-weight: 600; color: var(--t700); }
.badge-text2 { font-size: 12px; font-weight: 600; color: rgba(255,255,255,0.90); }
@keyframes badge-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }

/* Wave */
.wave-sep { display: block; width: 100%; overflow: hidden; line-height: 0; background: var(--bg); }
.wave-sep svg { display: block; }

/*  VENUES  */
.venues-section { padding: 0 0 clamp(48px, 6vw, 96px); background: var(--bg); }
.venues-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: clamp(24px, 3vw, 36px) 0 16px;
  flex-wrap: wrap; gap: 12px;
}
.venues-title { font-family: 'DM Serif Display', serif; font-size: clamp(20px, 2.5vw, 26px); color: var(--t700); }
.venues-count-badge {
  font-size: 13px; font-weight: 700; color: var(--t500);
  background: var(--t100); padding: 6px 16px; border-radius: 100px;
  border: 1.5px solid rgba(10,92,92,0.18);
}

/* Filters */
.filters-light {
  display: flex; flex-wrap: wrap; gap: 8px;
  padding-bottom: 24px;
  border-bottom: 1.5px solid var(--border);
  margin-bottom: 28px;
}
.chip-light {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 10px 18px; min-height: var(--touch-min);
  border-radius: 100px;
  font-size: 13.5px; font-weight: 500;
  border: 1.5px solid var(--border);
  background: var(--surface); color: var(--w600);
  transition: all var(--tr); cursor: pointer;
}
.chip-light .pi { font-size: 13px; }
.chip-light:hover { border-color: var(--t500); color: var(--t600); background: var(--t50); }
.chip-light.active {
  background: var(--t800); border-color: var(--t800);
  color: var(--w0); font-weight: 700;
  box-shadow: 0 3px 12px rgba(10,92,92,0.25);
}

/* Grid */
.venue-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 320px), 1fr));
  gap: 18px;
}

/* Cards */
.venue-card {
  background: var(--surface);
  border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg);
  padding: clamp(18px, 3vw, 26px) clamp(18px, 3vw, 28px) clamp(16px, 3vw, 24px);
  cursor: pointer; position: relative; overflow: hidden;
  transition: transform var(--tr), box-shadow var(--tr), border-color var(--tr);
  animation: fadeUp 0.4s ease both;
}
.venue-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(90deg, var(--t400), var(--t600));
  transform: scaleX(0); transform-origin: left; transition: transform var(--tr);
}
.venue-card:hover, .venue-card:focus {
  transform: translateY(-4px); box-shadow: var(--sh-lg);
  border-color: var(--border); outline: none;
}
.venue-card:focus-visible { outline: 3px solid var(--t400); outline-offset: 2px; }
.venue-card:hover::before, .venue-card:focus::before { transform: scaleX(1); }

.card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
.venue-name { font-family: 'DM Serif Display', serif; font-size: clamp(17px, 2vw, 20px); line-height: 1.22; color: var(--t700); }

/* Icon backgrounds */
.venue-icon {
  width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 1.5px solid var(--border-lt); font-size: 18px;
}
.icon-bg-gallery   { background: var(--t50);      color: var(--t600);  }
.icon-bg-museum    { background: #fce8d0;          color: #9a4a0a;      }
.icon-bg-library   { background: var(--green-bg);  color: var(--green); }
.icon-bg-theatre   { background: #f0e8ff;          color: #6b30c4;      }
.icon-bg-community { background: var(--amber-bg);  color: var(--amber); }
.icon-bg-sport     { background: #e8f0fe;          color: #2d5fc4;      }
.icon-bg-landmark  { background: #fce8d0;          color: #7a4000;      }
.icon-bg-default   { background: var(--w100);      color: var(--w600);  }

.venue-address {
  font-size: 13px; color: var(--w600); margin-bottom: 18px;
  display: flex; align-items: center; gap: 6px;
}
.addr-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--t400); flex-shrink: 0; }
.card-foot { display: flex; align-items: center; justify-content: space-between; }

.type-badge {
  display: inline-flex; align-items: center; gap: 5px;
  font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 6px;
  letter-spacing: 0.04em; text-transform: uppercase;
}
.b-gallery   { background: var(--t100);    color: var(--t600);  border: 1px solid rgba(10,92,92,0.18); }
.b-museum    { background: #fce8d0;        color: #9a4a0a; }
.b-library   { background: var(--green-bg);color: var(--green); }
.b-theatre   { background: #f0e8ff;        color: #6b30c4; }
.b-community { background: var(--amber-bg);color: var(--amber); }
.b-sport     { background: #e8f0fe;        color: #2d5fc4; }
.b-landmark  { background: #fce8d0;        color: #7a4000; }
.b-default   { background: var(--w100);    color: var(--w600); }

.card-arr {
  font-size: 14px; color: var(--w200);
  transition: color var(--tr), transform var(--tr);
}
.venue-card:hover .card-arr, .venue-card:focus .card-arr { color: var(--t400); transform: translateX(4px); }

/* Skeletons */
.venue-card-skeleton {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg); padding: 26px 28px 24px;
}
.skel-top { display: flex; justify-content: space-between; gap: 12px; margin-bottom: 14px; }
.skel-title { height: 48px; flex: 1; border-radius: var(--r-xs); }
.skel-icon  { width: 44px; height: 44px; border-radius: 14px; flex-shrink: 0; }
.skel-addr  { height: 16px; width: 60%; margin-bottom: 22px; border-radius: var(--r-xs); }
.skel-foot  { height: 28px; width: 40%; border-radius: 100px; }

/* Error / No results */
.error-state, .no-results {
  grid-column: 1 / -1;
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 48px 24px; text-align: center; color: var(--w600);
}
.retry-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px; min-height: var(--touch-min);
  border-radius: 100px; background: var(--t800); color: var(--w0);
  font-size: 14px; font-weight: 600; transition: background var(--tr);
}
.retry-btn:hover { background: var(--t600); }

/*  RESPONSIVE  */
@media (max-width: 768px) {
  .hero-inner { grid-template-columns: 1fr; }
  .hero-illustration-col { display: none; }
  .hero-stats { gap: 16px; }
  .filters-light { gap: 6px; }
  .chip-light { font-size: 13px; padding: 9px 14px; }
}
@media (max-width: 480px) {
  .venues-header { flex-direction: column; align-items: flex-start; }
  .search-input  { font-size: 16px; }
}

/* PAGINATION */
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: clamp(32px, 4vw, 48px) 0 8px;
  flex-wrap: wrap;
}

.page-btn {
  min-width: var(--touch-min);
  min-height: var(--touch-min);
  padding: 0 14px;
  border-radius: var(--r-xs);
  font-size: 14px;
  font-weight: 600;
  color: var(--w600);
  background: var(--surface);
  border: 1.5px solid var(--border);
  transition: all var(--tr);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.page-btn:hover:not(:disabled):not(.page-ellipsis) {
  border-color: var(--t500);
  color: var(--t600);
  background: var(--t50);
}
.page-btn:disabled { opacity: 0.35; cursor: not-allowed; }
.page-active {
  background: var(--t800);
  border-color: var(--t800);
  color: var(--w0);
  box-shadow: 0 3px 12px rgba(10,92,92,0.25);
}
.page-active:hover { background: var(--t800) !important; color: var(--w0) !important; }
.page-ellipsis { border-color: transparent; background: transparent; cursor: default; }
.page-prev, .page-next { padding: 0; }

@media (max-width: 480px) {
  .page-btn { min-width: 40px; min-height: 40px; font-size: 13px; padding: 0 10px; }
}

/* ABOUT SECTION */
.about-section {
  background: var(--t800);
  padding: clamp(48px, 6vw, 96px) 0;
}
.about-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: clamp(32px, 5vw, 80px);
  align-items: center;
}
.about-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(28px, 3.5vw, 42px);
  color: var(--w0);
  margin-bottom: 20px;
}
.about-desc {
  font-size: clamp(14px, 1.5vw, 16px);
  color: rgba(255,255,255,0.68);
  line-height: 1.75;
  margin-bottom: 16px;
}
.about-cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.about-card {
  background: rgba(255,255,255,0.07);
  border: 1.5px solid rgba(255,255,255,0.12);
  border-radius: var(--r-md);
  padding: 20px 24px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: background var(--tr);
}
.about-card:hover { background: rgba(255,255,255,0.10); }
.about-card-icon {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,0.10);
  color: var(--t300);
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
}
.about-card-title {
  font-family: 'DM Serif Display', serif;
  font-size: 17px; color: var(--w0);
  margin-bottom: 4px;
}
.about-card-text {
  font-size: 13.5px;
  color: rgba(255,255,255,0.55);
  line-height: 1.6;
}
@media (max-width: 768px) {
  .about-grid { grid-template-columns: 1fr; }
}
</style>