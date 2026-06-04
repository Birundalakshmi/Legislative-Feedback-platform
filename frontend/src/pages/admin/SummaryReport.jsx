import { useState, useEffect } from 'react'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'
import { CATEGORY_ICONS, CATEGORY_BADGE_COLORS } from '../../utils/helpers'

const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function SummaryReport() {
  const [legislations, setLegislations] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  useEffect(() => {
    api.get('/legislations/').then(r => {
      setLegislations(r.data)
      if (r.data.length > 0) setSelectedId(String(r.data[0].id))
    })
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoading(true)
    api.get(`/admin/report/${selectedId}`).then(r => setData(r.data)).catch(() => setData(null)).finally(() => setLoading(false))
  }, [selectedId])

  const regenerate = () => {
    setRegenerating(true)
    api.get(`/admin/report/${selectedId}`).then(r => setData(r.data)).finally(() => setRegenerating(false))
  }

  const exportPDF = () => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/admin/export/pdf?legislation_id=${selectedId}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'summary-report.pdf'; a.click() })
  }

  const total = data?.total || 1
  const pPct = data ? Math.round((data.positive/total)*100) : 0
  const nPct = data ? Math.round((data.negative/total)*100) : 0
  const nuPct = data ? 100-pPct-nPct : 0

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Summary Report" subtitle="AI-generated consultation insights" />
        <div className="p-8 max-w-6xl">

          {/* Controls */}
          <div className="flex items-center justify-between mb-8">
            <div />
            <div className="flex items-center gap-3">
              <select className="input w-64 text-sm" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                {legislations.map(l => <option key={l.id} value={l.id}>{l.title.slice(0,42)}...</option>)}
              </select>
              <button onClick={regenerate} disabled={regenerating} className="btn-secondary text-sm flex items-center gap-2">
                <svg className={`w-4 h-4 ${regenerating?'animate-spin':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Regenerate
              </button>
              <button onClick={exportPDF} className="btn-primary text-sm px-4 py-2">📄 Export PDF</button>
            </div>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center py-24 gap-3">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.2)', borderTopColor:'#F59E0B'}} />
              <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>Generating report...</div>
            </div>
          )}

          {!loading && data && (
            <div className="space-y-5">

              {/* Legislation info */}
              <div className="rounded-2xl p-7 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
                <div className="absolute top-0 right-0 w-56 h-56 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${CATEGORY_BADGE_COLORS[data.legislation.category]||'bg-white/10 text-white border-white/20'}`}>
                      {CATEGORY_ICONS[data.legislation.category]} {data.legislation.category}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${data.legislation.status==='Open'?'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25':'bg-white/10 text-white/60'}`}>
                      {data.legislation.status==='Open'?'● Open':'● Closed'}
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold mb-1" style={{color:'#F59E0B'}}>{data.legislation.title}</h2>
                  <p className="text-sm" style={{color:'rgba(245,158,11,0.50)'}}>{data.legislation.ministry}</p>
                  {data.legislation.description && <p className="text-sm mt-2 line-clamp-2" style={{color:'rgba(245,158,11,0.35)'}}>{data.legislation.description}</p>}
                </div>
              </div>

              {/* 4 Stat cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { icon:'💬', val:data.total, pct:'100%', label:'Total Comments', from:'from-amber-500', to:'to-yellow-500' },
                  { icon:'✅', val:data.positive, pct:`${pPct}%`, label:'Positive', from:'from-emerald-500', to:'to-teal-500' },
                  { icon:'❌', val:data.negative, pct:`${nPct}%`, label:'Negative', from:'from-red-500', to:'to-rose-500' },
                  { icon:'➖', val:data.neutral, pct:`${nuPct}%`, label:'Neutral', from:'from-slate-500', to:'to-slate-600' },
                ].map((m,i) => (
                  <div key={i} className="rounded-2xl p-5 relative overflow-hidden" style={G}>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full" style={{background:'rgba(245,158,11,0.04)'}} />
                    <div className={`w-9 h-9 bg-gradient-to-br ${m.from} ${m.to} rounded-xl flex items-center justify-center text-lg mb-3 shadow-md`}>{m.icon}</div>
                    <div className="text-2xl font-display font-bold text-white">{m.val}</div>
                    <div className="text-xs" style={{color:'rgba(245,158,11,0.40)'}}>{m.pct} of total</div>
                    <div className="text-sm font-semibold mt-0.5" style={{color:'rgba(245,158,11,0.70)'}}>{m.label}</div>
                  </div>
                ))}
              </div>

              {/* Sentiment strip */}
              <div className="rounded-2xl p-6" style={G}>
                <h2 className="font-display font-bold text-white mb-4">Sentiment Distribution</h2>
                <div className="flex rounded-full overflow-hidden h-4 mb-3">
                  {pPct>0 && <div className="bg-emerald-500 flex items-center justify-center" style={{width:`${pPct}%`}}>{pPct>10&&<span className="text-white text-[10px] font-bold">{pPct}%</span>}</div>}
                  {nuPct>0 && <div className="bg-slate-600 flex items-center justify-center" style={{width:`${nuPct}%`}}>{nuPct>10&&<span className="text-white text-[10px] font-bold">{nuPct}%</span>}</div>}
                  {nPct>0 && <div className="bg-red-500 flex items-center justify-center" style={{width:`${nPct}%`}}>{nPct>10&&<span className="text-white text-[10px] font-bold">{nPct}%</span>}</div>}
                </div>
                <div className="flex gap-5 text-xs" style={{color:'rgba(245,158,11,0.50)'}}>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full"/>Positive {pPct}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-600 rounded-full"/>Neutral {nuPct}%</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full"/>Negative {nPct}%</span>
                </div>
              </div>

              {/* AI Summary */}
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className="relative flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>🤖</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="font-display font-bold text-white">AI Summary</div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide" style={{background:'rgba(245,158,11,0.15)', color:'#F59E0B'}}>AI Generated</span>
                    </div>
                    {data.summary ? (
                      <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.60)'}}>{data.summary}</p>
                    ) : (
                      <div>
                        <p className="text-sm mb-4" style={{color:'rgba(245,158,11,0.35)'}}>No summary generated yet.</p>
                        <button onClick={regenerate} className="btn-primary text-sm">Generate AI Summary</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Provision breakdown */}
              <div className="rounded-2xl p-6" style={G}>
                <h2 className="font-display font-bold text-white mb-5">Provision-wise Breakdown</h2>
                {data.provisions?.length===0 && <div className="text-center py-8 text-sm" style={{color:'rgba(245,158,11,0.30)'}}>No provisions found.</div>}
                <div className="space-y-4">
                  {data.provisions?.map((p,i) => {
                    const pt = p.total||1
                    const ppPct = Math.round((p.positive/pt)*100)
                    const pnPct = Math.round((p.negative/pt)*100)
                    const pnuPct = 100-ppPct-pnPct
                    return (
                      <div key={i} className="rounded-2xl p-5 transition-all"
                        style={p.high_negative
                          ? {background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.20)'}
                          : {background:'rgba(245,158,11,0.03)', border:'1px solid rgba(245,158,11,0.08)'}}>
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg"
                              style={p.high_negative
                                ? {background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)'}
                                : {background:'rgba(245,158,11,0.10)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.20)'}}>
                              §{p.section_number}
                            </span>
                            <span className="font-semibold text-sm text-white">{p.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            {p.high_negative && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)'}}>🚨 High Negative</span>}
                            {p.mostly_positive && <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{background:'rgba(16,185,129,0.15)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}}>✅ Mostly Positive</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-5 text-xs mb-3">
                          <span className="flex items-center gap-1.5 font-semibold" style={{color:'#34d399'}}><span className="w-2 h-2 bg-emerald-500 rounded-full"/>{p.positive} positive</span>
                          <span className="flex items-center gap-1.5 font-semibold" style={{color:'#f87171'}}><span className="w-2 h-2 bg-red-500 rounded-full"/>{p.negative} negative</span>
                          <span className="flex items-center gap-1.5 font-semibold" style={{color:'rgba(245,158,11,0.50)'}}><span className="w-2 h-2 bg-slate-600 rounded-full"/>{p.neutral} neutral</span>
                          <span className="ml-auto" style={{color:'rgba(245,158,11,0.30)'}}>Total: {p.total}</span>
                        </div>
                        {p.total>0 && (
                          <div className="flex rounded-full overflow-hidden h-2">
                            {ppPct>0 && <div className="bg-emerald-500 transition-all" style={{width:`${ppPct}%`}} />}
                            {pnuPct>0 && <div className="bg-slate-600 transition-all" style={{width:`${pnuPct}%`}} />}
                            {pnPct>0 && <div className="bg-red-500 transition-all" style={{width:`${pnPct}%`}} />}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}

          {!loading && !data && selectedId && (
            <div className="flex flex-col items-center justify-center py-24" style={{color:'rgba(245,158,11,0.30)'}}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>📋</div>
              <div className="font-display font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No data available</div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
