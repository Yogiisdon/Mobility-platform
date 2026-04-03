import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { Activity, Bell, Settings, ChevronDown, Pause, Play, Wifi, WifiOff } from 'lucide-react'

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'zone',     label: 'Zone Details' },
  { id: 'model',    label: 'Model Quality' },
  { id: 'cities',   label: 'All Cities' },
]

export default function Header() {
  const { activeTab, setActiveTab, isLive, setLive, getTimeLabel, activeToasts, allCities, activeCity, setCity, metrics } = useStore()
  const [now, setNow] = useState(new Date())
  const [cityMenuOpen, setCityMenuOpen] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  const utcTime = now.toLocaleTimeString('en-IN', { hour12: false, timeZone: 'Asia/Kolkata' })

  return (
    <header className="flex-shrink-0 bg-surface border-b border-border" style={{ height: 52 }}>
      <div className="flex items-center h-full px-4 gap-0">

        {/* Logo */}
        <div className="flex items-center gap-2 pr-6 border-r border-border mr-4">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-accent/20 to-purple/20 border border-accent/30 flex items-center justify-center">
            <Activity size={14} className="text-accent" />
          </div>
          <div>
            <div className="font-display font-700 text-sm text-white tracking-tight leading-none">MobilityIQ</div>
            <div className="font-mono text-[8px] text-muted tracking-widest leading-none mt-0.5">DEMAND FORECAST</div>
          </div>
        </div>

        {/* City selector */}
        <div className="relative mr-4 pr-4 border-r border-border">
          <button
            onClick={() => setCityMenuOpen(!cityMenuOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card border border-border hover:border-accent/40 transition-all text-xs font-mono text-text"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />
            {activeCity.name}
            <ChevronDown size={11} className="text-muted" />
          </button>
          {cityMenuOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-card2 border border-border rounded-xl shadow-2xl z-50 py-1 max-h-72 overflow-y-auto">
              {[1, 2].map(tier => (
                <div key={tier}>
                  <div className="px-3 py-1.5 text-[9px] font-mono text-muted tracking-widest uppercase border-b border-border">
                    {tier === 1 ? 'Tier 1 / Metro' : 'Tier 2'}
                  </div>
                  {allCities.filter(c => c.tier === tier).map(c => (
                    <button key={c.id}
                      onClick={() => { setCity(c); setCityMenuOpen(false) }}
                      className={`w-full text-left px-3 py-2 text-xs hover:bg-card transition-colors flex justify-between items-center
                        ${activeCity.id === c.id ? 'text-accent' : 'text-text'}`}
                    >
                      <span>{c.name}</span>
                      <span className="text-[9px] text-muted font-mono">{c.state}</span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tab bar */}
        <nav className="flex gap-0.5 mr-auto">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`relative px-4 py-1.5 text-xs font-mono tracking-wide transition-colors rounded
                ${activeTab === t.id ? 'text-white' : 'text-muted hover:text-text'}`}
            >
              {activeTab === t.id && (
                <motion.div layoutId="tab-indicator"
                  className="absolute inset-0 bg-accent/10 border border-accent/20 rounded"
                  transition={{ type: 'spring', bounce: 0.15, duration: 0.35 }}
                />
              )}
              <span className="relative z-10">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          {/* Metrics mini */}
          <div className="hidden lg:flex items-center gap-3 text-[10px] font-mono border-x border-border px-3">
            <span className="text-muted">MAE</span>
            <span className="text-green">{metrics.mae}</span>
            <span className="text-muted">MAPE</span>
            <span className={metrics.mape < 10 ? 'text-green' : 'text-amber'}>{metrics.mape}%</span>
          </div>

          {/* Live status */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setLive(!isLive)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono transition-all
              ${isLive
                ? 'bg-accent/8 border-accent/25 text-accent hover:bg-accent/15'
                : 'bg-red/8 border-red/25 text-red hover:bg-red/15'}`}
          >
            {isLive ? <Wifi size={11} /> : <WifiOff size={11} />}
            {isLive ? 'LIVE' : 'PAUSED'}
            {isLive && <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-slow" />}
          </motion.button>

          {/* Time */}
          <div className="font-mono text-[10px] text-muted hidden sm:block">
            {utcTime} <span className="text-faint">IST</span>
          </div>

          {/* Notification bell */}
          <button className="relative p-1.5 hover:text-text text-muted transition-colors">
            <Bell size={15} />
            {activeToasts.length > 0 && (
              <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red rounded-full text-[8px] font-mono flex items-center justify-center text-white">
                {activeToasts.length}
              </span>
            )}
          </button>

          <button className="p-1.5 hover:text-text text-muted transition-colors">
            <Settings size={15} />
          </button>
        </div>
      </div>
    </header>
  )
}
