<template>
  <div class="detail">

    <!-- DETAIL HERO -->
    <div class="detail-hero">
      <div class="detail-hero-inner page-container">

        <RouterLink to="/" class="back-btn" aria-label="Back to all destinations">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          Back to all destinations
        </RouterLink>

        <!-- Loading -->
        <div v-if="loading" class="venue-header">
          <div class="skeleton" style="width:280px;height:40px;border-radius:8px;margin-bottom:12px;"></div>
          <div class="skeleton" style="width:180px;height:20px;border-radius:6px;"></div>
        </div>

        <!-- Error -->
        <div v-else-if="error" class="venue-header" role="alert">
          <p style="color:rgba(255,255,255,0.7);">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            Unable to load destination details.
          </p>
        </div>

        <!-- Venue header -->
        <div v-else class="venue-header">
          <div class="vh-left">
            <div class="vh-icon-row">
              <div class="vh-icon" :class="getCategoryStyle(destination.category).iconBg" aria-hidden="true">
                <i :class="['pi', getCategoryStyle(destination.category).icon]"></i>
              </div>
              <div>
                <h1 class="vh-title">{{ destination.feature_name }}</h1>
                <div class="vh-meta">
                  <span class="type-badge">
                    {{ formatCategory(destination.category) }}
                  </span>
                  <span class="vh-meta-item">
                    <i class="pi pi-map-marker" aria-hidden="true"></i>
                    {{ destination.sub_theme }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div class="vh-badges">
            <template v-if="accessibilityBadges.length">
              <div
                v-for="badge in accessibilityBadges"
                :key="badge.label"
                class="vh-badge"
                :class="badge.value === true ? 'vh-badge-go' : badge.value === false ? 'vh-badge-no' : 'vh-badge-none'"
              >
                <i
                  :class="['pi', badge.value === true ? 'pi-check' : badge.value === false ? 'pi-times' : 'pi-info-circle']"
                  aria-hidden="true"
                ></i>
                {{ badge.label }}
              </div>
            </template>
            <div v-else class="vh-badge vh-badge-none">
              <i class="pi pi-info-circle" aria-hidden="true"></i>
              Accessibility data unavailable
            </div>
          </div>
        </div>

        <div style="height:28px;"></div>
      </div>
    </div>

    <!-- Wave -->
    <div class="wave-sep" aria-hidden="true">
      <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="height:40px;width:100%;">
        <path d="M0,0 L1440,0 L1440,14 Q1080,54 720,36 Q360,18 0,46 Z" fill="#054040"/>
      </svg>
    </div>

    <!-- DETAIL BODY -->
    <div class="detail-body">
      <div class="detail-wrap page-container">

        <!-- MAP -->
        <div v-if="!loading && !error" class="map-wrap">
          <div class="map-header">
            <div class="map-header-left">
              <div class="map-header-icon" aria-hidden="true">
                <i class="pi pi-map"></i>
              </div>
              <h2 class="map-header-title">
                Accessible toilets near {{ destination.feature_name }}
              </h2>
            </div>
          </div>
          <div id="detail-map" class="map-container" role="application" aria-label="Map showing destination location"></div>
        </div>

        <!-- TWO COLUMN LAYOUT -->
        <div class="detail-layout" style="margin-top:28px;">

          <!-- LEFT: Toilets -->
          <div class="detail-main">

            <div v-if="loading" class="section-label">
              <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
              Loading nearby toilets...
            </div>

            <div v-else-if="nearbyToilets.length > 0" class="toilets-section">
              <div class="section-header">
                <div class="section-label">
                  <i class="pi pi-map-marker" aria-hidden="true"></i>
                  Nearby accessible toilets
                </div>
                <span class="section-badge">
                  {{ nearbyToilets.length }} found within {{ radiusM }}m
                </span>
              </div>

              <div class="toilets-list" role="list" aria-label="Nearby accessible toilets">
                <div
                  v-for="toilet in nearbyToilets"
                  :key="toilet.toilet_id"
                  class="toilet-card"
                  role="listitem"
                >
                  <div
                    class="toilet-status-icon"
                    :class="getToiletStatusClass(toilet.wheelchair_accessible)"
                    aria-hidden="true"
                  >
                    <i :class="['pi', getToiletStatusIcon(toilet.wheelchair_accessible)]"></i>
                  </div>

                  <div class="toilet-info">
                    <p class="toilet-name">{{ toilet.name }}</p>
                    <div class="toilet-tags">
                      <span class="toilet-badge" :class="getToiletStatusClass(toilet.wheelchair_accessible)">
                        <i :class="['pi', getToiletStatusIcon(toilet.wheelchair_accessible)]" aria-hidden="true"></i>
                        {{ getToiletStatusLabel(toilet.wheelchair_accessible) }}
                      </span>
                    </div>
                  </div>

                  <div
                    class="toilet-distance"
                    :aria-label="`${Math.round(toilet.distance_m)} metres away`"
                  >
                    <i class="pi pi-map-marker" aria-hidden="true"></i>
                    {{ Math.round(toilet.distance_m) }}m
                  </div>
                </div>
              </div>

              <div class="data-attribution" role="note">
                <i class="pi pi-info-circle" aria-hidden="true"></i>
                Toilet data sourced from the
                <a href="https://data.melbourne.vic.gov.au" target="_blank" rel="noopener noreferrer">
                  City of Melbourne Open Data Portal
                  <span class="sr-only">(opens in new tab)</span>
                </a>
              </div>
            </div>

            <div v-else class="no-toilets" role="status">
              <i class="pi pi-search" aria-hidden="true"></i>
              <p>No accessible toilets found within {{ radiusM }}m of this destination.</p>
              <button class="retry-btn" @click="increaseRadius">
                <i class="pi pi-plus-circle" aria-hidden="true"></i>
                Search wider ({{ radiusM + 500 }}m)
              </button>
            </div>

          </div>

          <!-- RIGHT: Sidebar -->
          <div class="detail-side">

            <!-- Opening hours panel -->
            <div class="hours-panel">
              <div class="hours-panel-hd">
                <div class="hours-hd-icon" aria-hidden="true">
                  <i class="pi pi-clock"></i>
                </div>
                <div>
                  <div class="hours-hd-title">Opening hours</div>
                  <div v-if="todayHoursSubtitle" class="hours-hd-sub">{{ todayHoursSubtitle }}</div>
                </div>
              </div>

              <template v-if="loading">
                <div class="hours-panel-body">
                  <div class="skeleton" style="height:36px;border-radius:0;margin-bottom:1px;" v-for="n in 7" :key="n"></div>
                </div>
              </template>

              <template v-else-if="parsedWeekdayText.length">
                <div class="hours-panel-body" role="list" aria-label="Weekly opening hours">
                  <div
                    v-for="(entry, idx) in parsedWeekdayText"
                    :key="idx"
                    class="hours-row"
                    :class="{ 'hours-row-today': idx === todayIndex }"
                    role="listitem"
                  >
                    <div class="hours-row-day">
                      <span v-if="idx === todayIndex">Today ({{ entry.day }})</span>
                      <span v-else>{{ entry.day }}</span>
                      <span
                        v-if="idx === todayIndex && venueDetails.opening_hours.open_now"
                        class="hours-open-chip"
                      >OPEN</span>
                    </div>
                    <div class="hours-row-time">{{ entry.hours }}</div>
                  </div>
                </div>
                <div class="hours-panel-foot">
                  <i class="pi pi-clock" aria-hidden="true"></i>
                  Source: Google Places API
                </div>
              </template>

              <div v-else class="hours-panel-body">
                <p class="no-hours">Hours not available</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const route = useRoute()

const destination   = ref(null)
const venueDetails  = ref(null)
const loading       = ref(true)
const error         = ref(false)
const nearbyToilets = ref([])

// Google Places weekday_text starts Monday=0, Sunday=6; JS getDay() Sunday=0
const todayIndex = computed(() => (new Date().getDay() + 6) % 7)

const parsedWeekdayText = computed(() =>
  (venueDetails.value?.opening_hours?.weekday_text || []).map(entry => {
    const colon = entry.indexOf(':')
    return { day: entry.slice(0, colon), hours: entry.slice(colon + 2) }
  })
)

const todayHoursSubtitle = computed(() => {
  if (!venueDetails.value?.opening_hours) return null
  const entry = parsedWeekdayText.value[todayIndex.value]
  if (!entry) return null
  if (entry.hours === 'Closed') return 'Closed today'
  const isOpen = venueDetails.value.opening_hours.open_now
  const match = entry.hours.match(/^(.+?)\s*[\u2013\-]\s*(.+)$/)
  if (!match) return null
  if (isOpen) return `Closes at ${match[2].trim()} today`
  return `Opens at ${match[1].trim()} today`
})

const accessibilityBadges = computed(() => {
  const a = venueDetails.value?.accessibility
  if (!a) return []
  return [
    { label: 'Wheelchair entrance', value: a.wheelchair_entrance },
    { label: 'Accessible parking',  value: a.wheelchair_parking  },
    { label: 'Accessible restroom', value: a.wheelchair_restroom },
    { label: 'Accessible seating',  value: a.wheelchair_seating  },
  ]
})
const radiusM = ref(500)
let   map         = null

// Fetch destination details and nearby toilets using destination ID from route params
async function fetchDetail() {
  loading.value = true
  error.value   = false
  try {
    const id  = route.params.id
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/destinations/${id}?radius=${radiusM.value}`
    )
    if (!res.ok) throw new Error('API error')
    const data      = await res.json()
    destination.value  = data.destination
    venueDetails.value = data.venue_details ?? null
    // Filter out inaccessible toilets and only show accessible or unknown to avoid discouraging users
    nearbyToilets.value = (data.nearby_toilets?.toilets || []).filter(t => t.wheelchair_accessible !== 'no')
    await nextTick()
    initMap()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

// Expand search radius by 500m if no toilets found within current radius
async function increaseRadius(){
  radiusM.value += 500
  destroyMap()
  await fetchDetail()
}

// Initialise MapLibre map with Geoapify tiles and place destination and toilet markers
function initMap() {
  if (map) destroyMap()
  setTimeout(() => {
    const el = document.getElementById('detail-map')
    if (!el || !destination.value) return

    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
    const { latitude, longitude } = destination.value

    map = new maplibregl.Map({
      container: 'detail-map',
      style:     `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
      center:    [longitude, latitude],
      zoom:      15,
      attributionControl: true
    })

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
    map.scrollZoom.disable()

    map.on('load', () => {
      const destEl = document.createElement('div')
      destEl.className = 'marker-destination'
      destEl.innerHTML = `
        <div class="marker-pin marker-pin-teal">
          <i class="pi pi-map-marker"></i>
        </div>
        <div class="marker-label">${destination.value.feature_name.split(' ').slice(0, 2).join(' ')}</div>
      `
      const destPopup = new maplibregl.Popup({
      offset: 25,
      closeButton: false,
      closeOnClick: false
    }).setHTML(`<strong>${destination.value.feature_name}</strong><br>${destination.value.sub_theme}`)

    new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
      .setLngLat([longitude, latitude])
      .addTo(map)

    destEl.addEventListener('mouseenter', () => destPopup.setLngLat([longitude, latitude]).addTo(map))
    destEl.addEventListener('mouseleave', () => destPopup.remove())

        // Toilet markers
      nearbyToilets.value.forEach(toilet => {
        const color    = getMarkerColor(toilet.wheelchair_accessible)
        const toiletEl = document.createElement('div')
        toiletEl.className = 'marker-toilet'
        toiletEl.innerHTML = `
          <div class="marker-wc-pill" style="background:${color}">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="17" height="17" aria-hidden="true">
              <rect x="8" y="2" width="8" height="4" rx="1.5"/>
              <path d="M5 8h14v2a7 7 0 0 1-14 0V8z"/>
              <rect x="9" y="17" width="6" height="2" rx="1"/>
              <rect x="7" y="19" width="10" height="2" rx="1"/>
            </svg>
          </div>`
        const popup = new maplibregl.Popup({
          offset: 18,
          closeButton: false,
          closeOnClick: false
        }).setHTML(`
          <div style="font-family:'DM Sans',sans-serif;min-width:180px;">
            <div style="font-size:13px;font-weight:700;color:#1a2e2e;margin-bottom:6px;line-height:1.35;">${toilet.name}</div>
            <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;"></span>
              <span style="font-size:12px;font-weight:600;color:${color};">${getToiletStatusLabel(toilet.wheelchair_accessible)}</span>
            </div>
            <div style="font-size:12px;color:#6b8c8c;display:flex;align-items:center;gap:4px;">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#6b8c8c" width="12" height="12"><path d="M12 2a7 7 0 0 0-7 7c0 4.9 7 13 7 13s7-8.1 7-13a7 7 0 0 0-7-7zm0 9.5a2.5 2.5 0 1 1 0-5 2.5 2.5 0 0 1 0 5z"/></svg>
              ${Math.round(toilet.distance_m)}m away
            </div>
          </div>
        `)

        new maplibregl.Marker({ element: toiletEl, anchor: 'center' })
          .setLngLat([toilet.longitude, toilet.latitude])
          .addTo(map)
        // Show popup on hover for faster information access
        toiletEl.addEventListener('mouseenter', () => popup.setLngLat([toilet.longitude, toilet.latitude]).addTo(map))
        toiletEl.addEventListener('mouseleave', () => popup.remove())
      })

      // Fit bounds to include all toilet markers
      if (nearbyToilets.value.length > 0) {
        const bounds = new maplibregl.LngLatBounds()
        bounds.extend([longitude, latitude])
        nearbyToilets.value.forEach(t => bounds.extend([t.longitude, t.latitude]))
        map.fitBounds(bounds, { padding: 60, maxZoom: 16 })
      }

      map.resize()
    })
  }, 200)
}

// Clean up MapLibre instance when component is unmounted to prevent memory leaks
function destroyMap() {
  if (map) { map.remove(); map = null }
}

function getMarkerColor(accessible) {
  if (accessible === 'yes') return '#0d8a4a'
  if (accessible === 'no')  return '#b92c2c'
  return '#c47d0a'
}

function getToiletStatusClass(accessible) {
  if (accessible === 'yes') return 'status-accessible'
  if (accessible === 'no')  return 'status-inaccessible'
  return 'status-unknown'
}

function getToiletStatusIcon(accessible) {
  if (accessible === 'yes') return 'pi-check-circle'
  if (accessible === 'no')  return 'pi-times-circle'
  return 'pi-question-circle'
}

function getToiletStatusLabel(accessible) {
  if (accessible === 'yes') return 'Wheelchair accessible'
  if (accessible === 'no')  return 'Not accessible'
  return 'Accessibility unknown'
}

function getCategoryStyle(category) {
  const styles = {
    gallery:   { icon: 'pi-palette',         iconBg: 'icon-bg-gallery'   },
    museum:    { icon: 'pi-building-columns', iconBg: 'icon-bg-museum'    },
    library:   { icon: 'pi-book',            iconBg: 'icon-bg-library'   },
    theatre:   { icon: 'pi-star',            iconBg: 'icon-bg-theatre'   },
    community: { icon: 'pi-users',           iconBg: 'icon-bg-community' },
    sport:     { icon: 'pi-heart',           iconBg: 'icon-bg-sport'     },
    landmark:  { icon: 'pi-map-marker',      iconBg: 'icon-bg-landmark'  },
  }
  return styles[category?.toLowerCase()] || { icon: 'pi-map-marker', iconBg: 'icon-bg-default' }
}

function formatCategory(cat) {
  if (!cat) return 'Venue'
  return cat.charAt(0).toUpperCase() + cat.slice(1)
}

onMounted(fetchDetail)
onUnmounted(destroyMap)
</script>

<style scoped>
.detail-hero {
  background: var(--t800);
  position: relative; overflow: hidden;
}
.detail-hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 90% 15%, rgba(21,168,168,0.20) 0%, transparent 55%),
    radial-gradient(ellipse 40% 55% at 5% 90%,  rgba(3,46,46,0.60)    0%, transparent 50%);
}
.detail-hero-inner { position: relative; z-index: 2; }

.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500;
  color: rgba(255,255,255,0.68);
  padding: 20px 0 24px;
  min-height: var(--touch-min);
  transition: color var(--tr), gap var(--tr);
}
.back-btn:hover { color: var(--w0); gap: 12px; }
.back-btn .pi { transition: transform var(--tr); }
.back-btn:hover .pi { transform: translateX(-3px); }

.venue-header {
  background: rgba(255,255,255,0.08);
  border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: var(--r-xl);
  padding: clamp(20px,3vw,32px) clamp(20px,3vw,36px);
  display: flex; align-items: flex-start;
  justify-content: space-between;
  gap: 24px; flex-wrap: wrap;
}
.vh-icon-row { display: flex; align-items: flex-start; gap: 16px; }
.vh-icon {
  width: 52px; height: 52px; border-radius: 16px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 22px; border: 1.5px solid rgba(255,255,255,0.15);
}
.vh-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(22px,3.5vw,38px);
  color: var(--w0); line-height: 1.12; margin-bottom: 10px;
}
.vh-meta {
  display: flex; align-items: center; gap: 12px;
  flex-wrap: wrap; font-size: 14px; color: rgba(255,255,255,0.60);
}
.vh-meta-item { display: flex; align-items: center; gap: 5px; }

.vh-badges { display: flex; gap: 8px; flex-wrap: wrap; align-self: flex-end; }
.vh-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 11px;
  font-size: 13px; font-weight: 500;
  min-height: var(--touch-min);
}
.vh-badge-go   { background: rgba(13,138,74,0.28); color: #7fedaf; border: 1.5px solid rgba(13,138,74,0.35); }
.vh-badge-none { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); border: 1.5px solid rgba(255,255,255,0.12); }

.type-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 6px;
  letter-spacing: 0.04em; text-transform: uppercase;
  background: rgba(255,255,255,0.14); color: rgba(255,255,255,0.88);
  border: 1px solid rgba(255,255,255,0.2);
}

.icon-bg-gallery   { background: var(--t50);      color: var(--t600);  }
.icon-bg-museum    { background: #fce8d0;          color: #9a4a0a;      }
.icon-bg-library   { background: var(--green-bg);  color: var(--green); }
.icon-bg-theatre   { background: #f0e8ff;          color: #6b30c4;      }
.icon-bg-community { background: var(--amber-bg);  color: var(--amber); }
.icon-bg-sport     { background: #e8f0fe;          color: #2d5fc4;      }
.icon-bg-landmark  { background: #fce8d0;          color: #7a4000;      }
.icon-bg-default   { background: var(--w100);      color: var(--w600);  }

.wave-sep { display: block; width: 100%; overflow: hidden; line-height: 0; background: var(--bg); }
.wave-sep svg { display: block; }

.detail-body { background: var(--bg); padding: 0 0 clamp(48px,6vw,96px); }
.detail-wrap { padding-top: 32px; }

.map-wrap {
  background: var(--surface);
  border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--sh-sm);
}
.map-header {
  padding: 14px 20px; background: var(--t800);
  display: flex; align-items: center; justify-content: space-between;
  gap: 12px; flex-wrap: wrap;
}
.map-header-left { display: flex; align-items: center; gap: 10px; }
.map-header-icon {
  width: 30px; height: 30px; border-radius: 9px;
  background: rgba(255,255,255,0.12); color: var(--t300);
  display: flex; align-items: center; justify-content: center; font-size: 14px;
}
.map-header-title {
  font-family: 'DM Sans', sans-serif;
  font-size: clamp(14px,1.5vw,16px); 
  font-weight:600;
  color: var(--w0);
}

.map-container {
  height: 480px;
  width: 100%;
  display: block;
}

@media (max-width: 640px) {
  .venue-header { flex-direction: column; }
  .vh-badges { align-self: flex-start; }
  .map-header { flex-direction: column; align-items: flex-start; }
  .map-container { height: 300px; }
}
/* LAYOUT */
.detail-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px; align-items: start;
}
@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
}

/* SIDEBAR */
.detail-side { display: flex; flex-direction: column; gap: 16px; }
.detail-panel {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg); padding: 20px 22px; box-shadow: var(--sh-sm);
}
.panel-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--t500); margin-bottom: 16px;
}
/* HOURS PANEL */
.hours-panel {
  background: var(--surface);
  border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg);
  overflow: hidden;
  box-shadow: var(--sh-sm);
}
.hours-panel-hd {
  background: var(--t800);
  padding: 16px 20px;
  display: flex; align-items: flex-start; gap: 12px;
}
.hours-hd-icon {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.12); color: var(--t300);
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.hours-hd-title {
  font-family: 'DM Serif Display', serif;
  font-size: 16px; font-weight: 700; color: var(--w0); line-height: 1.2;
}
.hours-hd-sub {
  font-size: 12.5px; color: rgba(255,255,255,0.55); margin-top: 3px;
}
.hours-panel-body { padding: 6px 0; }
.hours-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 20px; gap: 12px;
  border-bottom: 1px solid var(--border-lt);
}
.hours-row:last-child { border-bottom: none; }
.hours-row-today { background: var(--t50); }
.hours-row-day {
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px; color: var(--t700); font-weight: 400;
}
.hours-row-today .hours-row-day { font-weight: 700; }
.hours-row-time {
  font-size: 13px; color: var(--w600); white-space: nowrap;
}
.hours-row-today .hours-row-time { font-weight: 600; color: var(--t600); }
.hours-open-chip {
  font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 100px;
  background: rgba(13,138,74,0.15); color: var(--green);
  border: 1px solid rgba(13,138,74,0.28);
}
.hours-panel-foot {
  padding: 10px 20px;
  background: var(--t50);
  border-top: 1px solid var(--border-lt);
  font-size: 12px; color: var(--t500);
  display: flex; align-items: center; gap: 6px;
}
.no-hours { font-size: 13px; color: var(--w400); margin: 0; padding: 12px 20px; }
.vh-badge-no { background: rgba(185,44,44,0.22); color: #ff9090; border: 1.5px solid rgba(185,44,44,0.30); }

/* TOILETS */
.section-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px; flex-wrap: wrap; gap: 8px;
}
.section-label {
  display: flex; align-items: center; gap: 8px;
  font-size: 11px; font-weight: 800; letter-spacing: 0.09em;
  text-transform: uppercase; color: var(--t500);
}
.section-badge {
  font-size: 12px; font-weight: 600; color: var(--w400);
  background: var(--w100); padding: 4px 12px; border-radius: 100px;
  border: 1px solid var(--w200);
}
.toilets-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.toilet-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-md); padding: 14px 16px;
  transition: border-color var(--tr), box-shadow var(--tr);
}
.toilet-card:hover { border-color: var(--border); box-shadow: var(--sh-sm); }
.toilet-status-icon {
  width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.status-accessible   { background: var(--green-bg); color: var(--green); }
.status-inaccessible { background: var(--red-bg);   color: var(--red);   }
.status-unknown      { background: var(--amber-bg); color: var(--amber); }
.toilet-info { flex: 1; min-width: 0; }
.toilet-name { font-size: 14px; font-weight: 600; color: var(--t700); line-height: 1.3; margin-bottom: 6px; }
.toilet-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.toilet-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px;
}
.toilet-badge.status-accessible   { background: var(--green-bg); color: var(--green); }
.toilet-badge.status-inaccessible { background: var(--red-bg);   color: var(--red);   }
.toilet-badge.status-unknown      { background: var(--w100); color: var(--w400); border: 1px solid var(--w200); }
.toilet-distance {
  display: flex; align-items: center; gap: 4px;
  flex-shrink: 0; font-size: 12px; font-weight: 700; color: var(--t500);
  background: var(--t100); padding: 6px 12px; border-radius: 100px;
  border: 1px solid rgba(10,92,92,0.12); white-space: nowrap;
}
.data-attribution {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--w400);
  background: var(--t50); border: 1px solid var(--border-lt);
  border-radius: var(--r-xs); padding: 10px 14px; margin-top: 4px;
}
.data-attribution a { color: var(--t500); text-decoration: underline; }
.data-attribution a:hover { color: var(--t700); }
.no-toilets {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 48px 24px; text-align: center; color: var(--w600);
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg);
}
.no-toilets .pi { font-size: 2rem; color: var(--w400); }
.retry-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px; min-height: var(--touch-min);
  border-radius: 100px; background: var(--t800); color: var(--w0);
  font-size: 14px; font-weight: 600; transition: background var(--tr);
}
.retry-btn:hover { background: var(--t600); }

/* SIDEBAR */
.detail-sidebar { display: flex; flex-direction: column; gap: 18px; }
.sidebar-panel {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--sh-sm);
}
.panel-header {
  padding: 14px 20px; background: var(--t800);
  display: flex; align-items: center; gap: 10px;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}
.panel-header-icon {
  width: 28px; height: 28px; border-radius: 8px;
  background: rgba(255,255,255,0.12); color: var(--t300);
  display: flex; align-items: center; justify-content: center; font-size: 13px;
}
.panel-header-title { font-family: 'DM Serif Display', serif; font-size: 15px; color: var(--w0); }
.panel-body { padding: 16px 20px; }
.panel-text { font-size: 13.5px; color: var(--w600); line-height: 1.72; }
.panel-text strong { color: var(--t700); font-weight: 700; }
.panel-footer {
  padding: 10px 20px; background: var(--t50);
  font-size: 11.5px; color: var(--t500);
  border-top: 1px solid var(--border-lt);
  display: flex; align-items: center; gap: 5px;
}
.legend-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 13.5px; color: var(--w600); padding: 6px 0;
}
.legend-dot {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.legend-dot-teal  { background: var(--t500); }
.legend-dot-green { background: var(--green); }
.legend-dot-amber { background: var(--amber); }
.legend-dot-red   { background: var(--red);   }


</style>

<style>
.marker-destination { cursor: pointer; }
.marker-pin {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 3px 10px rgba(0,0,0,0.30);
  border: 2.5px solid white;
}
.marker-pin .pi { transform: rotate(45deg); font-size: 16px; color: white; }
.marker-pin-teal { background: var(--t600); }
.marker-label {
  background: var(--t800); color: white;
  font-size: 11px; font-weight: 700;
  padding: 3px 8px; border-radius: 6px;
  margin-top: 4px; white-space: nowrap;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  font-family: 'DM Sans', sans-serif;
  text-align: center;
}
.marker-toilet { cursor: pointer; }
.marker-wc-pill {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2.5px solid white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.marker-wc-pill:hover {
  transform: scale(1.15);
  box-shadow: 0 4px 14px rgba(0,0,0,0.40);
}
.maplibregl-popup-content {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  padding: 12px 14px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
}

</style>