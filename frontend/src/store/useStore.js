import { create } from 'zustand'
import { DELHI_ZONES, CITIES, generateCityZones, DEMAND_PROFILES } from '../data/cities'

// ── Demand simulation helpers ──────────────────────────────────────────────
function getDemand(zone, hour, seed = 1) {
  const profile = DEMAND_PROFILES[zone.type] || DEMAND_PROFILES.Mixed
  const jitter  = 1 + Math.sin(seed * 6.28 + zone.id.length * 1.23) * 0.10
  return Math.max(1, Math.round(zone.base * profile[Math.round(hour) % 24] * jitter))
}

function getFuturePredictions(zone, fromHour, steps = 8) {
  return Array.from({ length: steps }, (_, i) =>
    getDemand(zone, (fromHour + i * 0.5) % 24, i + 3)
  )
}

// ── Store ──────────────────────────────────────────────────────────────────
export const useStore = create((set, get) => ({
  // ── City / zones ──────────────────────────────────────────────────────────
  activeCity: CITIES[0],
  zones: DELHI_ZONES,
  allCities: CITIES,

  setCity: (city) => {
    const zones = city.id === 'delhi_ncr'
      ? DELHI_ZONES
      : generateCityZones(city.id, city.lat, city.lon)
    set({ activeCity: city, zones, selectedZoneId: null, demandData: {}, history: {} })
  },

  // ── Demand state ──────────────────────────────────────────────────────────
  demandData:    {},   // { zoneId: number }
  prevDemand:    {},
  history:       {},   // { zoneId: number[] }
  futurePreds:   {},   // { zoneId: number[] }
  simStep:       0,
  timeSlot:      16,   // 0–47 (30-min slots, 16 = 08:00)
  isLive:        true,
  horizon:       'live',
  viewMode:      'demand',

  // ── UI state ──────────────────────────────────────────────────────────────
  selectedZoneId:   null,
  activeTab:        'overview',  // overview | zone | model | cities
  detailTab:        'forecast',  // forecast | actual | alerts
  filters:          new Set(),
  sortBy:           'demand',
  insightsOpen:     true,
  sidebarCollapsed: false,

  // ── Alerts & pins ─────────────────────────────────────────────────────────
  pinnedZones: new Set(JSON.parse(localStorage.getItem('mobility_pins') || '[]')),
  alerts:      JSON.parse(localStorage.getItem('mobility_alerts') || '[]'),
  activeToasts: [],

  // ── Model metrics (simulated, updated per tick) ───────────────────────────
  metrics: { mae: 3.21, rmse: 4.87, mape: 8.4, trend: 'improving' },

  // ── Actions ───────────────────────────────────────────────────────────────
  tick: () => {
    const { zones, demandData, history, timeSlot, simStep, isLive, alerts } = get()
    if (!isLive) return

    const hour    = timeSlot / 2
    const newStep = simStep + 1
    const newData = {}
    const newHist = { ...history }
    const newFuture = {}

    zones.forEach(z => {
      const d = getDemand(z, hour, newStep)
      newData[z.id] = d
      newHist[z.id] = [...(history[z.id] || []), d].slice(-48)
      newFuture[z.id] = getFuturePredictions(z, hour)
    })

    // Advance time slot
    const nextSlot = (timeSlot + 1) % 48

    // Metrics simulation
    const mae  = +(3.2 + Math.sin(newStep * 0.09) * 0.5).toFixed(2)
    const rmse = +(4.9 + Math.sin(newStep * 0.07) * 0.7).toFixed(2)
    const mape = +(8.4 + Math.sin(newStep * 0.06) * 1.3).toFixed(1)

    // Check alerts
    const toasts = []
    alerts.forEach(a => {
      const d    = newData[a.zid] || 0
      const prev = demandData[a.zid] || d
      if (a.cond === 'gt' && d > a.val)
        toasts.push({ id: Date.now() + Math.random(), msg: `${a.zname}: demand ${d} > ${a.val}`, type: 'warn' })
      if (a.cond === 'lt' && d < a.val)
        toasts.push({ id: Date.now() + Math.random(), msg: `${a.zname}: demand ${d} < ${a.val}`, type: 'info' })
      if (a.cond === 'drop' && prev > 0) {
        const drop = ((prev - d) / prev) * 100
        if (drop > a.val)
          toasts.push({ id: Date.now() + Math.random(), msg: `${a.zname}: demand dropped ${drop.toFixed(0)}%`, type: 'danger' })
      }
    })

    set({
      prevDemand:  demandData,
      demandData:  newData,
      history:     newHist,
      futurePreds: newFuture,
      simStep:     newStep,
      timeSlot:    nextSlot,
      metrics:     { mae, rmse, mape, trend: mae < 3.4 ? 'improving' : 'stable' },
      activeToasts: toasts.length ? [...get().activeToasts, ...toasts].slice(-4) : get().activeToasts,
    })
  },

  setTimeSlot:  (v) => set({ timeSlot: v }),
  setLive:      (v) => set({ isLive: v }),
  setHorizon:   (v) => set({ horizon: v }),
  setViewMode:  (v) => set({ viewMode: v }),
  setSelectedZone: (id) => set({ selectedZoneId: id }),
  setActiveTab:    (t) => set({ activeTab: t }),
  setDetailTab:    (t) => set({ detailTab: t }),
  setSortBy:       (v) => set({ sortBy: v }),
  setInsightsOpen: (v) => set({ insightsOpen: v }),
  setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),

  toggleFilter: (f) => {
    const filters = new Set(get().filters)
    filters.has(f) ? filters.delete(f) : filters.add(f)
    set({ filters })
  },

  togglePin: (id) => {
    const pinned = new Set(get().pinnedZones)
    pinned.has(id) ? pinned.delete(id) : pinned.add(id)
    localStorage.setItem('mobility_pins', JSON.stringify([...pinned]))
    set({ pinnedZones: pinned })
  },

  addAlert: (alert) => {
    const alerts = [...get().alerts, { ...alert, id: Date.now() }]
    localStorage.setItem('mobility_alerts', JSON.stringify(alerts))
    set({ alerts })
  },
  removeAlert: (id) => {
    const alerts = get().alerts.filter(a => a.id !== id)
    localStorage.setItem('mobility_alerts', JSON.stringify(alerts))
    set({ alerts })
  },
  dismissToast: (id) => set({ activeToasts: get().activeToasts.filter(t => t.id !== id) }),

  // ── Computed helpers ──────────────────────────────────────────────────────
  getZone:      (id) => get().zones.find(z => z.id === id),
  getTotalDemand: () => Object.values(get().demandData).reduce((a, b) => a + b, 0),
  getMaxDemand:   () => Math.max(1, ...Object.values(get().demandData)),
  getTimeLabel:   () => {
    const s = get().timeSlot
    const h = Math.floor(s / 2)
    const m = (s % 2) * 30
    return `${String(h).padStart(2,'0')}:${m === 0 ? '00' : '30'}`
  },
  getDemandNorm: (id) => {
    const d = get().demandData[id] || 0
    return d / get().getMaxDemand()
  },
  getDelta: (id) => {
    const cur  = get().demandData[id] || 0
    const prev = get().prevDemand[id] || cur
    return cur - prev
  },
  getDeltaPct: (id) => {
    const cur  = get().demandData[id] || 0
    const prev = get().prevDemand[id] || cur
    return prev > 0 ? Math.round(((cur - prev) / prev) * 100) : 0
  },
}))
