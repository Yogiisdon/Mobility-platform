import React from 'react'

export default function MiniSparkline({ data = [], color = '#00d4aa', width = 120, height = 24, filled = true }) {
  if (!data.length) return <svg width={width} height={height} />
  const max = Math.max(...data, 1)
  const min = Math.min(...data)
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1 || 1)) * width
    const y = height - ((v - min) / (max - min || 1)) * (height - 2) - 1
    return `${x},${y}`
  })

  return (
    <svg width={width} height={height} xmlns="http://www.w3.org/2000/svg" style={{ overflow: 'visible' }}>
      {filled && (
        <path
          d={`M${pts[0]} ${pts.slice(1).map(p => `L${p}`).join(' ')} L${width},${height} L0,${height} Z`}
          fill={color}
          fillOpacity={0.1}
        />
      )}
      <polyline
        points={pts.join(' ')}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
