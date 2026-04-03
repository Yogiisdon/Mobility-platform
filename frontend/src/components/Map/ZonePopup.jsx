import React from 'react'
import { rgbStr } from '../../utils/colors'
import MiniSparkline from '../Charts/MiniSparkline'

export default function ZonePopup({ zone, demand, norm, rgb, history, delta }) {
  const col = rgbStr(rgb)
  const pct = demand > 0 && delta !== 0 ? Math.round((delta / (demand - delta || 1)) * 100) : 0
  const tier = norm >= 0.65 ? 'High' : norm >= 0.3 ? 'Medium' : 'Low'

  return (
    <div style={{
      padding: '12px 14px', minWidth: 210,
      fontFamily: "'IBM Plex Sans', sans-serif", color: '#d8dce8',
    }}>
      <div style={{ fontFamily: "'IBM Plex Mono',monospace", fontSize: 10, color: col, marginBottom: 2, letterSpacing: 1 }}>
        {zone.name.toUpperCase()}
      </div>
      <div style={{ fontSize: 11, color: '#5a6080', marginBottom: 8 }}>
        {zone.reg} · {zone.type}
      </div>
      <div style={{ fontSize: 26, fontWeight: 300, color: col, lineHeight: 1, marginBottom: 8 }}>
        {demand}
        <span style={{ fontSize: 12, color: '#5a6080', marginLeft: 6 }}>rides</span>
      </div>
      <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 8, color: '#5a6080', fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: 1 }}>VS PREV</div>
          <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: delta >= 0 ? '#30d880' : '#f04060' }}>
            {delta >= 0 ? '+' : ''}{delta} ({pct >= 0 ? '+' : ''}{pct}%)
          </div>
        </div>
        <div>
          <div style={{ fontSize: 8, color: '#5a6080', fontFamily: 'IBM Plex Mono', textTransform: 'uppercase', letterSpacing: 1 }}>DEMAND</div>
          <div style={{ fontSize: 11, fontFamily: 'IBM Plex Mono', color: col }}>{tier}</div>
        </div>
      </div>
      <MiniSparkline data={history.slice(-12)} color={col} width={180} height={28} />
    </div>
  )
}
