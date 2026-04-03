/**
 * hooks/useSocket.js
 * WebSocket hook — connects to the FastAPI demand stream.
 * Falls back gracefully when server is offline.
 */
import { useEffect, useRef, useCallback } from 'react'
import { useStore } from '../store/useStore'

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000'

export function useSocket(cityId = 'delhi_ncr') {
  const wsRef    = useRef(null)
  const retryRef = useRef(null)
  const { demandData, zones } = useStore()

  const handleMessage = useCallback((event) => {
    try {
      const msg = JSON.parse(event.data)
      if (msg.type !== 'demand_update') return

      const store = useStore.getState()
      const newData = {}
      msg.predictions.forEach(p => { newData[p.zone_id] = p.demand })

      // Only update if we got meaningful data
      if (Object.keys(newData).length > 0) {
        useStore.setState(s => ({
          prevDemand: { ...s.demandData },
          demandData: { ...s.demandData, ...newData },
          metrics:    msg.metrics || s.metrics,
        }))
      }
    } catch (e) {
      console.warn('[ws] parse error', e)
    }
  }, [])

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return

    const ws = new WebSocket(`${WS_URL}/ws/demand/${cityId}`)
    wsRef.current = ws

    ws.onopen = () => {
      console.info(`[ws] Connected — ${cityId}`)
      clearTimeout(retryRef.current)
    }

    ws.onmessage = handleMessage

    ws.onerror = () => {
      console.info('[ws] Server offline — using simulation')
    }

    ws.onclose = () => {
      // Retry after 5s — non-blocking
      retryRef.current = setTimeout(connect, 5000)
    }
  }, [cityId, handleMessage])

  useEffect(() => {
    connect()
    return () => {
      clearTimeout(retryRef.current)
      wsRef.current?.close()
    }
  }, [cityId, connect])

  const disconnect = useCallback(() => {
    clearTimeout(retryRef.current)
    wsRef.current?.close()
  }, [])

  return { disconnect }
}
