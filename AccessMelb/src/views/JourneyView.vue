<template>
  <div class="journey-page">

    <!-- Hero -->
    <div class="journey-hero">
      <div class="journey-hero-inner page-container">
        <RouterLink :to="`/destination/${destId}`" class="back-btn" aria-label="Back to destination">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          Back to destination
        </RouterLink>
        <div class="hero-dest">
          <span class="hero-label">Journey to</span>
          <h1 class="hero-name">{{ destName }}</h1>
        </div>
      </div>
    </div>

    <!-- Wave -->
    <div class="wave-sep" aria-hidden="true">
      <svg viewBox="0 0 1440 52" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="height:40px;width:100%;">
        <path d="M0,0 L1440,0 L1440,14 Q1080,54 720,36 Q360,18 0,46 Z" fill="#054040"/>
      </svg>
    </div>

    <!-- Body -->
    <div class="journey-body">

      <!-- IDLE: location prompt -->
      <div v-if="uiState === 'idle'" class="prompt-outer page-container">
        <div class="prompt-card">
          <div class="prompt-icon-wrap" aria-hidden="true">
            <i class="pi pi-map-marker"></i>
          </div>
          <h2 class="prompt-title">Where are you starting from?</h2>
          <p class="prompt-sub">Share your location or enter an address for a door-to-door accessible journey plan.</p>

          <div v-if="geoError" class="geo-error" role="alert">
            <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
            {{ geoError }}
          </div>

          <!-- Address input -->
          <div class="addr-wrap" role="search">
            <label for="addr-input" class="sr-only">Starting address</label>
            <i class="pi pi-search addr-icon" aria-hidden="true"></i>
            <input
              id="addr-input"
              v-model="addressInput"
              class="addr-input"
              type="text"
              placeholder="Enter your starting address"
              autocomplete="street-address"
              @keydown.enter="geocodeAndPlan"
            />
            <button class="addr-go-btn" @click="geocodeAndPlan" :disabled="!addressInput.trim()" aria-label="Search address">
              Go
            </button>
          </div>

          <div class="divider-row" aria-hidden="true"><span>or</span></div>

          <button class="btn-location" @click="requestLocation">
            <i class="pi pi-crosshairs" aria-hidden="true"></i>
            Use my current location
          </button>

          <button class="btn-ghost" @click="loadFallback">
            Show nearby stops instead
          </button>
        </div>
      </div>

      <!-- LOADING -->
      <div v-else-if="uiState === 'loading'" class="loading-outer page-container" aria-live="polite" aria-busy="true">
        <i class="pi pi-spin pi-spinner loading-spin" aria-hidden="true"></i>
        <p>Planning your accessible journey</p>
      </div>

      <!-- ERROR -->
      <div v-else-if="uiState === 'error'" class="error-outer page-container" role="alert">
        <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
        <p>{{ errorMsg }}</p>
        <button class="btn-location" @click="uiState = 'idle'">Try again</button>
        <button class="btn-ghost" @click="loadFallback">Show nearby stops instead</button>
      </div>

      <!-- PLAN: full journey -->
      <div v-else-if="uiState === 'plan'" class="journey-layout">

        <!-- Left: timeline -->
        <div class="journey-panel">

          <!-- Summary -->
          <div class="journey-summary" role="region" aria-label="Journey summary">
            <div class="sum-stat">
              <i class="pi pi-clock" aria-hidden="true"></i>
              {{ formatDuration(journey.duration_seconds) }}
            </div>
            <div class="sum-div" aria-hidden="true"></div>
            <div class="sum-stat">
              <i class="pi pi-map" aria-hidden="true"></i>
              {{ formatDist(journey.walk_distance_metres) }} walk
            </div>
            <div v-if="journey.transfers > 0" class="sum-div" aria-hidden="true"></div>
            <div v-if="journey.transfers > 0" class="sum-stat">
              <i class="pi pi-arrow-right-arrow-left" aria-hidden="true"></i>
              {{ journey.transfers }} transfer{{ journey.transfers !== 1 ? 's' : '' }}
            </div>
            <div
              class="sum-acc"
              :class="journey.accessibility_summary.fully_accessible ? 'acc-yes' : 'acc-warn'"
            >
              <i
                :class="['pi', journey.accessibility_summary.fully_accessible ? 'pi-check' : 'pi-exclamation-triangle']"
                aria-hidden="true"
              ></i>
              {{ journey.accessibility_summary.fully_accessible ? 'Fully accessible' : 'See notes below' }}
            </div>
          </div>

          <!-- Warnings -->
          <div
            v-if="journey.accessibility_summary.warnings.length"
            class="warnings-panel"
            role="list"
            aria-label="Accessibility warnings"
          >
            <div
              v-for="w in journey.accessibility_summary.warnings"
              :key="w.type"
              class="warning-row"
              role="listitem"
            >
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              {{ w.message }}
            </div>
          </div>

          <!-- Timeline -->
          <div class="timeline" role="list" aria-label="Journey steps">

            <!-- Origin -->
            <div class="tl-item" role="listitem">
              <div class="tl-left" aria-hidden="true">
                <div class="tl-dot tl-dot-origin"></div>
                <div class="tl-conn tl-dashed"></div>
              </div>
              <div class="tl-right">
                <div class="tl-name">{{ originLabel }}</div>
                <div class="tl-sub">Your starting point · {{ formatTime(journey.start_time) }}</div>
              </div>
            </div>

            <template v-for="(leg, i) in journey.legs" :key="i">

              <!-- WALK leg -->
              <div v-if="leg.mode === 'WALK'" class="tl-item" role="listitem">
                <div class="tl-left" aria-hidden="true">
                  <div class="tl-dot tl-dot-walk">
                    <i class="pi pi-user"></i>
                  </div>
                  <div class="tl-conn" :class="isLastLeg(i) ? 'tl-dashed' : 'tl-solid'"></div>
                </div>
                <div class="tl-right">
                  <div class="tl-name">Walk to {{ leg.to_stop?.name }}</div>
                  <div class="tl-sub">{{ formatDist(leg.distance_metres) }} · approx. {{ formatDuration(leg.duration_seconds) }}</div>
                  <div class="tl-tags">
                    <span class="tl-tag tl-tag-green">
                      <i class="pi pi-check" aria-hidden="true"></i>
                      Wheelchair accessible route
                    </span>
                    <span v-if="leg.distance_metres > 500" class="tl-tag tl-tag-amber">Long walk</span>
                  </div>
                </div>
              </div>

              <!-- Transit leg: board stop -->
              <div v-else class="tl-item" role="listitem">
                <div class="tl-left" aria-hidden="true">
                  <div class="tl-dot tl-dot-transit" :style="`background:${getModeColor(leg.mode)}`">
                    <span class="mode-abbr">{{ getModeAbbr(leg.mode) }}</span>
                  </div>
                  <div class="tl-conn tl-solid"></div>
                </div>
                <div class="tl-right">
                  <div class="tl-name">{{ leg.from_stop?.name }}</div>
                  <div class="tl-sub">Board {{ getModeLabel(leg.mode) }}</div>
                  <div class="tl-pill" :style="`background:${getModeColor(leg.mode)}`">
                    <span class="mode-abbr-sm">{{ getModeAbbr(leg.mode) }}</span>
                    {{ leg.route_long_name || leg.route_short_name }} to {{ leg.trip_headsign }}
                  </div>
                  <div class="tl-tags">
                    <span class="tl-tag" :class="getWcClass(leg.trip_wheelchair_accessible)">
                      {{ getWcLabel(leg.trip_wheelchair_accessible) }}
                    </span>
                    <span class="tl-tag tl-tag-neutral">
                      {{ formatDuration(leg.duration_seconds) }} · {{ leg.intermediate_stops?.length ?? 0 }} stops
                    </span>
                    <span v-if="leg.wait_before_seconds > 60" class="tl-tag tl-tag-neutral">
                      Wait {{ formatDuration(leg.wait_before_seconds) }}
                    </span>
                    <span v-if="leg.is_rail_replacement" class="tl-tag tl-tag-amber">
                      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
                      Rail replacement bus
                    </span>
                  </div>
                </div>
              </div>

              <!-- Transit leg: alight stop -->
              <div v-if="leg.mode !== 'WALK'" class="tl-item" role="listitem">
                <div class="tl-left" aria-hidden="true">
                  <div class="tl-dot tl-dot-transit" :style="`background:${getModeColor(leg.mode)}`">
                    <span class="mode-abbr">{{ getModeAbbr(leg.mode) }}</span>
                  </div>
                  <div class="tl-conn tl-dashed"></div>
                </div>
                <div class="tl-right">
                  <div class="tl-name">{{ leg.to_stop?.name }}</div>
                  <div class="tl-sub">Alight here · {{ formatTime(leg.end_time) }}</div>
                </div>
              </div>

            </template>

            <!-- Destination -->
            <div class="tl-item tl-last" role="listitem">
              <div class="tl-left" aria-hidden="true">
                <div class="tl-dot tl-dot-dest">
                  <i class="pi pi-map-marker"></i>
                </div>
              </div>
              <div class="tl-right">
                <div class="tl-name">{{ destName }}</div>
                <div class="tl-sub">Arrive {{ formatTime(journey.end_time) }}</div>
                <div class="tl-tags" v-if="wheelchairEntrance !== null">
                  <span
                    class="tl-tag"
                    :class="wheelchairEntrance === true ? 'tl-tag-green' : wheelchairEntrance === false ? 'tl-tag-red' : 'tl-tag-neutral'"
                  >
                    <i
                      :class="['pi', wheelchairEntrance === true ? 'pi-check' : wheelchairEntrance === false ? 'pi-times' : 'pi-info-circle']"
                      aria-hidden="true"
                    ></i>
                    {{ wheelchairEntrance === true ? 'Wheelchair entrance confirmed' : wheelchairEntrance === false ? 'No wheelchair entrance' : 'Wheelchair entrance unknown' }}
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- Right: map -->
        <div class="journey-map-col">
          <div id="journey-map" class="journey-map" role="application" aria-label="Journey route map"></div>
        </div>

      </div>

      <!-- FALLBACK: nearby stops -->
      <div v-else-if="uiState === 'fallback'" class="journey-layout">

        <div class="journey-panel">
          <div class="fallback-hd">
            <h2>Nearby accessible stops</h2>
            <p>Walk to one of these stops to reach <strong>{{ destName }}</strong></p>
          </div>

          <div
            v-if="fallback.accessibility_summary?.warnings?.length"
            class="warnings-panel"
            role="list"
          >
            <div
              v-for="w in fallback.accessibility_summary.warnings"
              :key="w.type"
              class="warning-row"
              role="listitem"
            >
              <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
              {{ w.message }}
            </div>
          </div>

          <div
            v-if="!fallback.stops?.length"
            class="no-stops"
            role="status"
          >
            <i class="pi pi-search" aria-hidden="true"></i>
            <p>No accessible stops found nearby.</p>
          </div>

          <div v-else class="stops-list" role="list" aria-label="Nearby stops">
            <div
              v-for="(item, i) in fallback.stops"
              :key="i"
              class="stop-card"
              role="listitem"
            >
              <div class="stop-card-top">
                <div class="stop-mode-dot" :style="`background:${getModeColor(item.stop.mode)}`" aria-hidden="true">
                  <span class="mode-abbr">{{ getModeAbbr(item.stop.mode) }}</span>
                </div>
                <div class="stop-card-info">
                  <div class="stop-name">{{ item.stop.name }}</div>
                  <div class="stop-meta">
                    {{ formatDist(item.stop.distance_metres) }} away · {{ formatDuration(item.walking_route.duration_seconds) }} walk
                  </div>
                </div>
              </div>
              <div class="stop-tags">
                <span class="tl-tag" :class="getBoardingClass(item.stop.wheelchair_boarding)">
                  {{ getBoardingLabel(item.stop.wheelchair_boarding) }}
                </span>
              </div>
              <div v-if="item.stop.routes?.length" class="stop-routes">
                <span class="routes-label">Routes:</span>
                {{ item.stop.routes.join(', ') }}
              </div>
            </div>
          </div>

          <button class="btn-ghost" style="margin-top:16px;" @click="uiState = 'idle'">
            <i class="pi pi-arrow-left" aria-hidden="true"></i>
            Try with my location
          </button>
        </div>

        <div class="journey-map-col">
          <div id="journey-map" class="journey-map" role="application" aria-label="Nearby stops map"></div>
        </div>

      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const route  = useRoute()
const destId = route.params.id
const destName = ref(route.query.name || 'Destination')
const destLat  = Number(route.query.lat)  || null
const destLon  = Number(route.query.lon)  || null
const wheelchairEntrance = ref(
  route.query.wheelchair_entrance === 'true'  ? true  :
  route.query.wheelchair_entrance === 'false' ? false : null
)

const uiState      = ref('idle')
const journey      = ref(null)
const fallback     = ref(null)
const errorMsg     = ref('')
const geoError     = ref('')
const addressInput = ref('')
const originLabel  = ref('Your location')
let originCoords   = null
let map            = null


function decodePolyline(encoded) {
  let index = 0, lat = 0, lng = 0
  const coords = []
  while (index < encoded.length) {
    let shift = 0, result = 0, b
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lat += result & 1 ? ~(result >> 1) : result >> 1
    shift = 0; result = 0
    do { b = encoded.charCodeAt(index++) - 63; result |= (b & 0x1f) << shift; shift += 5 } while (b >= 0x20)
    lng += result & 1 ? ~(result >> 1) : result >> 1
    coords.push([lng / 1e5, lat / 1e5])
  }
  return coords
}


function formatDuration(secs) {
  if (!secs) return '0 min'
  if (secs < 60) return '<1 min'
  const h = Math.floor(secs / 3600)
  const m = Math.round((secs % 3600) / 60)
  return h === 0 ? `${m} min` : `${h}h ${m}m`
}

function formatDist(m) {
  if (m == null) return ''
  return m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${Math.round(m)}m`
}

function formatTime(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit', hour12: true })
}


function getModeColor(mode) {
  return { RAIL: '#1e3a5f', BUS: '#6d28d9', TRAM: '#b45309', WALK: '#0d8a4a' }[mode] || '#4b5563'
}

function getModeLabel(mode) {
  return { RAIL: 'Train', BUS: 'Bus', TRAM: 'Tram', WALK: 'Walk' }[mode] || mode
}

function getModeAbbr(mode) {
  return { RAIL: 'T', BUS: 'B', TRAM: 'Tr', WALK: 'W' }[mode] || '?'
}

function isLastLeg(i) {
  return i === journey.value.legs.length - 1
}


function getWcClass(val) {
  if (val === 'POSSIBLE')     return 'tl-tag-green'
  if (val === 'NOT_POSSIBLE') return 'tl-tag-red'
  return 'tl-tag-neutral'
}

function getWcLabel(val) {
  if (val === 'POSSIBLE')     return 'Wheelchair accessible'
  if (val === 'NOT_POSSIBLE') return 'Not wheelchair accessible'
  return 'Accessibility unconfirmed'
}

function getBoardingClass(val) {
  if (val === 'POSSIBLE')     return 'tl-tag-green'
  if (val === 'NOT_POSSIBLE') return 'tl-tag-red'
  return 'tl-tag-neutral'
}

function getBoardingLabel(val) {
  if (val === 'POSSIBLE')     return 'Wheelchair boarding available'
  if (val === 'NOT_POSSIBLE') return 'Not wheelchair accessible'
  return 'Accessibility unconfirmed'
}


function requestLocation() {
  geoError.value = ''
  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser.'
    return
  }
  uiState.value = 'loading'
  navigator.geolocation.getCurrentPosition(
    pos => {
      originCoords    = { lat: pos.coords.latitude, lon: pos.coords.longitude }
      originLabel.value = 'Your current location'
      fetchPlan(originCoords.lat, originCoords.lon)
    },
    () => {
      uiState.value  = 'idle'
      geoError.value = 'Location access denied. Enter your address or view nearby stops.'
    },
    { timeout: 10000 }
  )
}

async function geocodeAndPlan() {
  if (!addressInput.value.trim()) return
  geoError.value = ''
  uiState.value  = 'loading'
  try {
    const q      = encodeURIComponent(`${addressInput.value}, Victoria, Australia`)
    const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
    const res    = await fetch(
      `https://api.geoapify.com/v1/geocode/search?text=${q}&apiKey=${apiKey}&limit=1` +
      `&filter=rect:144.5,-38.5,145.6,-37.4&bias=proximity:144.9631,-37.8136`
    )
    const data   = await res.json()
    const feat   = data.features?.[0]
    if (!feat) throw new Error('not found')
    const [lon, lat] = feat.geometry.coordinates
    originLabel.value = addressInput.value
    originCoords = { lat, lon }
    await fetchPlan(lat, lon)
  } catch {
    if (uiState.value === 'loading') {
      uiState.value  = 'idle'
      geoError.value = 'Could not find that address. Try a different search or use your location.'
    }
  }
}


async function fetchPlan(lat, lon) {
  uiState.value = 'loading'
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/journeys/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: { lat, lon }, destination_id: Number(destId), departure_time: new Date().toISOString() })
    })
    if (!res.ok) throw new Error(res.status)
    journey.value = await res.json()
    uiState.value = 'plan'
    await nextTick()
    initJourneyMap()
  } catch {
    errorMsg.value = 'Journey planning is currently unavailable. Try viewing nearby stops instead.'
    uiState.value  = 'error'
  }
}

async function loadFallback() {
  uiState.value = 'loading'
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/journeys/fallback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ destination_id: Number(destId) })
    })
    if (!res.ok) throw new Error(res.status)
    fallback.value = await res.json()
    uiState.value  = 'fallback'
    await nextTick()
    initFallbackMap()
  } catch {
    errorMsg.value = 'Unable to load nearby stops. Please try again.'
    uiState.value  = 'error'
  }
}


function makeMap(center) {
  destroyMap()
  const apiKey = import.meta.env.VITE_GEOAPIFY_API_KEY
  map = new maplibregl.Map({
    container: 'journey-map',
    style: `https://maps.geoapify.com/v1/styles/osm-bright/style.json?apiKey=${apiKey}`,
    center,
    zoom: 13,
    attributionControl: true
  })
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')
  map.scrollZoom.disable()
  return map
}

function addPolylineLayer(sourceId, coords, color, dashed = false) {
  map.addSource(sourceId, {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
  })
  if (!dashed) {
    map.addLayer({ id: `${sourceId}-bg`, type: 'line', source: sourceId,
      paint: { 'line-color': '#fff', 'line-width': 8, 'line-opacity': 0.5 } })
  }
  map.addLayer({
    id: `${sourceId}-line`, type: 'line', source: sourceId,
    paint: {
      'line-color': color, 'line-width': dashed ? 3.5 : 5, 'line-opacity': 0.95,
      ...(dashed ? { 'line-dasharray': [2, 1.5] } : {})
    }
  })
}

function addMarker(el, lngLat, anchor = 'center') {
  return new maplibregl.Marker({ element: el, anchor }).setLngLat(lngLat).addTo(map)
}

function makeStopEl(color) {
  const el = document.createElement('div')
  el.className = 'j-stop-marker'
  el.style.background = color
  return el
}


function initJourneyMap() {
  if (!journey.value) return
  const bounds = new maplibregl.LngLatBounds()

  const firstCoords = journey.value.legs.find(l => l.polyline)
  const center = firstCoords ? decodePolyline(firstCoords.polyline)[0] : [144.96, -37.81]
  makeMap(center)

  map.on('load', () => {
    journey.value.legs.forEach((leg, i) => {
      if (!leg.polyline) return
      const coords = decodePolyline(leg.polyline)
      coords.forEach(c => bounds.extend(c))
      const isWalk = leg.mode === 'WALK'
      addPolylineLayer(`leg-${i}`, coords, isWalk ? '#15a8a8' : getModeColor(leg.mode), isWalk)
    })

    // Origin marker
    if (originCoords) {
      const el = document.createElement('div')
      el.className = 'j-origin-marker'
      addMarker(el, [originCoords.lon, originCoords.lat])
      bounds.extend([originCoords.lon, originCoords.lat])
    }

    // Transit stop markers
    journey.value.legs.forEach(leg => {
      if (leg.mode === 'WALK') return
      const color = getModeColor(leg.mode)
      ;[leg.from_stop, leg.to_stop].forEach(stop => {
        if (!stop?.lat || !stop?.lon || (stop.lat === 0 && stop.lon === 0)) return
        const el = makeStopEl(color)
        const popup = new maplibregl.Popup({ offset: 12, closeButton: false, closeOnClick: false })
          .setHTML(`<div class="j-popup-inner"><strong>${stop.name}</strong></div>`)
        const marker = addMarker(el, [stop.lon, stop.lat])
        el.addEventListener('mouseenter', () => popup.setLngLat([stop.lon, stop.lat]).addTo(map))
        el.addEventListener('mouseleave', () => popup.remove())
        bounds.extend([stop.lon, stop.lat])
      })
    })

    // Destination marker
    if (destLat && destLon) {
      const el = document.createElement('div')
      el.className = 'j-dest-marker'
      const popup = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false })
        .setHTML(`<div class="j-popup-inner"><strong>${destName.value}</strong></div>`)
      addMarker(el, [destLon, destLat], 'bottom')
      el.addEventListener('mouseenter', () => popup.setLngLat([destLon, destLat]).addTo(map))
      el.addEventListener('mouseleave', () => popup.remove())
      bounds.extend([destLon, destLat])
    }

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 64, maxZoom: 15 })
    map.resize()
  })
}


function initFallbackMap() {
  if (!fallback.value) return
  const dest   = fallback.value.destination
  const bounds = new maplibregl.LngLatBounds()
  bounds.extend([dest.lon, dest.lat])
  makeMap([dest.lon, dest.lat])

  map.on('load', () => {
    fallback.value.stops.forEach((item, i) => {
      if (!item.walking_route?.polyline) return
      const coords = decodePolyline(item.walking_route.polyline)
      coords.forEach(c => bounds.extend(c))
      addPolylineLayer(`walk-${i}`, coords, '#15a8a8', true)

      // Stop marker
      const el = makeStopEl(getModeColor(item.stop.mode))
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false, closeOnClick: false })
        .setHTML(`<div class="j-popup-inner"><strong>${item.stop.name}</strong><br/><small>${item.stop.routes?.join(', ')}</small></div>`)
      addMarker(el, [item.stop.lon, item.stop.lat])
      el.addEventListener('mouseenter', () => popup.setLngLat([item.stop.lon, item.stop.lat]).addTo(map))
      el.addEventListener('mouseleave', () => popup.remove())
      bounds.extend([item.stop.lon, item.stop.lat])
    })

    // Destination marker
    const destEl = document.createElement('div')
    destEl.className = 'j-dest-marker'
    addMarker(destEl, [dest.lon, dest.lat], 'bottom')

    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 64, maxZoom: 16 })
    map.resize()
  })
}

function destroyMap() {
  if (map) { map.remove(); map = null }
}

onUnmounted(destroyMap)
</script>

<style scoped>
/* PAGE */
.journey-page { min-height: 100vh; background: var(--bg); }

/* HERO */
.journey-hero {
  background: var(--t800); position: relative; overflow: hidden;
  padding-bottom: 0;
}
.journey-hero::before {
  content: ''; position: absolute; inset: 0;
  background: radial-gradient(ellipse 60% 80% at 90% 20%, rgba(21,168,168,0.18) 0%, transparent 55%);
}
.journey-hero-inner { position: relative; z-index: 2; padding-top: 20px; padding-bottom: 28px; }
.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.68);
  padding: 8px 0 20px; min-height: var(--touch-min);
  transition: color var(--tr), gap var(--tr);
}
.back-btn:hover { color: var(--w0); gap: 12px; }
.back-btn .pi { transition: transform var(--tr); }
.back-btn:hover .pi { transform: translateX(-3px); }
.hero-label { display: block; font-size: 12px; font-weight: 600; color: var(--t300); text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 4px; }
.hero-name { font-family: 'DM Serif Display', serif; font-size: clamp(22px,3vw,36px); color: var(--w0); line-height: 1.15; }

/* WAVE */
.wave-sep { display: block; width: 100%; overflow: hidden; line-height: 0; background: var(--bg); }

/* BODY */
.journey-body { background: var(--bg); }

/* IDLE PROMPT */
.prompt-outer { display: flex; justify-content: center; padding: 48px 0; }
.prompt-card {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-xl); padding: clamp(28px,4vw,48px);
  max-width: 520px; width: 100%;
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  box-shadow: var(--sh-lg);
}
.prompt-icon-wrap {
  width: 56px; height: 56px; border-radius: 18px;
  background: var(--t100); color: var(--t600);
  display: flex; align-items: center; justify-content: center;
  font-size: 24px;
}
.prompt-title { font-family: 'DM Serif Display', serif; font-size: clamp(20px,2.5vw,26px); color: var(--t700); text-align: center; margin: 0; }
.prompt-sub { font-size: 14px; color: var(--w600); text-align: center; line-height: 1.6; margin: 0; }
.geo-error {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--red); background: var(--red-bg);
  border-radius: var(--r-xs); padding: 10px 14px; width: 100%;
}

/* Address input */
.addr-wrap {
  position: relative; width: 100%;
  display: flex; align-items: center;
}
.addr-icon {
  position: absolute; left: 16px; color: var(--t500); pointer-events: none;
}
.addr-input {
  flex: 1; padding: 14px 56px 14px 44px;
  border: 1.5px solid var(--border); border-radius: var(--r-xl);
  font-family: inherit; font-size: 14px; color: var(--text);
  background: var(--bg); outline: none;
  transition: border-color var(--tr);
}
.addr-input:focus { border-color: var(--t400); }
.addr-go-btn {
  position: absolute; right: 8px;
  padding: 7px 16px; border-radius: 100px;
  background: var(--t700); color: var(--w0);
  font-size: 13px; font-weight: 700; cursor: pointer;
  transition: background var(--tr);
}
.addr-go-btn:hover:not(:disabled) { background: var(--t600); }
.addr-go-btn:disabled { opacity: 0.4; cursor: not-allowed; }

.divider-row {
  display: flex; align-items: center; width: 100%; gap: 12px;
  color: var(--w400); font-size: 12px; font-weight: 500;
}
.divider-row::before, .divider-row::after {
  content: ''; flex: 1; height: 1px; background: var(--border);
}

.btn-location {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 13px 28px; min-height: var(--touch-min);
  border-radius: 100px; background: var(--t800); color: var(--w0);
  font-size: 14px; font-weight: 600; cursor: pointer; width: 100%; justify-content: center;
  transition: background var(--tr);
}
.btn-location:hover { background: var(--t600); }
.btn-ghost {
  background: none; border: none; color: var(--t500);
  font-size: 13.5px; font-weight: 500; cursor: pointer;
  padding: 6px; text-decoration: underline;
  transition: color var(--tr);
}
.btn-ghost:hover { color: var(--t700); }

/* LOADING / ERROR */
.loading-outer, .error-outer {
  display: flex; flex-direction: column; align-items: center;
  gap: 16px; padding: 80px 24px; text-align: center; color: var(--w600);
}
.loading-spin { font-size: 2.5rem; color: var(--t500); }
.error-outer .pi { font-size: 2.5rem; color: var(--red); }

/* JOURNEY LAYOUT */
.journey-layout {
  display: grid;
  grid-template-columns: 420px 1fr;
  min-height: calc(100vh - 160px);
}

/* LEFT PANEL */
.journey-panel {
  overflow-y: auto;
  padding: 24px 24px 48px;
  border-right: 1.5px solid var(--border-lt);
  background: var(--surface);
}

/* SUMMARY */
.journey-summary {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  padding: 14px 18px; border-radius: var(--r-md);
  background: var(--t800); margin-bottom: 16px;
}
.sum-stat {
  display: flex; align-items: center; gap: 6px;
  font-size: 13.5px; font-weight: 600; color: var(--w0);
}
.sum-stat .pi { color: var(--t300); font-size: 13px; }
.sum-div { width: 1px; height: 16px; background: rgba(255,255,255,0.18); }
.sum-acc {
  margin-left: auto; display: flex; align-items: center; gap: 6px;
  font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 100px;
}
.acc-yes { background: rgba(13,138,74,0.25); color: #7fedaf; }
.acc-warn { background: rgba(196,125,10,0.25); color: #fbbf24; }

/* WARNINGS */
.warnings-panel {
  display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px;
}
.warning-row {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12.5px; color: #92400e;
  background: #fef3c7; border: 1px solid #fde68a;
  border-radius: var(--r-xs); padding: 10px 12px; line-height: 1.4;
}
.warning-row .pi { color: #d97706; margin-top: 1px; flex-shrink: 0; }

/* TIMELINE */
.timeline { display: flex; flex-direction: column; }
.tl-item { display: flex; gap: 0; min-height: 56px; }
.tl-last { min-height: 0; }

.tl-left {
  display: flex; flex-direction: column; align-items: center;
  width: 40px; flex-shrink: 0;
}
.tl-right {
  flex: 1; padding: 0 0 24px 14px;
}
.tl-last .tl-right { padding-bottom: 0; }

/* Dots */
.tl-dot {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; border: 2.5px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  z-index: 1;
}
.tl-dot-origin { background: #15a8a8; }
.tl-dot-walk   { background: #0d8a4a; color: white; font-size: 14px; }
.tl-dot-transit { color: white; font-size: 13px; }
.tl-dot-dest   { background: var(--t800); color: var(--t300); font-size: 15px; }
.mode-abbr { font-size: 11px; font-weight: 800; color: white; letter-spacing: 0; }

/* Connectors */
.tl-conn { flex: 1; width: 2px; margin: 2px 0; }
.tl-solid  { background: var(--border); }
.tl-dashed {
  background: repeating-linear-gradient(
    to bottom, var(--border) 0px, var(--border) 6px,
    transparent 6px, transparent 10px
  );
}

/* Timeline content */
.tl-name { font-size: 15px; font-weight: 700; color: var(--t700); line-height: 1.25; margin-bottom: 3px; margin-top: 6px; }
.tl-sub  { font-size: 12.5px; color: var(--w600); margin-bottom: 8px; }

/* Route pill */
.tl-pill {
  display: inline-flex; align-items: center; gap: 6px;
  color: white; font-size: 12.5px; font-weight: 700;
  padding: 6px 14px; border-radius: 100px; margin-bottom: 8px;
}
.mode-abbr-sm { font-size: 10px; font-weight: 800; }

/* Tags */
.tl-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tl-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
}
.tl-tag-green   { background: var(--green-bg); color: var(--green); }
.tl-tag-amber   { background: var(--amber-bg); color: var(--amber); }
.tl-tag-red     { background: var(--red-bg);   color: var(--red);   }
.tl-tag-neutral { background: var(--w100);     color: var(--w600); border: 1px solid var(--w200); }

/* FALLBACK */
.fallback-hd { margin-bottom: 20px; }
.fallback-hd h2 { font-family: 'DM Serif Display', serif; font-size: 20px; color: var(--t700); margin-bottom: 6px; }
.fallback-hd p  { font-size: 14px; color: var(--w600); }

.stops-list { display: flex; flex-direction: column; gap: 12px; }
.stop-card {
  background: var(--bg); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-md); padding: 16px;
}
.stop-card-top { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
.stop-mode-dot {
  width: 38px; height: 38px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.15);
}
.stop-name { font-size: 14px; font-weight: 700; color: var(--t700); margin-bottom: 3px; }
.stop-meta { font-size: 12.5px; color: var(--w600); }
.stop-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.stop-routes { font-size: 12px; color: var(--w600); }
.routes-label { font-weight: 600; color: var(--t600); margin-right: 4px; }

.no-stops {
  display: flex; flex-direction: column; align-items: center;
  gap: 12px; padding: 32px; text-align: center; color: var(--w600);
}
.no-stops .pi { font-size: 2rem; color: var(--w400); }

/* MAP */
.journey-map-col { position: sticky; top: 0; height: calc(100vh - 160px); }
.journey-map { width: 100%; height: 100%; }

@media (max-width: 900px) {
  .journey-layout { grid-template-columns: 1fr; }
  .journey-map-col { position: relative; height: 380px; }
  .journey-panel { border-right: none; border-bottom: 1.5px solid var(--border-lt); }
}
@media (max-width: 480px) {
  .prompt-card { border-radius: var(--r-lg); padding: 24px 20px; }
}
</style>

<style>

.j-origin-marker {
  width: 18px; height: 18px; border-radius: 50%;
  background: #15a8a8; border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.30);
}
.j-stop-marker {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2.5px solid white;
  box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  cursor: pointer;
  transition: transform 0.15s;
}
.j-stop-marker:hover { transform: scale(1.3); }
.j-dest-marker {
  width: 32px; height: 32px; border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  background: var(--t800, #054040);
  border: 2.5px solid white;
  box-shadow: 0 3px 10px rgba(0,0,0,0.30);
  display: flex; align-items: center; justify-content: center;
}
.j-popup-inner {
  font-family: 'DM Sans', sans-serif;
  font-size: 13px; color: #1a2e2e; line-height: 1.4;
  min-width: 140px;
}
.j-popup-inner small { color: #6b8c8c; }
</style>
