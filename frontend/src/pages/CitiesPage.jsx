import React from 'react'
import { motion } from 'framer-motion'
import { useStore } from '../store/useStore'
import { MapPin, TrendingUp, Building2, ChevronRight } from 'lucide-react'

const TIER_COLORS = { 1: '#00d4aa', 2: '#7c6ef5' }

function CityCard({ city, onSelect, isActive }) {
  // Simulate city-level stats
  const zones  = 12 + (city.id.length % 8)
  const demand = 800 + (city.id.charCodeAt(0) * 17) % 1200
  const growth = (Math.sin(city.id.charCodeAt(0)) * 12).toFixed(1)
  const isPos  = parseFloat(growth) >= 0

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      onClick={() => onSelect(city)}
      className={`bg-card border rounded-xl p-4 cursor-pointer transition-all
        ${isActive ? 'border-accent/50 shadow-lg shadow-accent/5' : 'border-border hover:border-border2'}`}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono text-[9px] px-1.5 py-0.5 rounded"
              style={{ color: TIER_COLORS[city.tier], background: `${TIER_COLORS[city.tier]}12`, border: `1px solid ${TIER_COLORS[city.tier]}25` }}>
              T{city.tier}
            </span>
            {isActive && <span className="font-mono text-[9px] text-accent">● ACTIVE</span>}
          </div>
          <div className="font-display font-semibold text-base text-white">{city.name}</div>
          <div className="text-[10px] text-muted font-mono">{city.state}</div>
        </div>
        <ChevronRight size={14} className="text-muted mt-1" />
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        <div>
          <div className="font-mono text-[8px] text-muted uppercase tracking-wide mb-0.5">Zones</div>
          <div className="font-mono text-sm text-text">{zones}</div>
        </div>
        <div>
          <div className="font-mono text-[8px] text-muted uppercase tracking-wide mb-0.5">Demand</div>
          <div className="font-mono text-sm text-accent">{demand.toLocaleString()}</div>
        </div>
        <div>
          <div className="font-mono text-[8px] text-muted uppercase tracking-wide mb-0.5">Growth</div>
          <div className={`font-mono text-sm ${isPos ? 'text-green' : 'text-red'}`}>
            {isPos ? '+' : ''}{growth}%
          </div>
        </div>
      </div>

      {/* Demand bar */}
      <div className="h-1 rounded bg-border overflow-hidden">
        <div className="h-full rounded bg-gradient-to-r from-accent to-purple transition-all"
          style={{ width: `${(demand / 2000) * 100}%` }} />
      </div>
    </motion.div>
  )
}

export default function CitiesPage() {
  const { allCities, activeCity, setCity, setActiveTab } = useStore()

  const handleSelect = (city) => {
    setCity(city)
    setActiveTab('overview')
  }

  const tier1 = allCities.filter(c => c.tier === 1)
  const tier2 = allCities.filter(c => c.tier === 2)

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-bg">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h1 className="font-display text-2xl font-bold text-white mb-1">All Indian Cities</h1>
            <p className="text-sm text-muted">{allCities.length} cities · Tier 1 metros + Tier 2 urban centres</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted font-mono">
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-accent/40 inline-block"/>Tier 1</span>
            <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-purple/40 inline-block"/>Tier 2</span>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total cities', value: allCities.length,   icon: Building2, color: '#00d4aa' },
            { label: 'Tier 1 metros', value: tier1.length,      icon: TrendingUp, color: '#7c6ef5' },
            { label: 'Tier 2 cities', value: tier2.length,      icon: MapPin,    color: '#f0a030' },
            { label: 'Total zones',   value: allCities.length * 15 + ' est', icon: MapPin, color: '#3090f0' },
          ].map((s, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}25` }}>
                <s.icon size={14} style={{ color: s.color }} />
              </div>
              <div>
                <div className="font-mono text-[8px] text-muted uppercase tracking-wide">{s.label}</div>
                <div className="font-mono text-lg font-medium text-white">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Tier 1 */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-accent" />
            <h2 className="font-display font-semibold text-base text-white">Tier 1 / Metro</h2>
            <span className="font-mono text-[9px] text-muted">{tier1.length} cities</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {tier1.map((city, i) => (
              <motion.div key={city.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <CityCard city={city} onSelect={handleSelect} isActive={city.id === activeCity.id} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tier 2 */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-purple" />
            <h2 className="font-display font-semibold text-base text-white">Tier 2 Cities</h2>
            <span className="font-mono text-[9px] text-muted">{tier2.length} cities</span>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {tier2.map((city, i) => (
              <motion.div key={city.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}>
                <CityCard city={city} onSelect={handleSelect} isActive={city.id === activeCity.id} />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  )
}
