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
            <div class="vh-badge vh-badge-go">
              <i class="pi pi-check" aria-hidden="true"></i>
              Wheelchair entrance
            </div>
            <div class="vh-badge vh-badge-go">
              <i class="pi pi-check" aria-hidden="true"></i>
              Accessible parking
            </div>
            <div class="vh-badge vh-badge-none">
              <i class="pi pi-info-circle" aria-hidden="true"></i>
              Seating - no data
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
                Stops near {{ destination.feature_name }}
              </h2>
            </div>
            <a
              class="map-open-btn"
              :href="`https://www.google.com/maps/search/?api=1&query=${destination.latitude},${destination.longitude}`"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i class="pi pi-external-link" aria-hidden="true"></i>
              Open full map
              <span class="sr-only">(opens in new tab)</span>
            </a>
          </div>
          <div id="detail-map" class="map-container" role="application" aria-label="Map showing destination location"></div>
        </div>

      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const route = useRoute()

const destination = ref(null)
const loading     = ref(true)
const error       = ref(false)
let   map         = null

async function fetchDetail() {
  loading.value = true
  error.value   = false
  try {
    const id  = route.params.id
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/destinations/${id}?radius=500`
    )
    if (!res.ok) throw new Error('API error')
    const data      = await res.json()
    destination.value = data.destination
    await nextTick()
    initMap()
  } catch (e) {
    error.value = true
  } finally {
    loading.value = false
  }
}

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
      new maplibregl.Marker({ element: destEl, anchor: 'bottom' })
        .setLngLat([longitude, latitude])
        .setPopup(
          new maplibregl.Popup({ offset: 25 })
            .setHTML(`<strong>${destination.value.feature_name}</strong><br>${destination.value.sub_theme}`)
        )
        .addTo(map)

      map.resize()
    })
  }, 200)
}

function destroyMap() {
  if (map) { map.remove(); map = null }
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
  font-family: 'DM Serif Display', serif;
  font-size: clamp(14px,1.5vw,17px); color: var(--w0);
}
.map-open-btn {
  display: inline-flex; align-items: center; gap: 6px;
  font-size: 12.5px; font-weight: 600; color: var(--t300);
  padding: 8px 14px; border-radius: 8px; min-height: var(--touch-min);
  background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15);
  transition: background var(--tr), color var(--tr);
}
.map-open-btn:hover { background: rgba(255,255,255,0.16); color: var(--w0); }

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
.maplibregl-popup-content {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 13px !important;
  border-radius: 10px !important;
  padding: 12px 14px !important;
  box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
}
</style>