import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from '../../store/useStore'
import { AlertTriangle, Info, X, Zap } from 'lucide-react'

const ICONS = {
  warn:   { icon: AlertTriangle, color: '#f0a030', bg: 'rgba(240,160,48,.12)', border: 'rgba(240,160,48,.3)' },
  danger: { icon: Zap,           color: '#f04060', bg: 'rgba(240,64,96,.12)',  border: 'rgba(240,64,96,.3)' },
  info:   { icon: Info,          color: '#3090f0', bg: 'rgba(48,144,240,.12)', border: 'rgba(48,144,240,.3)' },
}

export default function ToastContainer() {
  const { activeToasts, dismissToast } = useStore()

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 pointer-events-none" style={{ minWidth: 320 }}>
      <AnimatePresence>
        {activeToasts.map(t => {
          const cfg = ICONS[t.type] || ICONS.warn
          const Icon = cfg.icon
          return (
            <motion.div key={t.id}
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0,   scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 400, damping: 28 }}
              className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl pointer-events-auto"
              style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, backdropFilter: 'blur(12px)' }}
            >
              <Icon size={14} style={{ color: cfg.color, flexShrink: 0 }} />
              <span className="text-xs text-text flex-1">{t.msg}</span>
              <button onClick={() => dismissToast(t.id)}
                className="text-muted hover:text-text transition-colors flex-shrink-0">
                <X size={12} />
              </button>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
