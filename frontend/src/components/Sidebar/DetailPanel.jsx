import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { ForecastChart, ActualVsPredChart, ErrorChart } from '../Charts/DemandCharts'
import { demandColor, rgbStr, demandTier, tierColor } from '../../utils/colors'
import { Star, ChevronRight, Bell, TrendingUp, BarChart2, Info } from 'lucide-react'

// ── Metric chip with hover tooltip ────────────────────────────────────────────
function MetricChip({ label, value, unit = '', status = 'good', trend, tooltip }) {
  const [show, setShow] = useState(false)
  const statusColor = status === 'good' ? '#30d880' : status === 'warn' ? '#f0a030' : '#f04060'
  return (
    <div className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}>
      <div className="bg-card border border-border rounded-lg px-3 py-2.5 cursor-help hover:border-purple/40 transition-colors">
        <div className="flex items-center justify-between mb-1">
          <span className="font-mono text-[9px] text-muted tracking-widest uppercase">{label}</span>
          <Info size={9} className="text-faint" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono text-lg font-medium" style={{ color: statusColor }}>{value}</span>
          {unit && <span className="font-mono text-[10px] text-muted">{unit}</span>}
        </div>
        {trend && (
          <div className={`text-[9px] mt-1 font-mono ${status === 'good' ? 'text-green' : 'text-amber'}`}>
            {trend}
          </div>
        )}
      </div>
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }}
            className="absolute z-50 bottom-full left-0 mb-2 w-56 bg-card2 border border-border2 rounded-xl p-3 shadow-2xl text-xs leading-relaxed"
          >
            <div dangerouslySetInnerHTML={{ __html: tooltip }} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Legend with clickable filters ─────────────────────────────────────────────
function DemandLegend() {
  const { filters, toggleFilter } = useStore()
  const tiers = [
    { key: 'low',    label: 'Low',    color: '#3090f0', range: '< 30%' },
    { key: 'medium', label: 'Medium', color: '#f07020', range: '30–65%' },
    { key: 'high',   label: 'High',   color: '#f03050', range: '> 65%' },
  ]
  return (
    <div className="px-4 py-3 border-b border-border">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] text-muted tracking-widest uppercase">Demand intensity</span>
        <span className="text-[9px] text-faint">click to filter</span>
      </div>
      <div className="h-2 rounded-full mb-2"
        style={{ background: 'linear-gradient(to right, #3090f0, #30d880, #f0c840, #f07020, #f03050)' }} />
      <div className="flex gap-1.5">
        {tiers.map(t => (
          <button key={t.key}
            onClick={() => toggleFilter(t.key)}
            className={`flex-1 py-1 px-2 rounded-lg border text-[9px] font-mono transition-all
              ${filters.has(t.key)
                ? `border-current`
                : 'border-border text-muted hover:border-border2 hover:text-text'}`}
            style={filters.has(t.key) ? { color: t.color, borderColor: `${t.color}50`, background: `${t.color}10` } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Alert config tab ──────────────────────────────────────────────────────────
function AlertsTab() {
  const { zones, alerts, addAlert, removeAlert } = useStore()
  const [form, setForm] = useState({ zid: zones[0]?.id || '', cond: 'gt', val: 60 })

  const handleAdd = () => {
    const zone = zones.find(z => z.id === form.zid)
    if (!zone) return
    addAlert({ zid: form.zid, zname: zone.name, cond: form.cond, val: Number(form.val) })
  }

  return (
    <div className="flex flex-col gap-0 overflow-y-auto">
      {/* Form */}
      <div className="px-4 py-3 border-b border-border bg-card/30">
        <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-3">Configure Alert</div>
        <div className="flex flex-col gap-2">
          <div>
            <label className="block text-[9px] text-muted font-mono mb-1 uppercase tracking-wide">Zone</label>
            <select value={form.zid} onChange={e => setForm(f => ({ ...f, zid: e.target.value }))}
              className="w-full bg-card border border-border text-text rounded-lg font-mono text-[10px] px-2 py-1.5 outline-none hover:border-border2">
              {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
            </select>
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-[9px] text-muted font-mono mb-1 uppercase tracking-wide">Condition</label>
              <select value={form.cond} onChange={e => setForm(f => ({ ...f, cond: e.target.value }))}
                className="w-full bg-card border border-border text-text rounded-lg font-mono text-[10px] px-2 py-1.5 outline-none hover:border-border2">
                <option value="gt">Demand &gt;</option>
                <option value="lt">Demand &lt;</option>
                <option value="drop">Drop &gt;%</option>
              </select>
            </div>
            <div className="w-20">
              <label className="block text-[9px] text-muted font-mono mb-1 uppercase tracking-wide">Value</label>
              <input type="number" value={form.val} onChange={e => setForm(f => ({ ...f, val: e.target.value }))}
                className="w-full bg-card border border-border text-text rounded-lg font-mono text-[10px] px-2 py-1.5 outline-none focus:border-purple/50" />
            </div>
          </div>
          <button onClick={handleAdd}
            className="w-full py-2 rounded-lg bg-purple/20 border border-purple/40 text-purple font-mono text-[10px] hover:bg-purple/30 transition-colors">
            + Add Alert
          </button>
        </div>
      </div>

      {/* Alert list */}
      <div className="px-4 py-3">
        <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-2">Active Alerts ({alerts.length})</div>
        {alerts.length === 0 && <p className="text-[10px] text-muted italic">No alerts configured</p>}
        <div className="flex flex-col gap-1.5">
          {alerts.map(a => (
            <div key={a.id} className="flex items-center justify-between bg-card border border-border rounded-lg px-3 py-2">
              <div>
                <div className="text-xs font-medium text-text">{a.zname}</div>
                <div className="font-mono text-[9px] text-muted">
                  {a.cond === 'gt' ? 'demand >' : a.cond === 'lt' ? 'demand <' : 'drop >'} {a.val}{a.cond === 'drop' ? '%' : ''}
                </div>
              </div>
              <button onClick={() => removeAlert(a.id)}
                className="text-muted hover:text-red transition-colors text-sm font-mono">✕</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main detail panel ─────────────────────────────────────────────────────────
const DTABS = [
  { id: 'forecast', label: 'Forecast',  icon: TrendingUp },
  { id: 'actual',   label: 'Actual vs Pred', icon: BarChart2 },
  { id: 'alerts',   label: 'Alerts',    icon: Bell },
]

export default function DetailPanel() {
  const {
    selectedZoneId, getZone, demandData, history, futurePreds,
    detailTab, setDetailTab, pinnedZones, togglePin, metrics,
    getDemandNorm, getDelta, getDeltaPct,
  } = useStore()

  const zone  = getZone(selectedZoneId)
  const d     = zone ? (demandData[zone.id] || 0) : 0
  const norm  = zone ? getDemandNorm(zone.id) : 0
  const rgb   = demandColor(norm)
  const col   = rgbStr(rgb)
  const delta = zone ? getDelta(zone.id) : 0
  const pct   = zone ? getDeltaPct(zone.id) : 0

  return (
    <div className="flex flex-col h-full bg-surface border-l border-border" style={{ width: 280 }}>

      {/* Zone header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border">
        {zone ? (
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="font-display font-semibold text-sm text-white truncate">{zone.name}</div>
              <button onClick={() => togglePin(zone.id)}
                className={`p-1 rounded transition-colors ${pinnedZones.has(zone.id) ? 'text-amber' : 'text-muted hover:text-amber'}`}>
                <Star size={12} className={pinnedZones.has(zone.id) ? 'fill-amber' : ''} />
              </button>
            </div>
            <div className="text-[10px] text-muted">{zone.reg} · {zone.type}</div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-mono text-2xl font-light" style={{ color: col }}>{d}</span>
              <span className="text-muted text-xs">rides / interval</span>
              <span className={`font-mono text-xs ${delta >= 0 ? 'text-green' : 'text-red'}`}>
                {delta >= 0 ? '↑' : '↓'}{Math.abs(delta)} ({pct > 0 ? '+' : ''}{pct}%)
              </span>
            </div>
          </div>
        ) : (
          <div>
            <div className="font-display font-semibold text-sm text-muted">Select a zone</div>
            <div className="text-[10px] text-faint mt-1">Click any zone on the map or list</div>
          </div>
        )}
      </div>

      {/* Tab bar */}
      <div className="flex-shrink-0 flex border-b border-border bg-bg">
        {DTABS.map(t => {
          const Icon = t.icon
          return (
            <button key={t.id} onClick={() => setDetailTab(t.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 font-mono text-[9px] tracking-wide uppercase border-b-2 transition-all
                ${detailTab === t.id ? 'border-accent text-accent' : 'border-transparent text-muted hover:text-text'}`}>
              <Icon size={9} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto">
        {detailTab === 'forecast' && (
          <div className="flex flex-col">
            {zone ? (
              <>
                <div className="px-4 py-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-[9px] text-muted uppercase tracking-widest">Demand forecast</span>
                    <span className="font-mono text-[9px]" style={{ color: col }}>{zone.name}</span>
                  </div>
                  <ForecastChart
                    predictions={futurePreds[zone.id] || []}
                    history={history[zone.id] || []}
                    zone={zone}
                  />
                </div>
                <div className="px-3 py-3 border-b border-border grid grid-cols-3 gap-2">
                  <MetricChip label="MAE" value={metrics.mae} status="good"
                    trend={`↓ ${metrics.trend}`}
                    tooltip="<b>Mean Absolute Error</b> — avg absolute diff between predicted & actual rides.<br><b>Good:</b> &lt;5 for Delhi NCR 30-min intervals." />
                  <MetricChip label="RMSE" value={metrics.rmse} status="good"
                    trend="↓ stable"
                    tooltip="<b>Root Mean Squared Error</b> — penalises large spikes more.<br><b>Good:</b> &lt;8 at this scale." />
                  <MetricChip label="MAPE" value={metrics.mape} unit="%" status={metrics.mape < 10 ? 'good' : 'warn'}
                    trend="→ stable"
                    tooltip="<b>Mean Absolute Percentage Error</b> — error as % of actual.<br><b>Good:</b> &lt;10% for urban mobility." />
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-muted text-xs">Select a zone to see forecasts</div>
            )}
            <DemandLegend />

            {/* Saved views */}
            <div className="px-4 py-3">
              <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-2">Saved Views</div>
              <div className="flex gap-2">
                <button onClick={() => {
                  const v = { zone: selectedZoneId, tab: detailTab, ts: new Date().toLocaleTimeString() }
                  localStorage.setItem('mobility_view', JSON.stringify(v))
                }}
                  className="flex-1 py-1.5 rounded-lg bg-card border border-border text-muted text-[10px] font-mono hover:border-border2 hover:text-text transition-colors">
                  Save current
                </button>
                <button onClick={() => {
                  const v = JSON.parse(localStorage.getItem('mobility_view') || 'null')
                  if (v) useStore.getState().setSelectedZone(v.zone)
                }}
                  className="flex-1 py-1.5 rounded-lg bg-card border border-border text-muted text-[10px] font-mono hover:border-border2 hover:text-text transition-colors">
                  Restore
                </button>
              </div>
            </div>
          </div>
        )}

        {detailTab === 'actual' && (
          <div className="flex flex-col">
            {zone ? (
              <>
                <div className="px-4 py-3 border-b border-border">
                  <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-2">Actual vs Predicted</div>
                  <ActualVsPredChart history={history[zone.id] || []} />
                </div>
                <div className="px-4 py-3">
                  <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-2">Error over time</div>
                  <ErrorChart history={history[zone.id] || []} />
                </div>
              </>
            ) : (
              <div className="p-6 text-center text-muted text-xs">Select a zone to compare</div>
            )}
          </div>
        )}

        {detailTab === 'alerts' && <AlertsTab />}
      </div>
    </div>
  )
}
