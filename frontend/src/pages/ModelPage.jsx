import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, RadarChart, Radar, PolarGrid, PolarAngleAxis } from 'recharts'
import { demandColor, rgbStr } from '../utils/colors'

const CustomTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card2 border border-border rounded-lg px-3 py-2 text-xs shadow-xl">
      <div className="font-mono text-muted mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex gap-2">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-mono text-text">{typeof p.value === 'number' ? p.value.toFixed(2) : p.value}</span>
        </div>
      ))}
    </div>
  )
}

function MetricBig({ label, value, unit, status, desc }) {
  const c = status === 'good' ? '#30d880' : status === 'warn' ? '#f0a030' : '#f04060'
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-2">{label}</div>
      <div className="flex items-baseline gap-1 mb-1">
        <span className="font-mono text-3xl font-light" style={{ color: c }}>{value}</span>
        {unit && <span className="text-muted text-sm">{unit}</span>}
      </div>
      <div className="text-[10px] text-muted leading-snug">{desc}</div>
    </div>
  )
}

export default function ModelPage() {
  const { metrics, zones, demandData, history } = useStore()

  // Simulate metric history
  const maeHist = useMemo(() => Array.from({ length: 24 }, (_, i) => ({
    t: `${i}:00`,
    MAE:  +(3.2 + Math.sin(i * 0.4) * 0.6).toFixed(2),
    RMSE: +(4.9 + Math.sin(i * 0.35) * 0.8).toFixed(2),
    MAPE: +(8.4 + Math.sin(i * 0.3) * 1.4).toFixed(1),
  })), [])

  // Per-zone error simulation
  const zoneErrors = useMemo(() => zones.slice(0, 12).map(z => ({
    name: z.name.split(' ')[0],
    MAE:  +(2 + Math.abs(Math.sin(z.id.length * 1.3)) * 4).toFixed(2),
    MAPE: +(5 + Math.abs(Math.sin(z.id.length * 0.7)) * 8).toFixed(1),
  })), [zones])

  // Model comparison
  const comparison = [
    { model: 'GNN+LSTM', MAE: metrics.mae, RMSE: metrics.rmse, MAPE: metrics.mape },
    { model: 'LSTM only', MAE: +(metrics.mae * 1.28).toFixed(2), RMSE: +(metrics.rmse * 1.22).toFixed(2), MAPE: +(metrics.mape * 1.35).toFixed(1) },
    { model: 'ARIMA',     MAE: +(metrics.mae * 1.65).toFixed(2), RMSE: +(metrics.rmse * 1.58).toFixed(2), MAPE: +(metrics.mape * 1.72).toFixed(1) },
    { model: 'Lin. Reg.', MAE: +(metrics.mae * 2.10).toFixed(2), RMSE: +(metrics.rmse * 2.05).toFixed(2), MAPE: +(metrics.mape * 2.18).toFixed(1) },
  ]

  // Radar: feature importance
  const radar = [
    { feat: 'Past demand', value: 88 },
    { feat: 'Hour of day', value: 74 },
    { feat: 'Day of week', value: 62 },
    { feat: 'Neighbors',   value: 71 },
    { feat: 'Weather',     value: 45 },
    { feat: 'Events',      value: 38 },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-bg">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold text-white mb-1">Model Quality Dashboard</h1>
          <p className="text-sm text-muted">GNN + LSTM spatio-temporal forecasting — real-time evaluation metrics</p>
        </div>

        {/* Top metrics */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <MetricBig label="MAE" value={metrics.mae} status="good"
            desc="Mean Absolute Error across all zones. Target: < 5 rides." />
          <MetricBig label="RMSE" value={metrics.rmse} status="good"
            desc="Root Mean Squared Error — sensitive to outlier spikes." />
          <MetricBig label="MAPE" value={metrics.mape} unit="%" status={metrics.mape < 10 ? 'good' : 'warn'}
            desc="Mean Absolute % Error. < 10% is strong for urban demand." />
          <MetricBig label="Trend" value={metrics.trend === 'improving' ? '↓' : '→'} status={metrics.trend === 'improving' ? 'good' : 'warn'}
            desc={`Model error is ${metrics.trend} over the last hour.`} />
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* Metric history */}
          <div className="col-span-2 bg-card border border-border rounded-xl p-4">
            <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Metric History (24 h)</div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={maeHist} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="t" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} interval={3} />
                <YAxis tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Legend wrapperStyle={{ fontSize: 9, fontFamily: 'IBM Plex Mono', color: '#5a6080' }} />
                <Line type="monotone" dataKey="MAE"  stroke="#30d880" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="RMSE" stroke="#7c6ef5" strokeWidth={1.5} dot={false} />
                <Line type="monotone" dataKey="MAPE" stroke="#f0a030" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Feature importance radar */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Feature Importance</div>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radar}>
                <PolarGrid stroke="#1e2540" />
                <PolarAngleAxis dataKey="feat" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} />
                <Radar dataKey="value" stroke="#7c6ef5" fill="#7c6ef5" fillOpacity={0.15} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Model comparison */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Model Comparison</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={comparison} margin={{ top: 4, right: 4, left: -16, bottom: 0 }} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
                <YAxis dataKey="model" type="category" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} width={60} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="MAE"  fill="#00d4aa" radius={[0,3,3,0]} />
                <Bar dataKey="RMSE" fill="#7c6ef5" radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Per-zone error */}
          <div className="bg-card border border-border rounded-xl p-4">
            <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-3">Per-Zone MAE</div>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={zoneErrors} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTip />} />
                <Bar dataKey="MAE" radius={[3,3,0,0]}>
                  {zoneErrors.map((e, i) => {
                    const rgb = demandColor(e.MAE / 8)
                    return <rect key={i} fill={rgbStr(rgb)} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Architecture summary */}
        <div className="mt-4 bg-card border border-border rounded-xl p-5">
          <div className="font-mono text-[9px] text-muted uppercase tracking-widest mb-4">Model Architecture</div>
          <div className="flex items-center gap-0 overflow-x-auto">
            {[
              { label: 'Input', sub: '[T × Z × F]', color: '#3090f0' },
              { label: 'GCN Layer 1', sub: 'Spatial', color: '#7c6ef5' },
              { label: 'GCN Layer 2', sub: 'Spatial', color: '#7c6ef5' },
              { label: 'LayerNorm', sub: 'Normalise', color: '#5a6080' },
              { label: 'LSTM ×2', sub: 'Temporal', color: '#00d4aa' },
              { label: 'Dense Head', sub: 'Predict', color: '#f0a030' },
              { label: 'Output', sub: '[B × Z]', color: '#30d880' },
            ].map((n, i, arr) => (
              <div key={i} className="flex items-center flex-shrink-0">
                <div className="px-3 py-2 rounded-lg border text-center min-w-[80px]"
                  style={{ borderColor: `${n.color}35`, background: `${n.color}08` }}>
                  <div className="font-mono text-[10px] font-medium" style={{ color: n.color }}>{n.label}</div>
                  <div className="font-mono text-[8px] text-muted mt-0.5">{n.sub}</div>
                </div>
                {i < arr.length - 1 && (
                  <div className="text-muted mx-1 text-xs">→</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
