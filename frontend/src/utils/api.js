/**
 * utils/api.js
 * Typed API client wrapping the FastAPI backend.
 */
import axios from 'axios'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: `${BASE}/api/v1`,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
})

// ── Predictions ────────────────────────────────────────────────────────────
export const api = {
  getPredictions: (cityId = 'delhi_ncr') =>
    client.get(`/predictions/latest?city_id=${cityId}`).then(r => r.data),

  getHistory: (zoneId, lastN = 48) =>
    client.get(`/predictions/history/${zoneId}?last_n=${lastN}`).then(r => r.data),

  getMetrics: () =>
    client.get('/predictions/metrics').then(r => r.data),

  // ── Zones ────────────────────────────────────────────────────────────────
  getZones: (cityId = 'delhi_ncr') =>
    client.get(`/zones?city_id=${cityId}`).then(r => r.data),

  getZone: (zoneId) =>
    client.get(`/zones/${zoneId}`).then(r => r.data),

  // ── Cities ───────────────────────────────────────────────────────────────
  getCities: () =>
    client.get('/cities').then(r => r.data),

  // ── Health ───────────────────────────────────────────────────────────────
  health: () =>
    axios.get(`${BASE}/health`).then(r => r.data),
}

export default api
