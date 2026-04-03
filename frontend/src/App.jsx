import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStore } from './store/useStore'
import Header from './components/Header/Header'
import Toolbar from './components/Header/Toolbar'
import ToastContainer from './components/Alerts/ToastContainer'
import OverviewPage from './pages/OverviewPage'
import ZonePage from './pages/ZonePage'
import ModelPage from './pages/ModelPage'
import CitiesPage from './pages/CitiesPage'

const PAGE_MAP = {
  overview: OverviewPage,
  zone:     ZonePage,
  model:    ModelPage,
  cities:   CitiesPage,
}

export default function App() {
  const { activeTab, tick, isLive } = useStore()

  // Simulation ticker
  useEffect(() => {
    const id = setInterval(() => {
      if (isLive) tick()
    }, 2200)
    return () => clearInterval(id)
  }, [isLive])

  const Page = PAGE_MAP[activeTab] || OverviewPage

  return (
    <div className="flex flex-col h-full bg-bg overflow-hidden">
      <Header />
      <Toolbar />
      <div className="flex-1 flex overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex flex-1 overflow-hidden"
          >
            <Page />
          </motion.div>
        </AnimatePresence>
      </div>
      <ToastContainer />
    </div>
  )
}
