import React from 'react'
import ZoneListPanel from '../components/ZoneList/ZoneListPanel'
import MapView from '../components/Map/MapView'
import TimeOverlay from '../components/Map/TimeOverlay'
import DetailPanel from '../components/Sidebar/DetailPanel'

export default function OverviewPage() {
  return (
    <div className="flex flex-1 overflow-hidden">
      <ZoneListPanel />
      <div className="flex-1 relative overflow-hidden">
        <MapView />
        <TimeOverlay />
      </div>
      <DetailPanel />
    </div>
  )
}
