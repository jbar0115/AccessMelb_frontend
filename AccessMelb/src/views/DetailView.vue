<template>
  <div class="detail">

    <!-- DETAIL HERO -->
    <div class="detail-hero">
      <div class="detail-hero-inner page-container">

        <RouterLink to="/" class="back-btn" aria-label="Back to all destinations">
          <i class="pi pi-arrow-left" aria-hidden="true"></i>
          Back to all destinations
        </RouterLink>

        <!-- Loading skeleton -->
        <div v-if="loading" class="venue-header">
          <div class="skeleton" style="width:280px;height:40px;border-radius:8px;margin-bottom:12px;"></div>
          <div class="skeleton" style="width:180px;height:20px;border-radius:6px;"></div>
        </div>

        <!-- 404 Not Found -->
        <div v-else-if="notFound" class="venue-header" role="alert">
          <div>
            <p style="color:rgba(255,255,255,0.7);margin-bottom:10px;">
              <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
              Destination not found.
            </p>
            <RouterLink to="/" style="color:rgba(255,255,255,0.7);font-size:14px;text-decoration:underline;">
              Back to all destinations
            </RouterLink>
          </div>
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
                  <span class="type-badge">{{ formatCategory(destination.category) }}</span>
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
                <span v-if="badge.value === null">{{ badge.label }}: unknown</span>
                <span v-else>{{ badge.label }}</span>
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

        <!-- MAP SECTION -->
        <div v-if="!loading && !error && !notFound" class="map-wrap">

          <!-- Journey planner header + form (always visible) -->
          <div class="jp-form-section" aria-labelledby="jp-heading">
            <div class="jp-top-bar">
              <div class="jp-top-bar-left">
                <div class="jp-top-icon" aria-hidden="true">
                  <i class="pi pi-map"></i>
                </div>
                <div>
                  <h2
                    id="jp-heading"
                    ref="journeyHeadingRef"
                    class="jp-title"
                    tabindex="-1"
                  >Plan your journey</h2>
                  <p class="jp-subtitle">Wheelchair accessible route to {{ destination.feature_name }}</p>
                </div>
              </div>
            </div>

            <div class="jp-form-body">
              <!-- Geo error -->
              <div v-if="geoError" class="geo-error" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                {{ geoError }}
              </div>

              <!-- FROM / TO / button row -->
              <div class="jp-inputs-row">
                <div class="jp-field">
                  <label for="jp-from-input" class="jp-field-label">FROM</label>
                  <div class="jp-input-wrap">
                    <i class="pi pi-search jp-input-icon" aria-hidden="true"></i>
                    <input
                      id="jp-from-input"
                      v-model="addressInput"
                      class="jp-input"
                      type="text"
                      placeholder="Enter your starting address..."
                      autocomplete="street-address"
                      :disabled="uiState === 'loading'"
                      @keydown.enter="geocodeAndPlan"
                    />
                  </div>
                </div>

                <div class="jp-field">
                  <span class="jp-field-label" id="jp-to-label">TO</span>
                  <div class="jp-input-wrap jp-input-wrap--locked" aria-labelledby="jp-to-label">
                    <i class="pi pi-map-marker jp-input-icon" aria-hidden="true"></i>
                    <span class="jp-input-locked">{{ destination.feature_name }}</span>
                    <i class="pi pi-lock jp-lock-icon" aria-hidden="true" title="Destination is fixed"></i>
                  </div>
                </div>

                <button
                  class="jp-plan-btn"
                  @click="geocodeAndPlan"
                  :disabled="!addressInput.trim() || uiState === 'loading'"
                  aria-label="Plan accessible journey from entered address"
                >
                  <i class="pi pi-send" aria-hidden="true"></i>
                  Plan journey
                </button>
              </div>

              <!-- Or / use location -->
              <div class="jp-or-section">
                <div class="jp-divider" aria-hidden="true"><span>or</span></div>
                <button
                  class="jp-location-btn"
                  @click="requestLocation"
                  :disabled="uiState === 'loading'"
                  aria-label="Use my current GPS location as starting point"
                >
                  <span class="jp-location-pulse" aria-hidden="true"></span>
                  <i class="pi pi-crosshairs" aria-hidden="true"></i>
                  Use my current location instead
                </button>
              </div>

              <!-- Loading indicator (inline, map stays visible) -->
              <div v-if="uiState === 'loading'" class="jp-inline-loading" aria-live="polite" aria-busy="true">
                <i class="pi pi-spin pi-spinner" aria-hidden="true"></i>
                Planning your accessible journey...
              </div>

              <!-- Error message -->
              <div v-if="uiState === 'error'" class="jp-error-msg" role="alert">
                <i class="pi pi-exclamation-circle" aria-hidden="true"></i>
                <span>{{ errorMsg }}</span>
                <button class="btn-link" @click="loadFallback">Show nearby stops instead</button>
              </div>

              <!-- Journey summary bar -->
              <div v-if="uiState === 'plan'" class="jp-summary-bar" role="region" aria-label="Journey summary">
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
                  {{ journey.accessibility_summary.fully_accessible ? 'Fully accessible' : 'Check warnings' }}
                </div>
              </div>

              <!-- Fallback summary bar -->
              <div v-if="uiState === 'fallback'" class="jp-summary-bar jp-summary-bar--fallback" role="region" aria-label="Nearby stops summary">
                <div class="sum-stat">
                  <i class="pi pi-map-marker" aria-hidden="true"></i>
                  {{ fallback.stops?.length || 0 }} accessible stops nearby
                </div>
                <button class="btn-link" @click="resetJourneyToIdle">
                  <i class="pi pi-arrow-left" aria-hidden="true"></i>
                  Try with my address
                </button>
              </div>
            </div>
          </div>

          <!-- THE MAP (single element, always the same) -->
          <div
            id="detail-map"
            class="map-container map-container--journey"
            role="application"
            aria-label="Map showing accessible journey route and nearby toilets"
          ></div>

          <!-- Map legend (always visible) -->
          <div class="jp-legend" role="note" aria-label="Map legend">
            <div class="jp-legend-title">MAP LEGEND</div>
            <div v-if="originCoords" class="jp-legend-item">
              <span class="jp-legend-origin" aria-hidden="true"></span>
              Your start location
            </div>
            <div v-if="uiState === 'plan' || uiState === 'fallback'" class="jp-legend-item">
              <span class="jp-legend-walk" aria-hidden="true"></span>
              Walking route (wheelchair)
            </div>
            <div v-if="uiState === 'plan' && hasTransitLeg" class="jp-legend-item">
              <span class="jp-legend-transit" aria-hidden="true"></span>
              Transit route
            </div>
            <div class="jp-legend-item">
              <span class="jp-legend-dest" aria-hidden="true"></span>
              Destination
            </div>
            <div v-if="nearbyToilets.length" class="jp-legend-item">
              <span class="jp-legend-wc" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="white" width="13" height="13">
                  <rect x="8" y="2" width="8" height="4" rx="1.5"/>
                  <path d="M5 8h14v2a7 7 0 0 1-14 0V8z"/>
                  <rect x="9" y="17" width="6" height="2" rx="1"/>
                  <rect x="7" y="19" width="10" height="2" rx="1"/>
                </svg>
              </span>
              Accessible toilet
            </div>
          </div>

        </div>

        <!-- TWO COLUMN LAYOUT (journey timeline + hours) -->
        <div class="detail-layout" style="margin-top:28px;">

          <!-- LEFT: Journey timeline / fallback stops -->
          <div class="detail-main">

            <!-- Idle / loading / error placeholder -->
            <div v-if="uiState === 'idle' || uiState === 'loading' || uiState === 'error'" class="tl-idle-placeholder">
              <i class="pi pi-compass" aria-hidden="true"></i>
              <p>Enter your starting address or share your location above to see step-by-step accessible directions here.</p>
            </div>

            <!-- Accessibility warnings -->
            <div
              v-if="uiState === 'plan' && journey.accessibility_summary.warnings.length"
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

            <!-- Walk-only journey: no accessible transit found -->
            <div
              v-if="uiState === 'plan' && isWalkOnlyJourney"
              class="warnings-panel"
              style="margin-bottom:16px;"
            >
              <div class="warning-row" role="note">
                <i class="pi pi-info-circle" style="color:#0e7490;" aria-hidden="true"></i>
                No accessible transit route found - this is a walking-only route.
                <button class="btn-link" @click="loadFallback">View nearby accessible stops instead</button>
              </div>
            </div>

            <!-- Plan timeline -->
            <div v-if="uiState === 'plan'" class="timeline" role="list" aria-label="Step-by-step journey">

              <div class="tl-item" role="listitem">
                <div class="tl-left" aria-hidden="true">
                  <div class="tl-dot tl-dot-origin"></div>
                  <div class="tl-conn tl-dashed"></div>
                </div>
                <div class="tl-right">
                  <div class="tl-name">{{ originLabel }}</div>
                  <div class="tl-sub">Your starting point &middot; {{ formatTime(journey.start_time) }}</div>
                </div>
              </div>

              <template v-for="(leg, i) in journey.legs" :key="i">

                <div v-if="leg.mode === 'WALK'" class="tl-item" role="listitem">
                  <div class="tl-left" aria-hidden="true">
                    <div class="tl-dot tl-dot-walk"><i class="pi pi-user"></i></div>
                    <div class="tl-conn" :class="isLastLeg(i) ? 'tl-dashed' : 'tl-solid'"></div>
                  </div>
                  <div class="tl-right">
                    <div class="tl-name">Walk to {{ leg.to_stop?.name }}</div>
                    <div class="tl-sub">{{ formatDist(leg.distance_metres) }} &middot; approx. {{ formatDuration(leg.duration_seconds) }}</div>
                    <div class="tl-tags">
                      <span class="tl-tag tl-tag-green">
                        <i class="pi pi-check" aria-hidden="true"></i>
                        Wheelchair accessible route
                      </span>
                      <span v-if="leg.distance_metres > 500" class="tl-tag tl-tag-amber">Long walk</span>
                    </div>
                  </div>
                </div>

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
                        {{ formatDuration(leg.duration_seconds) }} &middot; {{ leg.intermediate_stops?.length ?? 0 }} stops
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

                <div v-if="leg.mode !== 'WALK'" class="tl-item" role="listitem">
                  <div class="tl-left" aria-hidden="true">
                    <div class="tl-dot tl-dot-transit" :style="`background:${getModeColor(leg.mode)}`">
                      <span class="mode-abbr">{{ getModeAbbr(leg.mode) }}</span>
                    </div>
                    <div class="tl-conn tl-dashed"></div>
                  </div>
                  <div class="tl-right">
                    <div class="tl-name">{{ leg.to_stop?.name }}</div>
                    <div class="tl-sub">Alight here &middot; {{ formatTime(leg.end_time) }}</div>
                  </div>
                </div>

              </template>

              <div class="tl-item tl-last" role="listitem">
                <div class="tl-left" aria-hidden="true">
                  <div class="tl-dot tl-dot-dest"><i class="pi pi-map-marker"></i></div>
                </div>
                <div class="tl-right">
                  <div class="tl-name">{{ destination?.feature_name }}</div>
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

            <!-- Fallback stops list -->
            <div v-if="uiState === 'fallback'">
              <div class="fallback-hd">
                <h2>Nearby accessible stops</h2>
                <p>Walk to one of these stops to reach <strong>{{ destination?.feature_name }}</strong></p>
              </div>

              <!-- Global fallback warnings (e.g. INSUFFICIENT_STOPS) -->
              <div
                v-if="fallback.accessibility_summary?.warnings?.filter(w => w.stop_index === undefined).length"
                class="warnings-panel"
                role="list"
                aria-label="Accessibility warnings"
                style="margin-bottom:16px;"
              >
                <div
                  v-for="w in fallback.accessibility_summary.warnings.filter(w => w.stop_index === undefined)"
                  :key="w.type"
                  class="warning-row"
                  role="listitem"
                >
                  <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
                  {{ w.message }}
                </div>
              </div>

              <!-- Zero stops empty state -->
              <div v-if="fallback.stops.length === 0" class="tl-idle-placeholder">
                <i class="pi pi-map-marker" aria-hidden="true"></i>
                <p>No accessible transport stops found near this destination.</p>
              </div>

              <div v-else class="stops-list" role="list" aria-label="Nearby accessible stops">
                <div v-for="(item, i) in fallback.stops" :key="i" class="stop-card" role="listitem">
                  <div class="stop-card-top">
                    <div class="stop-mode-dot" :style="`background:${getModeColor(item.stop.mode)}`" aria-hidden="true">
                      <span class="mode-abbr">{{ getModeAbbr(item.stop.mode) }}</span>
                    </div>
                    <div class="stop-card-info">
                      <div class="stop-name">{{ item.stop.name }}</div>
                      <div class="stop-meta">
                        {{ formatDist(item.stop.distance_metres) }} away &middot; {{ formatDuration(item.walking_route.duration_seconds) }} walk
                      </div>
                    </div>
                  </div>
                  <div class="stop-tags">
                    <span class="tl-tag" :class="getBoardingClass(item.stop.wheelchair_boarding)">
                      {{ getBoardingLabel(item.stop.wheelchair_boarding) }}
                    </span>
                  </div>
                  <div v-if="item.stop.routes?.length" class="stop-routes">
                    <span class="routes-label">{{ getModeLabel(item.stop.mode) }} routes:</span>
                    {{ item.stop.routes.join(', ') }}
                  </div>
                  <!-- Per-stop warnings (UNKNOWN_STOP_ACCESSIBILITY, LONG_WALK) -->
                  <div v-if="getStopWarnings(i).length" style="margin-top:8px;">
                    <div
                      v-for="w in getStopWarnings(i)"
                      :key="w.type"
                      class="warning-row"
                    >
                      <i class="pi pi-exclamation-triangle" aria-hidden="true"></i>
                      {{ trimWarningMessage(w.message) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <!-- RIGHT: Opening hours -->
          <div class="detail-side">
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
                        v-if="idx === todayIndex && venueDetails?.opening_hours?.open_now"
                        class="hours-open-chip"
                      >OPEN</span>
                      <span
                        v-else-if="idx === todayIndex && venueDetails?.opening_hours?.open_now === false"
                        class="hours-closed-chip"
                      >CLOSED</span>
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

        <!-- TOILETS (full width, below) -->
        <div style="margin-top:24px;">
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
              <span class="section-badge">{{ nearbyToilets.length }} found within {{ radiusM }}m</span>
            </div>

            <div class="toilets-list" role="list" aria-label="Nearby accessible toilets">
              <div
                v-for="toilet in nearbyToilets"
                :key="toilet.toilet_id"
                class="toilet-card"
                role="listitem"
              >
                <div class="toilet-status-icon" :class="getToiletStatusClass(toilet.wheelchair_accessible)" aria-hidden="true">
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
                <div class="toilet-distance" :aria-label="`${Math.round(toilet.distance_m)} metres away`">
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

// -- Detail state --
const destination   = ref(null)
const venueDetails  = ref(null)
const loading       = ref(true)
const error         = ref(false)
const notFound      = ref(false)
const nearbyToilets = ref([])
const radiusM       = ref(500)
let   map           = null

// -- Journey state --
const uiState         = ref('idle')  // idle | loading | plan | fallback | error
const journey         = ref(null)
const fallback        = ref(null)
const errorMsg        = ref('')
const geoError        = ref('')
const addressInput    = ref('')
const originLabel     = ref('Your location')
let   originCoords    = null
let   routeSourceIds  = []
let   routeMarkers    = []

// -- Detail computed --

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
    { label: 'Wheelchair parking',  value: a.wheelchair_parking  },
    { label: 'Wheelchair restroom', value: a.wheelchair_restroom },
    { label: 'Wheelchair seating',  value: a.wheelchair_seating  },
  ]
})

const wheelchairEntrance = computed(() =>
  venueDetails.value?.accessibility?.wheelchair_entrance ?? null
)

const hasTransitLeg = computed(() =>
  journey.value?.legs?.some(l => l.mode !== 'WALK') ?? false
)

const isWalkOnlyJourney = computed(() =>
  journey.value?.legs?.every(l => l.mode === 'WALK') ?? false
)

// -- Detail API --

async function fetchDetail() {
  loading.value  = true
  error.value    = false
  notFound.value = false
  try {
    const id  = route.params.id
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/v1/destinations/${id}?radius=${radiusM.value}`
    )
    if (res.status === 404) {
      notFound.value = true
      error.value    = true
      return
    }
    if (!res.ok) throw new Error('API error')
    const data      = await res.json()
    destination.value  = data.destination
    venueDetails.value = data.venue_details ?? null
    // Exclude confirmed-inaccessible toilets to avoid discouraging users
    nearbyToilets.value = (data.nearby_toilets?.toilets || []).filter(t => t.wheelchair_accessible !== 'no')
    await nextTick()
    initMap()
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
}

async function increaseRadius() {
  radiusM.value += 500
  destroyMap()
  await fetchDetail()
}

// -- Detail map (single map for the whole page) --

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
      placeToiletAndDestMarkers()
      fitMapToData()
    })
  }, 200)
}

function placeToiletAndDestMarkers() {
  if (!map || !destination.value) return
  const { latitude, longitude } = destination.value

  // Destination marker
  const destEl = document.createElement('div')
  destEl.className = 'marker-destination'
  destEl.innerHTML = `
    <div class="marker-pin marker-pin-teal">
      <i class="pi pi-map-marker"></i>
    </div>
    <div class="marker-label">${destination.value.feature_name.split(' ').slice(0, 2).join(' ')}</div>
  `
  const destPopup = new maplibregl.Popup({ offset: 25, closeButton: false, closeOnClick: false })
    .setHTML(`<strong>${destination.value.feature_name}</strong><br>${destination.value.sub_theme}`)
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
    const popup = new maplibregl.Popup({ offset: 18, closeButton: false, closeOnClick: false })
      .setHTML(`
        <div style="font-family:'DM Sans',sans-serif;min-width:180px;">
          <div style="font-size:13px;font-weight:700;color:#1a2e2e;margin-bottom:6px;">${toilet.name}</div>
          <div style="font-size:12px;font-weight:600;color:${color};margin-bottom:4px;">${getToiletStatusLabel(toilet.wheelchair_accessible)}</div>
          <div style="font-size:12px;color:#6b8c8c;">${Math.round(toilet.distance_m)}m away</div>
        </div>
      `)
    new maplibregl.Marker({ element: toiletEl, anchor: 'center' })
      .setLngLat([toilet.longitude, toilet.latitude])
      .addTo(map)
    toiletEl.addEventListener('mouseenter', () => popup.setLngLat([toilet.longitude, toilet.latitude]).addTo(map))
    toiletEl.addEventListener('mouseleave', () => popup.remove())
  })
}

function fitMapToData() {
  if (!map || !destination.value) return
  const { latitude, longitude } = destination.value
  if (nearbyToilets.value.length > 0) {
    const bounds = new maplibregl.LngLatBounds()
    bounds.extend([longitude, latitude])
    nearbyToilets.value.forEach(t => bounds.extend([t.longitude, t.latitude]))
    map.fitBounds(bounds, { padding: 60, maxZoom: 16 })
  }
  map.resize()
}

function destroyMap() {
  clearRouteFromMap()
  if (map) { map.remove(); map = null }
}

// -- Route layer management on the single map --

function clearRouteFromMap() {
  if (!map) return
  routeSourceIds.forEach(sid => {
    if (map.getLayer(`${sid}-bg`))   map.removeLayer(`${sid}-bg`)
    if (map.getLayer(`${sid}-line`)) map.removeLayer(`${sid}-line`)
    if (map.getSource(sid))          map.removeSource(sid)
  })
  routeSourceIds = []
  routeMarkers.forEach(m => m.remove())
  routeMarkers = []
}

function addPolyline(sourceId, coords, color, dashed = false) {
  map.addSource(sourceId, {
    type: 'geojson',
    data: { type: 'Feature', geometry: { type: 'LineString', coordinates: coords } }
  })
  if (!dashed) {
    map.addLayer({
      id: `${sourceId}-bg`, type: 'line', source: sourceId,
      paint: { 'line-color': '#fff', 'line-width': 8, 'line-opacity': 0.45 }
    })
  }
  map.addLayer({
    id: `${sourceId}-line`, type: 'line', source: sourceId,
    paint: {
      'line-color': color, 'line-width': dashed ? 4 : 5.5, 'line-opacity': 0.95,
      ...(dashed ? { 'line-dasharray': [2, 1.5] } : {})
    }
  })
  routeSourceIds.push(sourceId)
}

function addJourneyMarker(el, lngLat, anchor = 'center') {
  const m = new maplibregl.Marker({ element: el, anchor }).setLngLat(lngLat).addTo(map)
  routeMarkers.push(m)
  return m
}

function safeAddRoute(fn) {
  if (!map) return
  if (map.loaded()) fn()
  else map.once('load', fn)
}

function addRouteToMap() {
  clearRouteFromMap()
  safeAddRoute(() => {
    const bounds = new maplibregl.LngLatBounds()

    journey.value.legs.forEach((leg, i) => {
      if (!leg.polyline) return
      const coords = decodePolyline(leg.polyline)
      coords.forEach(c => bounds.extend(c))
      const isWalk = leg.mode === 'WALK'
      addPolyline(`route-leg-${i}`, coords, isWalk ? '#15a8a8' : getModeColor(leg.mode), isWalk)
    })

    if (originCoords) {
      const el = document.createElement('div')
      el.className = 'j-origin-marker'
      addJourneyMarker(el, [originCoords.lon, originCoords.lat])
      bounds.extend([originCoords.lon, originCoords.lat])
    }

    journey.value.legs.forEach(leg => {
      if (leg.mode === 'WALK') return
      const color = getModeColor(leg.mode)
      ;[leg.from_stop, leg.to_stop].forEach(stop => {
        if (!stop?.lat || !stop?.lon || (stop.lat === 0 && stop.lon === 0)) return
        const el = document.createElement('div')
        el.className = 'j-stop-marker'
        el.style.background = color
        const popup = new maplibregl.Popup({ offset: 12, closeButton: false, closeOnClick: false })
          .setHTML(`<div class="j-popup-inner"><strong>${stop.name}</strong></div>`)
        addJourneyMarker(el, [stop.lon, stop.lat])
        el.addEventListener('mouseenter', () => popup.setLngLat([stop.lon, stop.lat]).addTo(map))
        el.addEventListener('mouseleave', () => popup.remove())
        bounds.extend([stop.lon, stop.lat])
      })
    })

    const destLat = destination.value?.latitude
    const destLon = destination.value?.longitude
    if (destLat && destLon) {
      const popup = new maplibregl.Popup({ offset: 14, closeButton: false, closeOnClick: false })
        .setHTML(`<div class="j-popup-inner"><strong>${destination.value.feature_name}</strong></div>`)
      const destEl = document.querySelector('.marker-destination')
      if (destEl) {
        destEl.addEventListener('mouseenter', () => popup.setLngLat([destLon, destLat]).addTo(map))
        destEl.addEventListener('mouseleave', () => popup.remove())
      }
      bounds.extend([destLon, destLat])
    }

    nearbyToilets.value.forEach(t => bounds.extend([t.longitude, t.latitude]))
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 64, maxZoom: 15 })
    map.resize()
  })
}

function addFallbackToMap() {
  clearRouteFromMap()
  safeAddRoute(() => {
    const bounds = new maplibregl.LngLatBounds()

    fallback.value.stops.forEach((item, i) => {
      if (!item.walking_route?.polyline) return
      const coords = decodePolyline(item.walking_route.polyline)
      coords.forEach(c => bounds.extend(c))
      addPolyline(`fallback-walk-${i}`, coords, '#15a8a8', true)

      const el = document.createElement('div')
      el.className = 'j-stop-marker'
      el.style.background = getModeColor(item.stop.mode)
      const popup = new maplibregl.Popup({ offset: 12, closeButton: false, closeOnClick: false })
        .setHTML(`<div class="j-popup-inner"><strong>${item.stop.name}</strong><br/><small>${item.stop.routes?.join(', ')}</small></div>`)
      addJourneyMarker(el, [item.stop.lon, item.stop.lat])
      el.addEventListener('mouseenter', () => popup.setLngLat([item.stop.lon, item.stop.lat]).addTo(map))
      el.addEventListener('mouseleave', () => popup.remove())
      bounds.extend([item.stop.lon, item.stop.lat])
    })

    const destLat = destination.value?.latitude
    const destLon = destination.value?.longitude
    if (destLat && destLon) bounds.extend([destLon, destLat])
    nearbyToilets.value.forEach(t => bounds.extend([t.longitude, t.latitude]))
    if (!bounds.isEmpty()) map.fitBounds(bounds, { padding: 64, maxZoom: 16 })
    map.resize()
  })
}

function resetJourneyToIdle() {
  clearRouteFromMap()
  uiState.value      = 'idle'
  geoError.value     = ''
  originCoords       = null
  originLabel.value  = 'Your location'
  // Re-fit map to toilets + destination
  if (map) fitMapToData()
}

// -- Journey: location --

function requestLocation() {
  geoError.value = ''
  if (!navigator.geolocation) {
    geoError.value = 'Geolocation is not supported by your browser.'
    return
  }
  uiState.value = 'loading'
  navigator.geolocation.getCurrentPosition(
    pos => {
      originCoords      = { lat: pos.coords.latitude, lon: pos.coords.longitude }
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

// -- Journey: API --

async function fetchPlan(lat, lon) {
  uiState.value = 'loading'
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/journeys/plan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ origin: { lat, lon }, destination_id: Number(route.params.id), departure_time: new Date().toISOString() })
    })
    if (res.status === 422) {
      clearRouteFromMap()
      errorMsg.value = 'Your location is outside our service area (Greater Melbourne only).'
      uiState.value  = 'error'
      return
    }
    if (res.status === 404) {
      clearRouteFromMap()
      const body = await res.json().catch(() => ({}))
      errorMsg.value = body.detail || 'No accessible journey found for this route and time.'
      uiState.value  = 'error'
      return
    }
    if (res.status === 503) {
      clearRouteFromMap()
      errorMsg.value = 'Journey planning is currently unavailable. Please try again shortly.'
      uiState.value  = 'error'
      return
    }
    if (!res.ok) throw new Error(res.status)
    journey.value = await res.json()
    uiState.value = 'plan'
    addRouteToMap()
  } catch {
    clearRouteFromMap()
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
      body: JSON.stringify({ destination_id: Number(route.params.id) })
    })
    if (!res.ok) throw new Error(res.status)
    fallback.value = await res.json()
    uiState.value  = 'fallback'
    addFallbackToMap()
  } catch {
    errorMsg.value = 'Unable to load nearby stops. Please try again.'
    uiState.value  = 'error'
  }
}

function getStopWarnings(stopIndex) {
  return fallback.value?.accessibility_summary?.warnings?.filter(w => w.stop_index === stopIndex) ?? []
}

function trimWarningMessage(msg) {
  return msg?.replace(' Check with the operator before relying on this stop.', '') ?? msg
}

// -- Formatters --

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

// -- Mode helpers --

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

// -- Wheelchair helpers --

function getWcClass(val) {
  return val === 'POSSIBLE' ? 'tl-tag-green' : val === 'NOT_POSSIBLE' ? 'tl-tag-red' : 'tl-tag-neutral'
}

function getWcLabel(val) {
  return val === 'POSSIBLE' ? 'Wheelchair accessible' : val === 'NOT_POSSIBLE' ? 'Not wheelchair accessible' : 'Accessibility unconfirmed'
}

function getBoardingClass(val) {
  return val === 'POSSIBLE' ? 'tl-tag-green' : val === 'NOT_POSSIBLE' ? 'tl-tag-red' : 'tl-tag-neutral'
}

function getBoardingLabel(val) {
  return val === 'POSSIBLE' ? 'Wheelchair boarding available' : val === 'NOT_POSSIBLE' ? 'Not wheelchair accessible' : 'Accessibility unconfirmed'
}

// -- Detail helpers --

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
/* -- DETAIL HERO -- */
.detail-hero { background: var(--t800); position: relative; overflow: hidden; }
.detail-hero::before {
  content: ''; position: absolute; inset: 0;
  background:
    radial-gradient(ellipse 60% 80% at 90% 15%, rgba(21,168,168,0.20) 0%, transparent 55%),
    radial-gradient(ellipse 40% 55% at 5% 90%,  rgba(3,46,46,0.60)    0%, transparent 50%);
}
.detail-hero-inner { position: relative; z-index: 2; }

.back-btn {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 14px; font-weight: 500; color: rgba(255,255,255,0.68);
  padding: 20px 0 24px; min-height: var(--touch-min);
  transition: color var(--tr), gap var(--tr);
}
.back-btn:hover { color: var(--w0); gap: 12px; }
.back-btn .pi { transition: transform var(--tr); }
.back-btn:hover .pi { transform: translateX(-3px); }

.venue-header {
  background: rgba(255,255,255,0.08); border: 1.5px solid rgba(255,255,255,0.15);
  border-radius: var(--r-xl); padding: clamp(20px,3vw,32px) clamp(20px,3vw,36px);
  display: flex; align-items: flex-start; justify-content: space-between;
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
  font-size: clamp(22px,3.5vw,38px); color: var(--w0); line-height: 1.12; margin-bottom: 10px;
}
.vh-meta { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; font-size: 14px; color: rgba(255,255,255,0.60); }
.vh-meta-item { display: flex; align-items: center; gap: 5px; }
.vh-badges { display: flex; gap: 8px; flex-wrap: wrap; align-self: flex-end; }
.vh-badge {
  display: flex; align-items: center; gap: 6px;
  padding: 9px 16px; border-radius: 11px; font-size: 13px; font-weight: 500; min-height: var(--touch-min);
}
.vh-badge-go   { background: rgba(13,138,74,0.28);  color: #7fedaf; border: 1.5px solid rgba(13,138,74,0.35); }
.vh-badge-none { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.45); border: 1.5px solid rgba(255,255,255,0.12); }
.vh-badge-no   { background: rgba(185,44,44,0.22);  color: #ff9090; border: 1.5px solid rgba(185,44,44,0.30); }
.type-badge {
  display: inline-flex; align-items: center;
  font-size: 11px; font-weight: 700; padding: 4px 11px; border-radius: 6px;
  letter-spacing: 0.04em; text-transform: uppercase;
  background: rgba(255,255,255,0.14); color: rgba(255,255,255,0.88); border: 1px solid rgba(255,255,255,0.2);
}
.icon-bg-gallery   { background: var(--t50);      color: var(--t600);  }
.icon-bg-museum    { background: #fce8d0;          color: #9a4a0a;      }
.icon-bg-library   { background: var(--green-bg);  color: var(--green); }
.icon-bg-theatre   { background: #f0e8ff;          color: #6b30c4;      }
.icon-bg-community { background: var(--amber-bg);  color: var(--amber); }
.icon-bg-sport     { background: #e8f0fe;          color: #2d5fc4;      }
.icon-bg-landmark  { background: #fce8d0;          color: #7a4000;      }
.icon-bg-default   { background: var(--w100);      color: var(--w600);  }

/* -- WAVE -- */
.wave-sep { display: block; width: 100%; overflow: hidden; line-height: 0; background: var(--bg); }
.wave-sep svg { display: block; }

/* -- DETAIL BODY -- */
.detail-body { background: var(--bg); padding: 0 0 clamp(48px,6vw,96px); }
.detail-wrap { padding-top: 32px; }

/* -- MAP WRAP -- */
.map-wrap {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--sh-sm);
  position: relative;
}

/* Standard map header */
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
  font-size: clamp(14px,1.5vw,16px); font-weight: 600; color: var(--w0);
}
.plan-journey-btn {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 9px 18px; min-height: var(--touch-min); border-radius: 100px;
  background: rgba(255,255,255,0.15); border: 1.5px solid rgba(255,255,255,0.30);
  color: var(--w0); font-size: 13.5px; font-weight: 600;
  cursor: pointer; transition: background var(--tr), border-color var(--tr); white-space: nowrap;
}
.plan-journey-btn:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.5); }
.plan-journey-btn:focus-visible { outline: 3px solid var(--t300); outline-offset: 3px; }

/* -- MAP CONTAINER -- */
.map-container { height: 480px; width: 100%; display: block; }
.map-container--journey { height: clamp(400px, 58vh, 640px); }

/* -- JOURNEY PLANNER FORM SECTION -- */
.jp-form-section { background: var(--surface); }

.jp-top-bar {
  display: flex; align-items: center; justify-content: space-between;
  gap: 16px; flex-wrap: wrap;
  padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.08);
  background: var(--t800);
}
.jp-top-bar-left { display: flex; align-items: center; gap: 14px; }
.jp-top-icon {
  width: 38px; height: 38px; border-radius: 12px; flex-shrink: 0;
  background: rgba(255,255,255,0.12); color: var(--t300);
  display: flex; align-items: center; justify-content: center; font-size: 17px;
}
.jp-title {
  font-family: 'DM Serif Display', serif;
  font-size: clamp(17px,2vw,22px); color: var(--w0); margin: 0 0 3px; line-height: 1.2;
}
.jp-title:focus { outline: none; }
.jp-subtitle { font-size: 12.5px; color: rgba(255,255,255,0.55); margin: 0; }
.jp-top-bar-right { display: flex; align-items: center; gap: 10px; }
.jp-provider-badge {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 5px 12px; border-radius: 100px;
  background: rgba(255,255,255,0.10); border: 1px solid rgba(255,255,255,0.18);
  color: rgba(255,255,255,0.65); font-size: 11.5px; font-weight: 700; letter-spacing: 0.04em;
}
.jp-close-btn {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 8px 16px; min-height: var(--touch-min); border-radius: 100px;
  background: rgba(255,255,255,0.10); border: 1.5px solid rgba(255,255,255,0.22);
  color: rgba(255,255,255,0.78); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: background var(--tr);
}
.jp-close-btn:hover { background: rgba(255,255,255,0.20); color: var(--w0); }
.jp-close-btn:focus-visible { outline: 3px solid var(--t300); outline-offset: 3px; }

.jp-form-body { padding: 16px 20px 20px; }

/* FROM / TO / button row */
.jp-inputs-row {
  display: grid; grid-template-columns: 1fr 1fr auto;
  gap: 10px; align-items: end;
}
.jp-field { display: flex; flex-direction: column; gap: 5px; }
.jp-field-label {
  font-size: 10px; font-weight: 800; letter-spacing: 0.10em;
  text-transform: uppercase; color: var(--t600);
}
.jp-input-wrap { position: relative; display: flex; align-items: center; }
.jp-input-icon { position: absolute; left: 13px; color: var(--t500); pointer-events: none; font-size: 13px; }
.jp-input {
  flex: 1; padding: 11px 14px 11px 38px;
  border: 1.5px solid var(--border); border-radius: var(--r-md);
  font-family: inherit; font-size: 14px; color: var(--t700);
  background: white; outline: none;
  transition: border-color var(--tr); height: 46px;
}
.jp-input::placeholder { color: var(--w400); }
.jp-input:focus { border-color: var(--t500); background: white; }
.jp-input:focus-visible { outline: 3px solid var(--t400); outline-offset: 2px; }
.jp-input-wrap--locked {
  background: var(--t50); border-radius: var(--r-md);
  border: 1.5px solid var(--border-lt); height: 46px;
}
.jp-input-locked {
  flex: 1; padding: 0 38px 0 38px;
  font-size: 14px; font-weight: 600; color: var(--t700);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  display: flex; align-items: center;
}
.jp-lock-icon { position: absolute; right: 13px; color: var(--w400); font-size: 12px; }
.jp-plan-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 0 22px; height: 46px; min-height: var(--touch-min);
  border-radius: var(--r-md); background: var(--t700); color: white;
  font-size: 14px; font-weight: 700; cursor: pointer;
  transition: background var(--tr); white-space: nowrap; border: none;
}
.jp-plan-btn:hover:not(:disabled) { background: var(--t800); }
.jp-plan-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.jp-plan-btn:focus-visible { outline: 3px solid var(--t400); outline-offset: 3px; }

/* Or / location row */
.jp-or-section { margin-top: 10px; display: flex; flex-direction: column; gap: 8px; }
.jp-divider {
  display: flex; align-items: center; gap: 10px;
  color: var(--w400); font-size: 11.5px; font-weight: 500;
}
.jp-divider::before, .jp-divider::after { content: ''; flex: 1; height: 1px; background: var(--border-lt); }
.jp-location-btn {
  display: flex; align-items: center; justify-content: center; gap: 10px;
  width: 100%; padding: 12px; min-height: var(--touch-min);
  border: 2px dashed var(--t500); border-radius: var(--r-md);
  background: rgba(21,168,168,0.05); color: var(--t600);
  font-size: 13.5px; font-weight: 600; cursor: pointer;
  transition: background var(--tr), border-color var(--tr);
}
.jp-location-btn:hover:not(:disabled) { background: rgba(21,168,168,0.10); border-color: var(--t700); }
.jp-location-btn:disabled { opacity: 0.45; cursor: not-allowed; }
.jp-location-btn:focus-visible { outline: 3px solid var(--t400); outline-offset: 3px; }
.jp-location-pulse {
  width: 10px; height: 10px; border-radius: 50%;
  background: var(--t500); border: 2px solid rgba(21,168,168,0.30);
  flex-shrink: 0;
}

/* Inline states */
.jp-inline-loading {
  display: flex; align-items: center; gap: 10px;
  margin-top: 10px; padding: 10px 14px;
  background: var(--t50); border-radius: var(--r-xs); border: 1px solid var(--border-lt);
  font-size: 13.5px; color: var(--t600);
}
.jp-inline-loading .pi { font-size: 1.1rem; }
.geo-error, .jp-error-msg {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 10px; padding: 10px 14px;
  background: var(--red-bg); border-radius: var(--r-xs); border: 1px solid rgba(185,44,44,0.20);
  font-size: 13px; color: var(--red);
}
.btn-link {
  background: none; border: none; color: var(--t600);
  font-size: 13px; font-weight: 600; cursor: pointer; text-decoration: underline;
  padding: 0; min-height: 0;
}
.btn-link:hover { color: var(--t800); }

/* Summary bar */
.jp-summary-bar {
  display: flex; align-items: center; flex-wrap: wrap; gap: 8px;
  margin-top: 12px; padding: 11px 14px;
  background: var(--t50); border-radius: var(--r-md);
  border: 1px solid var(--border-lt);
}
.jp-summary-bar--fallback { background: rgba(21,168,168,0.08); border-color: rgba(21,168,168,0.20); }
.sum-stat { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 600; color: var(--t700); }
.sum-stat .pi { color: var(--t500); font-size: 12px; }
.sum-div { width: 1px; height: 14px; background: var(--border-lt); }
.sum-acc {
  margin-left: auto; display: flex; align-items: center; gap: 5px;
  font-size: 11.5px; font-weight: 700; padding: 3px 10px; border-radius: 100px;
}
.acc-yes  { background: var(--green-bg); color: var(--green); }
.acc-warn { background: var(--amber-bg); color: var(--amber); }
.jp-steps-btn {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 5px 12px; min-height: 32px; border-radius: 100px;
  background: var(--t100); border: 1px solid var(--border-lt);
  color: var(--t700); font-size: 12px; font-weight: 600; cursor: pointer;
  transition: background var(--tr);
}
.jp-steps-btn:hover { background: var(--t200); }
.jp-steps-btn:focus-visible { outline: 3px solid var(--t400); outline-offset: 3px; }

/* -- MAP LEGEND -- */
.jp-legend {
  position: absolute; bottom: 12px; right: 12px;
  background: white; border-radius: var(--r-md);
  padding: 11px 14px; box-shadow: 0 2px 12px rgba(0,0,0,0.18);
  min-width: 195px; z-index: 2;
}
.jp-legend-title {
  font-size: 9.5px; font-weight: 800; letter-spacing: 0.10em;
  text-transform: uppercase; color: var(--w500); margin-bottom: 9px;
}
.jp-legend-item {
  display: flex; align-items: center; gap: 10px;
  font-size: 12px; color: var(--t700); padding: 2.5px 0;
}
.jp-legend-origin {
  width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0;
  background: #15a8a8; border: 2.5px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.2);
}
.jp-legend-walk {
  width: 24px; height: 3px; flex-shrink: 0;
  background: repeating-linear-gradient(to right, #15a8a8 0, #15a8a8 5px, transparent 5px, transparent 8px);
}
.jp-legend-transit { width: 24px; height: 3px; background: #1e3a5f; flex-shrink: 0; border-radius: 2px; }
.jp-legend-dest {
  width: 13px; height: 13px; border-radius: 50% 50% 50% 0; flex-shrink: 0;
  background: var(--t800); border: 2px solid white; transform: rotate(-45deg);
}
.jp-legend-wc {
  width: 20px; height: 20px; border-radius: 50%; flex-shrink: 0;
  background: #0d8a4a; border: 2px solid white; box-shadow: 0 1px 4px rgba(0,0,0,0.25);
  display: flex; align-items: center; justify-content: center;
}

/* -- JOURNEY TIMELINE / IDLE PLACEHOLDER -- */
.tl-idle-placeholder {
  flex: 1;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  gap: 12px; padding: 48px 24px; text-align: center;
  color: var(--w500);
  background: var(--surface); border: 1.5px dashed var(--border-lt);
  border-radius: var(--r-lg);
}
.tl-idle-placeholder .pi { font-size: 2rem; color: var(--w300); }
.tl-idle-placeholder p { font-size: 14px; line-height: 1.6; margin: 0; max-width: 320px; }

.jp-timeline-panel {
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: 0 0 var(--r-lg) var(--r-lg);
  border-top: none; padding: 24px 24px 32px;
  margin-top: -1px;
}

/* Warnings */
.warnings-panel { display: flex; flex-direction: column; gap: 6px; margin-bottom: 20px; }
.warning-row {
  display: flex; align-items: flex-start; gap: 8px;
  font-size: 12.5px; color: #92400e;
  background: #fef3c7; border: 1px solid #fde68a;
  border-radius: var(--r-xs); padding: 10px 12px; line-height: 1.4;
}
.warning-row .pi { color: #d97706; margin-top: 1px; flex-shrink: 0; }

/* Timeline */
.timeline { display: flex; flex-direction: column; }
.tl-item { display: flex; min-height: 56px; }
.tl-last { min-height: 0; }
.tl-left { display: flex; flex-direction: column; align-items: center; width: 40px; flex-shrink: 0; }
.tl-right { flex: 1; padding: 0 0 24px 14px; }
.tl-last .tl-right { padding-bottom: 0; }
.tl-dot {
  width: 36px; height: 36px; border-radius: 50%; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
  font-size: 15px; border: 2.5px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.15); z-index: 1;
}
.tl-dot-origin  { background: #15a8a8; }
.tl-dot-walk    { background: #0d8a4a; color: white; font-size: 14px; }
.tl-dot-transit { color: white; font-size: 13px; }
.tl-dot-dest    { background: var(--t800); color: var(--t300); }
.mode-abbr { font-size: 11px; font-weight: 800; color: white; }
.tl-conn { flex: 1; width: 2px; margin: 2px 0; }
.tl-solid { background: var(--border); }
.tl-dashed {
  background: repeating-linear-gradient(
    to bottom, var(--border) 0px, var(--border) 6px, transparent 6px, transparent 10px
  );
}
.tl-name { font-size: 15px; font-weight: 700; color: var(--t700); line-height: 1.25; margin-bottom: 3px; margin-top: 6px; }
.tl-sub  { font-size: 12.5px; color: var(--w600); margin-bottom: 8px; }
.tl-pill {
  display: inline-flex; align-items: center; gap: 6px;
  color: white; font-size: 12.5px; font-weight: 700;
  padding: 6px 14px; border-radius: 100px; margin-bottom: 8px;
}
.mode-abbr-sm { font-size: 10px; font-weight: 800; }
.tl-tags { display: flex; flex-wrap: wrap; gap: 6px; }
.tl-tag {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 600; padding: 3px 10px; border-radius: 100px;
}
.tl-tag-green   { background: var(--green-bg); color: var(--green); }
.tl-tag-amber   { background: var(--amber-bg); color: var(--amber); }
.tl-tag-red     { background: var(--red-bg);   color: var(--red);   }
.tl-tag-neutral { background: var(--w100);     color: var(--w600); border: 1px solid var(--w200); }

/* -- FALLBACK STOPS -- */
.fallback-hd { margin-bottom: 16px; }
.fallback-hd h2 { font-family: 'DM Serif Display', serif; font-size: 18px; color: var(--t700); margin-bottom: 4px; }
.fallback-hd p  { font-size: 13.5px; color: var(--w600); }

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
.stop-name  { font-size: 14px; font-weight: 700; color: var(--t700); margin-bottom: 3px; }
.stop-meta  { font-size: 12.5px; color: var(--w600); }
.stop-tags  { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
.stop-routes { font-size: 12px; color: var(--w600); }
.routes-label { font-weight: 600; color: var(--t600); margin-right: 4px; }

/* -- DETAIL LAYOUT -- */
.detail-layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: stretch; }
.detail-main { display: flex; flex-direction: column; }
.detail-side { display: flex; flex-direction: column; gap: 16px; }

/* -- HOURS PANEL -- */
.hours-panel { background: var(--surface); border: 1.5px solid var(--border-lt); border-radius: var(--r-lg); overflow: hidden; box-shadow: var(--sh-sm); }
.hours-panel-hd { background: var(--t800); padding: 16px 20px; display: flex; align-items: flex-start; gap: 12px; }
.hours-hd-icon {
  width: 34px; height: 34px; border-radius: 10px; flex-shrink: 0;
  background: rgba(255,255,255,0.12); color: var(--t300);
  display: flex; align-items: center; justify-content: center; font-size: 15px;
}
.hours-hd-title { font-family: 'DM Serif Display', serif; font-size: 16px; font-weight: 700; color: var(--w0); line-height: 1.2; }
.hours-hd-sub   { font-size: 12.5px; color: rgba(255,255,255,0.55); margin-top: 3px; }
.hours-panel-body { padding: 6px 0; }
.hours-row {
  display: flex; align-items: center; justify-content: space-between;
  padding: 9px 20px; gap: 12px; border-bottom: 1px solid var(--border-lt);
}
.hours-row:last-child { border-bottom: none; }
.hours-row-today { background: var(--t50); }
.hours-row-day { display: flex; align-items: center; gap: 8px; font-size: 13.5px; color: var(--t700); }
.hours-row-today .hours-row-day { font-weight: 700; }
.hours-row-time { font-size: 13px; color: var(--w600); white-space: nowrap; }
.hours-row-today .hours-row-time { font-weight: 600; color: var(--t600); }
.hours-open-chip {
  font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 100px;
  background: rgba(13,138,74,0.15); color: var(--green); border: 1px solid rgba(13,138,74,0.28);
}
.hours-closed-chip {
  font-size: 10px; font-weight: 800; letter-spacing: 0.06em;
  padding: 2px 8px; border-radius: 100px;
  background: rgba(185,44,44,0.15); color: var(--red); border: 1px solid rgba(185,44,44,0.28);
}
.hours-panel-foot {
  padding: 10px 20px; background: var(--t50); border-top: 1px solid var(--border-lt);
  font-size: 12px; color: var(--t500); display: flex; align-items: center; gap: 6px;
}
.no-hours { font-size: 13px; color: var(--w400); margin: 0; padding: 12px 20px; }

/* -- TOILETS -- */
.section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
.section-label { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 800; letter-spacing: 0.09em; text-transform: uppercase; color: var(--t500); }
.section-badge { font-size: 12px; font-weight: 600; color: var(--w400); background: var(--w100); padding: 4px 12px; border-radius: 100px; border: 1px solid var(--w200); }
.toilets-list { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.toilet-card {
  display: flex; align-items: center; gap: 14px;
  background: var(--surface); border: 1.5px solid var(--border-lt);
  border-radius: var(--r-md); padding: 14px 16px;
  transition: border-color var(--tr), box-shadow var(--tr);
}
.toilet-card:hover { border-color: var(--border); box-shadow: var(--sh-sm); }
.toilet-status-icon { width: 40px; height: 40px; border-radius: 12px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 18px; }
.status-accessible   { background: var(--green-bg); color: var(--green); }
.status-inaccessible { background: var(--red-bg);   color: var(--red);   }
.status-unknown      { background: var(--amber-bg); color: var(--amber); }
.toilet-info { flex: 1; min-width: 0; }
.toilet-name { font-size: 14px; font-weight: 600; color: var(--t700); line-height: 1.3; margin-bottom: 6px; }
.toilet-tags { display: flex; flex-wrap: wrap; gap: 5px; }
.toilet-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 6px; }
.toilet-badge.status-accessible   { background: var(--green-bg); color: var(--green); }
.toilet-badge.status-inaccessible { background: var(--red-bg);   color: var(--red);   }
.toilet-badge.status-unknown      { background: var(--w100); color: var(--w400); border: 1px solid var(--w200); }
.toilet-distance {
  display: flex; align-items: center; gap: 4px; flex-shrink: 0;
  font-size: 12px; font-weight: 700; color: var(--t500);
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
  background: var(--surface); border: 1.5px solid var(--border-lt); border-radius: var(--r-lg);
}
.no-toilets .pi { font-size: 2rem; color: var(--w400); }
.retry-btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 10px 24px; min-height: var(--touch-min);
  border-radius: 100px; background: var(--t800); color: var(--w0);
  font-size: 14px; font-weight: 600; transition: background var(--tr);
}
.retry-btn:hover { background: var(--t600); }
.retry-btn:focus-visible { outline: 3px solid var(--t400); outline-offset: 3px; }

/* -- RESPONSIVE -- */
@media (max-width: 900px) {
  .detail-layout { grid-template-columns: 1fr; }
}
@media (max-width: 640px) {
  .venue-header { flex-direction: column; }
  .vh-badges { align-self: flex-start; }
  .map-header { flex-direction: column; align-items: flex-start; }
  .map-container { height: 300px; }
  .map-container--journey { height: 320px; }
  .jp-inputs-row { grid-template-columns: 1fr; }
  .jp-plan-btn { width: 100%; }
  .jp-top-bar { flex-direction: column; align-items: flex-start; }
  .jp-legend { display: none; }
}
</style>

<style>
/* Global marker styles -- not scoped so MapLibre can render them */
.marker-destination { cursor: pointer; }
.marker-pin {
  display: flex; align-items: center; justify-content: center;
  width: 36px; height: 36px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg);
  box-shadow: 0 3px 10px rgba(0,0,0,0.30); border: 2.5px solid white;
}
.marker-pin .pi { transform: rotate(45deg); font-size: 16px; color: white; }
.marker-pin-teal { background: var(--t600); }
.marker-label {
  background: var(--t800); color: white;
  font-size: 11px; font-weight: 700; padding: 3px 8px; border-radius: 6px;
  margin-top: 4px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  font-family: 'DM Sans', sans-serif; text-align: center;
}
.marker-toilet { cursor: pointer; }
.marker-wc-pill {
  width: 38px; height: 38px; border-radius: 50%;
  border: 2.5px solid white; box-shadow: 0 2px 10px rgba(0,0,0,0.35);
  display: flex; align-items: center; justify-content: center;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.marker-wc-pill:hover { transform: scale(1.15); box-shadow: 0 4px 14px rgba(0,0,0,0.40); }

/* Journey route markers */
.j-origin-marker {
  width: 18px; height: 18px; border-radius: 50%;
  background: #15a8a8; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.30);
}
.j-stop-marker {
  width: 14px; height: 14px; border-radius: 50%;
  border: 2.5px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.25);
  cursor: pointer; transition: transform 0.15s;
}
.j-stop-marker:hover { transform: scale(1.3); }
.j-popup-inner {
  font-family: 'DM Sans', sans-serif; font-size: 13px; color: #1a2e2e; line-height: 1.4; min-width: 140px;
}
.j-popup-inner small { color: #6b8c8c; }

.maplibregl-popup-content {
  font-family: 'DM Sans', sans-serif !important;
  font-size: 13px !important; border-radius: 10px !important;
  padding: 12px 14px !important; box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
}
</style>
