import React, { useState, useCallback } from 'react'
import { parseData, buildStationStats, buildFlowPairs } from './utils/parser'
import Header from './components/Header'
import TabBar from './components/TabBar'
import Dashboard from './components/Dashboard'
import MZLayout from './components/MZLayout'

const TABS = [
  { id: 'dashboard', label: '📊 Dashboard' },
  { id: 'mz',        label: '🏭 Manuálna zóna' },
]

export default function App() {
  const [tab, setTab]               = useState('dashboard')
  const [allData, setAllData]       = useState([])
  const [stStats, setStStats]       = useState([])
  const [flowData, setFlowData]     = useState({ pairs: {}, kltStations: {} })
  const [parseStatus, setParseStatus] = useState({ msg: '', ok: true })

  const handleParse = useCallback((raw) => {
    const { records, skipped } = parseData(raw)
    if (!records.length) {
      setParseStatus({ msg: '❌ Žiadne platné záznamy. Skopírujte priamo z Excelu (tab-oddelené).', ok: false })
      return
    }
    setAllData(records)
    setStStats(buildStationStats(records))
    setFlowData(buildFlowPairs(records))
    setParseStatus({ msg: `✓ Načítaných ${records.length.toLocaleString('sk')} záznamov${skipped ? ` · preskočených: ${skipped}` : ''}`, ok: true })
  }, [])

  const handleClear = useCallback(() => {
    setAllData([])
    setStStats([])
    setFlowData({ pairs: {}, kltStations: {} })
    setParseStatus({ msg: '', ok: true })
  }, [])

  return (
    <>
      <Header recordCount={allData.length} />
      <TabBar tabs={TABS} active={tab} onChange={setTab} />

      {tab === 'dashboard' && (
        <Dashboard
          allData={allData}
          stStats={stStats}
          flowData={flowData}
          parseStatus={parseStatus}
          onParse={handleParse}
          onClear={handleClear}
        />
      )}
      {tab === 'mz' && (
        <MZLayout allData={allData} stStats={stStats} />
      )}
    </>
  )
}
