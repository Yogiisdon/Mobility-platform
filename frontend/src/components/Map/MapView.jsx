import React, { useEffect, useRef, useCallback } from 'react'
import L from 'leaflet'
import { useStore } from '../../store/useStore'
import { demandColor, rgbStr } from '../../utils/colors'
import ZonePopup from './ZonePopup'
import { createRoot } from 'react-dom/client'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({ iconUrl: '', shadowUrl: '' })

export default function MapView() {
  const mapRef      = useRef(null)
  const mapInstance = useRef(null)
  const circlesRef  = useRef({})
  const rootsRef    = useRef({})

  const {
    activeCity, zones, demandData, prevDemand, history,
    selectedZoneId, setSelectedZone, getDemandNorm, getMaxDemand,
  } = useStore()

  // Init map
  useEffect(() => {
    if (mapInstance.current) return
    const map = L.map(mapRef.current, {
      center: [activeCity.lat, activeCity.lon],
      zoom:   activeCity.zoom,
      zoomControl: true,
      attributionControl: false,
    })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19, subdomains: 'abcd',
    }).addTo(map)
    mapInstance.current = map
    return () => { map.remove(); mapInstance.current = null }
  }, [])

  // Re-center when city changes
  useEffect(() => {
    if (!mapInstance.current) return
    mapInstance.current.setView([activeCity.lat, activeCity.lon], activeCity.zoom, { animate: true, duration: 0.8 })
    // Remove old circles
    Object.values(circlesRef.current).forEach(c => c.remove())
    circlesRef.current = {}
    Object.values(rootsRef.current).forEach(r => { try { r.unmount() } catch {} })
    rootsRef.current = {}
  }, [activeCity.id])

  // Build / update circles
  useEffect(() => {
    if (!mapInstance.current || !zones.length) return
    const map = mapInstance.current
    const maxD = getMaxDemand()

    zones.forEach(zone => {
      const d    = demandData[zone.id] || 0
      const norm = d / maxD
      const rgb  = demandColor(norm)
      const col  = rgbStr(rgb)
      const radius = 400 + norm * 700

      if (!circlesRef.current[zone.id]) {
        const circle = L.circle([zone.lat, zone.lon], {
          radius, weight: 0.8,
          color: rgbStr(rgb, 0.35),
          fillColor: col,
          fillOpacity: 0.65,
        }).addTo(map)

        circle.on('click', () => {
          setSelectedZone(zone.id)
          map.panTo([zone.lat, zone.lon], { animate: true, duration: 0.5 })
        })

        // Custom popup with React
        circle.on('click', () => {
          const container = document.createElement('div')
          const popup = L.popup({ maxWidth: 240, className: 'mob-popup' })
            .setLatLng([zone.lat, zone.lon])
            .setContent(container)
            .openOn(map)

          if (!rootsRef.current[zone.id]) {
            rootsRef.current[zone.id] = createRoot(container)
          }
          rootsRef.current[zone.id].render(
            <ZonePopup zone={zone} demand={d} norm={norm} rgb={rgb}
              history={history[zone.id] || []}
              delta={d - (prevDemand[zone.id] || d)} />
          )
        })

        circlesRef.current[zone.id] = circle
      } else {
        circlesRef.current[zone.id].setStyle({
          radius,
          color:       rgbStr(rgb, 0.35),
          fillColor:   col,
          fillOpacity: 0.65,
        })
      }

      // Pulse selected
      if (zone.id === selectedZoneId) {
        circlesRef.current[zone.id].setStyle({ weight: 2, color: rgbStr(rgb, 0.8) })
      }
    })
  }, [demandData, zones, selectedZoneId])

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full" />
      {/* Vignette overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 55%, rgba(8,11,18,.6) 100%)' }} />
    </div>
  )
}
