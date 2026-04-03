import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { ForecastChart, ActualVsPredChart, ErrorChart } from '../components/Charts/DemandCharts'
import { demandColor, rgbStr, demandTier, tierColor } from '../utils/colors'
import MiniSparkline from '../components/Charts/MiniSparkline'
import { Star, ArrowLeft, TrendingUp, MapPin, Clock } from 'lucide-react'
import { REG_COLORS } from '../data/cities'

function StatCard({ label, value, sub, color }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-1">{label}</div>
      <div className="font-mono text-2xl font-light" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] text-muted mt-0.5">{sub}</div>}
    </div>
  )
}

function ZoneCard({ zone, isSelected, onClick }) {
  const { demandData, history, getDemandNorm, getDelta } = useStore()
  const d = demandData[zone.id] || 0
  const norm = getDemandNorm(zone.id)
  const rgb = demandColor(norm)
  const col = rgbStr(rgb)
  const delta = getDelta(zone.id)

  return (
    <motion.div
      whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
      onClick={onClick}
      className={`bg-card border rounded-xl p-3 cursor-pointer transition-all
        ${isSelected ? 'border-accent/50 shadow-lg shadow-accent/5' : 'border-border hover:border-border2'}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="font-medium text-sm text-text">{zone.name}</div>
          <div className="text-[9px] font-mono mt-0.5" style={{ color: REG_COLORS[zone.reg] || '#5a6080' }}>{zone.reg}</div>
        </div>
        <span className="font-mono text-xs font-bold" style={{ color: col }}>{d}</span>
      </div>
      <MiniSparkline data={(history[zone.id] || []).slice(-10)} color={col} width="100%" height={20} />
      <div className="flex items-center justify-between mt-2">
        <div className="h-1 flex-1 rounded bg-border overflow-hidden mr-2">
          <div className="h-full rounded transition-all" style={{ width: `${norm * 100}%`, background: col }} />
        </div>
        <span className={`font-mono text-[9px] ${delta >= 0 ? 'text-green' : 'text-red'}`}>
          {delta >= 0 ? '+' : ''}{delta}
        </span>
      </div>
    </motion.div>
  )
}

export default function ZonePage() {
  const {
    zones, selectedZoneId, setSelectedZone, setActiveTab,
    demandData, history, futurePreds, metrics, getDemandNorm, getDelta, getDeltaPct,
    pinnedZones, togglePin,
  } = useStore()

  const zone = zones.find(z => z.id === selectedZoneId)
  const d     = zone ? (demandData[zone.id] || 0) : 0
  const norm  = zone ? getDemandNorm(zone.id) : 0
  const rgb   = demandColor(norm)
  const col   = rgbStr(rgb)
  const delta = zone ? getDelta(zone.id) : 0
  const pct   = zone ? getDeltaPct(zone.id) : 0
  const hist  = zone ? (history[zone.id] || []) : []

  if (!zone) {
    return (
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <div className="w-16 h-16 rounded-2xl bg-card border border-border flex items-center justify-center">
          <MapPin size={24} className="text-muted" />
        </div>
        <div className="text-center">
          <div className="text-base font-display font-semibold text-text mb-1">No zone selected</div>
          <div className="text-xs text-muted">Choose a zone from the Overview map or list</div>
        </div>
        <button onClick={() => setActiveTab('overview')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border text-sm text-muted hover:text-text hover:border-border2 transition-all">
          <ArrowLeft size={14} /> Go to Overview
        </button>
      </div>
    )
  }

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Zone grid (left) */}
      <div className="w-64 flex-shrink-0 border-r border-border overflow-y-auto p-3 flex flex-col gap-2">
        <div className="font-mono text-[9px] text-muted tracking-widest uppercase px-1 mb-1">All Zones</div>
        {zones.map(z => (
          <ZoneCard key={z.id} zone={z} isSelected={z.id === selectedZoneId}
            onClick={() => setSelectedZone(z.id)} />
        ))}
      </div>

      {/* Detail (right) */}
      <div className="flex-1 overflow-y-auto p-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Zone heading */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="font-display text-2xl font-bold text-white">{zone.name}</h1>
                <button onClick={() => togglePin(zone.id)}
                  className={`p-1.5 rounded-lg border transition-all ${pinnedZones.has(zone.id) ? 'border-amber/40 text-amber bg-amber/10' : 'border-border text-muted hover:border-amber/30 hover:text-amber'}`}>
                  <Star size={13} className={pinnedZones.has(zone.id) ? 'fill-amber' : ''} />
                </button>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted">
                <span style={{ color: REG_COLORS[zone.reg] || '#5a6080' }}>{zone.reg}</span>
                <span>·</span>
                <span>{zone.type}</span>
                <span>·</span>
                <span className="font-mono">{zone.lat.toFixed(4)}°N, {zone.lon.toFixed(4)}°E</span>
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-4xl font-light" style={{ color: col }}>{d}</div>
              <div className="text-muted text-sm">rides / interval</div>
              <div className={`font-mono text-sm mt-1 ${delta >= 0 ? 'text-green' : 'text-red'}`}>
                {delta >= 0 ? '↑' : '↓'}{Math.abs(delta)} ({pct > 0 ? '+' : ''}{pct}%)
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <StatCard label="Current demand"  value={d}               sub="rides / 30 min"     color={col} />
            <StatCard label="Peak today"       value={Math.max(...hist, d)} sub="rides / 30 min" color="#f0a030" />
            <StatCard label="24-hr avg"        value={hist.length ? Math.round(hist.reduce((a,b)=>a+b,0)/hist.length) : '—'}
                                               sub="rides / 30 min" color="#7c6ef5" />
            <StatCard label="Zone base"        value={zone.base}       sub="typical demand"     color="#5a6080" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp size={12} className="text-purple" />
                <span className="font-mono text-[9px] text-muted uppercase tracking-widest">Demand Forecast</span>
              </div>
              <ForecastChart predictions={futurePreds[zone.id] || []} history={hist} zone={zone} />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Actual vs Predicted</div>
              <ActualVsPredChart history={hist} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2 bg-card border border-border rounded-xl p-4">
              <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Error Timeline</div>
              <ErrorChart history={hist} />
            </div>
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Model Metrics</div>
              <div className="flex flex-col gap-2 mt-2">
                {[
                  { label: 'MAE',  value: metrics.mae,  color: '#30d880' },
                  { label: 'RMSE', value: metrics.rmse, color: '#30d880' },
                  { label: 'MAPE', value: `${metrics.mape}%`, color: metrics.mape < 10 ? '#30d880' : '#f0a030' },
                ].map(m => (
                  <div key={m.label} className="flex justify-between items-center">
                    <span className="font-mono text-[10px] text-muted">{m.label}</span>
                    <span className="font-mono text-sm font-medium" style={{ color: m.color }}>{m.value}</span>
                  </div>
                ))}
                <div className="mt-2 pt-2 border-t border-border">
                  <span className={`text-[9px] font-mono ${metrics.trend === 'improving' ? 'text-green' : 'text-amber'}`}>
                    ↓ {metrics.trend}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
