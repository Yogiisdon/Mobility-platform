import React from 'react'
import { useStore } from '../../store/useStore'
import { motion } from 'framer-motion'

export default function TimeOverlay() {
  const { timeSlot, setTimeSlot, isLive, setLive, horizon, setHorizon, getTotalDemand, getTimeLabel } = useStore()

  return (
    <div className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none"
      style={{ background: 'linear-gradient(transparent, rgba(8,11,18,.92))', padding: '24px 16px 10px' }}>
      <div className="flex items-center gap-3 pointer-events-auto">
        {/* Total demand pill */}
        <div className="flex items-center gap-2 bg-card/80 border border-border backdrop-blur-sm rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="font-mono text-[9px] text-muted uppercase tracking-widest">Total</span>
          <span className="font-mono text-sm text-accent font-medium">{getTotalDemand().toLocaleString()}</span>
          <span className="font-mono text-[9px] text-muted">rides</span>
        </div>

        {/* Time slider */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="font-mono text-[9px] text-muted hidden sm:block">00:00</span>
          <input type="range" min={0} max={47} step={1} value={timeSlot}
            onChange={e => setTimeSlot(+e.target.value)}
            className="flex-1 cursor-pointer" />
          <span className="font-mono text-[9px] text-muted hidden sm:block">23:30</span>
        </div>

        {/* Current time */}
        <div className="bg-card/80 border border-purple/30 backdrop-blur-sm rounded-lg px-3 py-1.5 flex-shrink-0">
          <span className="font-mono text-xs text-purple">{getTimeLabel()} IST</span>
        </div>
      </div>
    </div>
  )
}
