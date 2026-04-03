import React, { useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { demandColor, rgbStr, demandTier, tierColor, tierLabel } from '../../utils/colors'
import MiniSparkline from '../Charts/MiniSparkline'
import { ChevronDown, Lightbulb, Star } from 'lucide-react'
import { REG_COLORS } from '../../data/cities'

function InsightsPanel() {
  const { zones, demandData, history, timeSlot, insightsOpen, setInsightsOpen } = useStore()
  const hour = timeSlot / 2

  const insights = useMemo(() => {
    const result = []
    zones.forEach(z => {
      const d = demandData[z.id] || 0
      const h = history[z.id] || []
      const profile = ['CBD','Commercial','Mixed','Residential','Transit','Industrial']
      const typBase = z.base * (z.peak || 1)
      const pct = typBase > 0 ? Math.round(((d - typBase * 0.5) / (typBase * 0.5)) * 100) : 0
      const stable = h.length >= 4 && h.slice(-4).every(v => Math.abs(v - (h.at(-1) || 0)) <= 3)
      if (Math.abs(pct) >= 20)
        result.push({ type: pct > 0 ? 'up' : 'dn', text: `<b>${z.name}</b> ${Math.abs(pct)}% ${pct > 0 ? 'above' : 'below'} typical` })
      else if (stable && h.length >= 4)
        result.push({ type: 'st', text: `<b>${z.name}</b> stable for last 4 intervals` })
    })
    return result.slice(0, 4)
  }, [demandData, zones])

  const iconMap = { up: '↑', dn: '↓', st: '→', warn: '!' }
  const colorMap = { up: '#30d880', dn: '#f04060', st: '#5a6080', warn: '#f0a030' }

  return (
    <div className="border-b border-border bg-purple/3">
      <button onClick={() => setInsightsOpen(!insightsOpen)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-white/2 transition-colors">
        <div className="flex items-center gap-2">
          <Lightbulb size={11} className="text-purple" />
          <span className="font-mono text-[9px] text-purple tracking-widest uppercase">Insights</span>
        </div>
        <ChevronDown size={11} className={`text-muted transition-transform ${insightsOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {insightsOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
            className="overflow-hidden">
            <div className="px-4 pb-3 flex flex-col gap-2">
              {insights.length ? insights.map((ins, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="w-4 h-4 rounded flex items-center justify-center text-[9px] flex-shrink-0 mt-0.5"
                    style={{ background: `${colorMap[ins.type]}18`, color: colorMap[ins.type] }}>
                    {iconMap[ins.type]}
                  </span>
                  <span className="text-text/80 leading-snug" dangerouslySetInnerHTML={{ __html: ins.text }} />
                </div>
              )) : (
                <p className="text-[10px] text-muted italic">Collecting data…</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function ZoneItem({ zone }) {
  const { demandData, prevDemand, history, selectedZoneId, setSelectedZone, setActiveTab, getDemandNorm, pinnedZones, togglePin } = useStore()
  const d     = demandData[zone.id] || 0
  const prev  = prevDemand[zone.id] || d
  const delta = d - prev
  const norm  = getDemandNorm(zone.id)
  const rgb   = demandColor(norm)
  const col   = rgbStr(rgb)
  const pct   = prev > 0 ? Math.round((delta / prev) * 100) : 0
  const tier  = demandTier(norm)
  const isPinned = pinnedZones.has(zone.id)
  const isSelected = selectedZoneId === zone.id

  return (
    <motion.div
      layout
      onClick={() => { setSelectedZone(zone.id); setActiveTab('zone') }}
      className={`flex items-center gap-2 px-3 py-2.5 border-b border-border/40 cursor-pointer transition-all group
        ${isSelected ? 'bg-accent/6 border-l-2 border-l-accent' : 'hover:bg-white/3'}`}
    >
      {/* Tier badge */}
      <span className="flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-medium border"
        style={{ color: tierColor(tier), borderColor: `${tierColor(tier)}30`, background: `${tierColor(tier)}10` }}>
        {tierLabel(tier)}
      </span>

      {/* Zone info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-text truncate font-medium">{zone.name}</span>
          {isPinned && <Star size={8} className="text-amber fill-amber flex-shrink-0" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[9px] font-mono" style={{ color: REG_COLORS[zone.reg] || '#5a6080' }}>{zone.reg}</span>
          <span className="text-[9px] text-muted">{zone.type}</span>
        </div>
        <div className="mt-1 h-[2px] rounded bg-border overflow-hidden">
          <div className="h-full rounded transition-all duration-500" style={{ width: `${norm * 100}%`, background: col }} />
        </div>
      </div>

      {/* Sparkline */}
      <div className="flex-shrink-0">
        <MiniSparkline data={(history[zone.id] || []).slice(-8)} color={col} width={40} height={18} filled={false} />
      </div>

      {/* Demand + delta */}
      <div className="flex-shrink-0 text-right w-14">
        <div className="font-mono text-sm font-semibold" style={{ color: col }}>{d}</div>
        <div className={`text-[9px] font-mono ${delta > 2 ? 'text-green' : delta < -2 ? 'text-red' : 'text-muted'}`}>
          {delta > 0 ? '↑' : delta < 0 ? '↓' : '→'}{Math.abs(delta)}
          {pct !== 0 && <span> ({pct > 0 ? '+' : ''}{pct}%)</span>}
        </div>
      </div>

      {/* Pin button */}
      <button onClick={e => { e.stopPropagation(); togglePin(zone.id) }}
        className={`flex-shrink-0 p-1 rounded transition-all opacity-0 group-hover:opacity-100 ${isPinned ? '!opacity-100' : ''}`}>
        <Star size={10} className={isPinned ? 'text-amber fill-amber' : 'text-muted'} />
      </button>
    </motion.div>
  )
}

export default function ZoneListPanel() {
  const { zones, demandData, prevDemand, filters, sortBy, pinnedZones, getDemandNorm, getTotalDemand, activeCity } = useStore()

  const sorted = useMemo(() => {
    const maxD = Math.max(1, ...Object.values(demandData))
    let list = [...zones]

    if (filters.size > 0) {
      list = list.filter(z => {
        const norm = (demandData[z.id] || 0) / maxD
        const delta = Math.abs((demandData[z.id] || 0) - (prevDemand[z.id] || 0))
        if (filters.has('high')   && norm >= 0.65)   return true
        if (filters.has('medium') && norm >= 0.3 && norm < 0.65) return true
        if (filters.has('low')    && norm <  0.3)    return true
        if (filters.has('change') && delta >= 3)      return true
        return false
      })
    }

    list.sort((a, b) => {
      if (sortBy === 'demand') return (demandData[b.id] || 0) - (demandData[a.id] || 0)
      if (sortBy === 'delta') {
        const da = Math.abs((demandData[a.id] || 0) - (prevDemand[a.id] || 0))
        const db = Math.abs((demandData[b.id] || 0) - (prevDemand[b.id] || 0))
        return db - da
      }
      return (demandData[b.id] || 0) - (demandData[a.id] || 0)
    })

    // Pinned first
    list.sort((a, b) => (pinnedZones.has(b.id) ? 1 : 0) - (pinnedZones.has(a.id) ? 1 : 0))
    return list
  }, [zones, demandData, prevDemand, filters, sortBy, pinnedZones])

  return (
    <div className="flex flex-col h-full bg-surface border-r border-border" style={{ width: 300 }}>
      {/* Header summary */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-border flex justify-between items-start">
        <div>
          <div className="font-mono text-[9px] text-muted tracking-widest uppercase mb-1">Total demand</div>
          <div className="text-xl font-light">
            <span className="font-mono text-accent font-medium">{getTotalDemand().toLocaleString()}</span>
            <span className="text-muted text-sm ml-1">rides</span>
          </div>
          <div className="text-[10px] text-muted mt-0.5">{activeCity.name} · {zones.length} zones</div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[9px] text-muted uppercase tracking-widest">Zones</div>
          <div className="font-mono text-lg text-text">{zones.length}</div>
        </div>
      </div>

      <InsightsPanel />

      {/* Zone list */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {sorted.map(z => <ZoneItem key={z.id} zone={z} />)}
        </AnimatePresence>
        {sorted.length === 0 && (
          <div className="p-6 text-center text-muted text-xs">No zones match the current filters</div>
        )}
      </div>
    </div>
  )
}
