export function demandColor(norm) {
  const stops = [
    [0,    [48, 144, 240]],
    [0.25, [48, 216, 128]],
    [0.5,  [240, 200, 64]],
    [0.75, [240, 112, 32]],
    [1.0,  [240, 48,  80]],
  ]
  for (let i = 1; i < stops.length; i++) {
    const [t0, c0] = stops[i - 1]
    const [t1, c1] = stops[i]
    if (norm <= t1) {
      const t = (norm - t0) / (t1 - t0)
      return c0.map((v, k) => Math.round(v + t * (c1[k] - v)))
    }
  }
  return stops[stops.length - 1][1]
}

export function rgbStr(rgb, a = 1) {
  return `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${a})`
}

export function demandTier(norm) {
  if (norm >= 0.65) return 'high'
  if (norm >= 0.30) return 'medium'
  return 'low'
}

export function tierColor(tier) {
  return tier === 'high' ? '#f03050' : tier === 'medium' ? '#f07020' : '#3090f0'
}

export function tierLabel(tier) {
  return tier === 'high' ? 'H' : tier === 'medium' ? 'M' : 'L'
}

export function formatNum(n) {
  return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)
}

export function clsx(...args) {
  return args.filter(Boolean).join(' ')
}
