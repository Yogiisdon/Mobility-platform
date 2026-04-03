import React from 'react'
import { useStore } from '../../store/useStore'
import { Play, Pause } from 'lucide-react'

const SEG = (items, active, onChange, className = '') => (
  <div className={`flex gap-0.5 bg-card border border-border rounded-lg p-0.5 ${className}`}>
    {items.map(item => (
      <button key={item.value}
        onClick={() => onChange(item.value)}
        className={`px-3 py-1 rounded text-[10px] font-mono transition-all whitespace-nowrap
          ${active === item.value ? 'bg-purple/25 border border-purple/40 text-purple' : 'text-muted hover:text-text'}`}
      >
        {item.label}
      </button>
    ))}
  </div>
)

export default function Toolbar() {
  const {
    viewMode, setViewMode, horizon, setHorizon,
    timeSlot, setTimeSlot, isLive, setLive,
    filters, toggleFilter, sortBy, setSortBy,
  } = useStore()

  const h = Math.floor(timeSlot / 2)
  const m = (timeSlot % 2) * 30
  const timeLabel = `${String(h).padStart(2, '0')}:${m === 0 ? '00' : '30'} IST`

  const filterDefs = [
    { key: 'high',   label: 'High',   activeClass: 'bg-hot/12 border-hot/35 text-hot' },
    { key: 'medium', label: 'Mid',    activeClass: 'bg-warm/12 border-warm/35 text-warm' },
    { key: 'low',    label: 'Low',    activeClass: 'bg-cold/12 border-cold/35 text-cold' },
    { key: 'change', label: 'Δ≥3',   activeClass: 'bg-accent/12 border-accent/35 text-accent' },
  ]

  return (
    <div className="flex-shrink-0 bg-surface border-b border-border flex items-center gap-3 px-4 overflow-x-auto"
      style={{ height: 42 }}>

      {/* View mode */}
      <div className="flex items-center gap-2 pr-3 border-r border-border">
        <span className="text-[9px] font-mono text-faint tracking-widest uppercase">View</span>
        {SEG(
          [{ value: 'demand', label: 'Demand' }, { value: 'delta', label: 'Change' }, { value: 'rank', label: 'Rank' }],
          viewMode, setViewMode
        )}
      </div>

      {/* Horizon */}
      <div className="flex items-center gap-2 pr-3 border-r border-border">
        <span className="text-[9px] font-mono text-faint tracking-widest uppercase">Horizon</span>
        {SEG(
          [{ value: 'live', label: 'Live' }, { value: '30m', label: '+30m' }, { value: '1h', label: '+1h' }],
          horizon, setHorizon
        )}
      </div>

      {/* Time slider */}
      <div className="flex items-center gap-2 pr-3 border-r border-border min-w-0">
        <button onClick={() => setLive(!isLive)}
          className={`p-1 rounded transition-colors ${isLive ? 'text-accent hover:text-accent/70' : 'text-red hover:text-red/70'}`}>
          {isLive ? <Pause size={12} /> : <Play size={12} />}
        </button>
        <span className="text-[9px] font-mono text-faint hidden sm:block">TIME</span>
        <input type="range" min={0} max={47} step={1} value={timeSlot}
          onChange={e => setTimeSlot(+e.target.value)}
          className="w-24 cursor-pointer" />
        <span className="font-mono text-[10px] text-purple min-w-[60px]">{timeLabel}</span>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1.5 pr-3 border-r border-border">
        <span className="text-[9px] font-mono text-faint tracking-widest uppercase hidden sm:block">Filter</span>
        {filterDefs.map(f => (
          <button key={f.key}
            onClick={() => toggleFilter(f.key)}
            className={`px-2 py-0.5 rounded-full border text-[10px] font-mono transition-all
              ${filters.has(f.key) ? f.activeClass : 'border-border text-muted hover:border-border2 hover:text-text'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Sort */}
      <div className="flex items-center gap-2">
        <span className="text-[9px] font-mono text-faint tracking-widest uppercase hidden sm:block">Sort</span>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}
          className="bg-card border border-border text-text rounded-lg font-mono text-[10px] px-2 py-1 cursor-pointer outline-none hover:border-border2 transition-colors">
          <option value="demand">By Demand</option>
          <option value="delta">By Change</option>
          <option value="error">By Error</option>
        </select>
      </div>
    </div>
  )
}
