import React from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-card2 border border-border rounded-lg px-3 py-2 shadow-xl text-xs">
      <div className="font-mono text-muted mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span style={{ color: p.color }}>{p.name}:</span>
          <span className="font-mono text-text">{p.value} rides</span>
        </div>
      ))}
    </div>
  )
}

export function ForecastChart({ predictions = [], history = [], zone }) {
  const histLabels = history.slice(-8).map((_, i) => `t-${7-i}`)
  const ftrLabels  = predictions.map((_, i) => `+${(i + 1) * 30}m`)
  const combined = [
    ...history.slice(-8).map((v, i) => ({ time: histLabels[i], actual: v, predicted: null, type: 'hist' })),
    ...predictions.map((v, i) => ({ time: ftrLabels[i], actual: null, predicted: v, type: 'future' })),
  ]

  return (
    <ResponsiveContainer width="100%" height={130}>
      <AreaChart data={combined} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="hist-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pred-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c6ef5" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#7c6ef5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="time" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={`t-0`} stroke="#1e2540" strokeDasharray="3 3" />
        <Area type="monotone" dataKey="actual"    stroke="#00d4aa" strokeWidth={1.5} fill="url(#hist-grad)" name="Actual"    dot={false} connectNulls={false} />
        <Area type="monotone" dataKey="predicted" stroke="#7c6ef5" strokeWidth={1.5} fill="url(#pred-grad)" name="Forecast" dot={{ r: 2, fill: '#7c6ef5' }} connectNulls={false} strokeDasharray="4 2" />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ActualVsPredChart({ history = [] }) {
  const actuals = history.slice(-10)
  const preds   = actuals.map((v, i) => Math.round(v * (1 + Math.sin(i * 2.3) * 0.08)))
  const data    = actuals.map((a, i) => ({ t: `t-${actuals.length - 1 - i}`, actual: a, predicted: preds[i] }))

  return (
    <ResponsiveContainer width="100%" height={120}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="act-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#00d4aa" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="prd-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#7c6ef5" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#7c6ef5" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 8, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="actual"    stroke="#00d4aa" strokeWidth={1.5} fill="url(#act-g)" name="Actual"    dot={false} />
        <Area type="monotone" dataKey="predicted" stroke="#7c6ef5" strokeWidth={1.5} fill="url(#prd-g)" name="Predicted" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ErrorChart({ history = [] }) {
  const actuals = history.slice(-12)
  const preds   = actuals.map((v, i) => Math.round(v * (1 + Math.sin(i * 2.3) * 0.08)))
  const data    = actuals.map((a, i) => ({ t: `t-${actuals.length - 1 - i}`, error: Math.abs(a - preds[i]) }))

  return (
    <ResponsiveContainer width="100%" height={80}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="err-g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#f0a030" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#f0a030" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="error" stroke="#f0a030" strokeWidth={1.5} fill="url(#err-g)" name="MAE" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function ModelMetricsChart({ maeHistory = [] }) {
  const data = maeHistory.map((v, i) => ({ t: i, mae: v }))
  return (
    <ResponsiveContainer width="100%" height={100}>
      <LineChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
        <XAxis dataKey="t" tick={false} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 7, fontFamily: 'IBM Plex Mono', fill: '#5a6080' }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
        <Tooltip content={<CustomTooltip />} />
        <Line type="monotone" dataKey="mae" stroke="#30d880" strokeWidth={1.5} dot={false} name="MAE" />
      </LineChart>
    </ResponsiveContainer>
  )
}
