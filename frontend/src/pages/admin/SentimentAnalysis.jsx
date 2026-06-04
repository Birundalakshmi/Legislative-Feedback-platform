import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'
import { CATEGORY_COLORS } from '../../utils/helpers'

const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function SentimentAnalysis() {
  const navigate = useNavigate()
  const [legislations, setLegislations] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    api.get('/legislations/').then(r => setLegislations(r.data)).finally(() => setLoading(false))
  }, [])

  const filtered = legislations.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.ministry?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Sentiment Analysis" subtitle="Select a consultation to view AI-powered feedback insights" />
        <div className="p-8 max-w-6xl">

          {/* Search */}
          <div className="rounded-2xl p-4 mb-6" style={G}>
            <div className="relative max-w-md">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.30)'}}>🔍</span>
              <input className="input pl-9" placeholder="Search consultations by title or ministry..."
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { icon:'📋', val:legislations.length, label:'Total Consultations', from:'from-amber-500', to:'to-yellow-500' },
              { icon:'🟢', val:legislations.filter(l=>l.status==='Open').length, label:'Open', from:'from-emerald-500', to:'to-teal-500' },
              { icon:'💬', val:legislations.reduce((a,l)=>a+l.comment_count,0), label:'Total Comments', from:'from-amber-600', to:'to-orange-500' },
            ].map(m => (
              <div key={m.label} className="rounded-2xl p-5 relative overflow-hidden" style={G}>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className={`w-9 h-9 bg-gradient-to-br ${m.from} ${m.to} rounded-xl flex items-center justify-center text-lg mb-3 shadow-md`}>{m.icon}</div>
                <div className="text-2xl font-display font-bold text-white">{m.val}</div>
                <div className="text-xs mt-0.5" style={{color:'rgba(245,158,11,0.50)'}}>{m.label}</div>
              </div>
            ))}
          </div>

          {/* List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_,i) => (
                <div key={i} className="rounded-2xl p-5 space-y-2" style={G}>
                  <div className="h-5 shimmer w-2/3" /><div className="h-4 shimmer w-1/3" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20" style={{color:'rgba(245,158,11,0.30)'}}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>📊</div>
              <div className="font-display font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No consultations found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l,i) => {
                const cat = CATEGORY_COLORS[l.category] || CATEGORY_COLORS.Other
                return (
                  <button key={l.id} onClick={() => navigate(`/admin/sentiment/${l.id}`)}
                    className="w-full rounded-2xl overflow-hidden text-left group transition-all duration-200 fade-up"
                    style={{...G, animationDelay:`${i*30}ms`}}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(245,158,11,0.30)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor='rgba(245,158,11,0.12)'}>
                    <div className={`h-0.5 bg-gradient-to-r ${cat.gradient}`} />
                    <div className="p-5 flex items-center gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${cat.badge}`}>{l.category}</span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${l.status==='Open'?'bg-emerald-500/15 text-emerald-400':'bg-slate-500/20 text-slate-400'}`}>{l.status}</span>
                        </div>
                        <h3 className="font-display font-bold text-white group-hover:text-amber-300 transition-colors">{l.title}</h3>
                        <p className="text-sm mt-0.5" style={{color:'rgba(245,158,11,0.35)'}}>{l.ministry}</p>
                      </div>
                      <div className="flex items-center gap-6 shrink-0">
                        <div className="text-center">
                          <div className="font-display font-bold text-white text-lg">{l.comment_count}</div>
                          <div className="text-xs" style={{color:'rgba(245,158,11,0.35)'}}>Comments</div>
                        </div>
                        {l.end_date && (
                          <div className="text-center hidden md:block">
                            <div className="font-bold text-white text-sm">{format(parseISO(l.end_date),'dd MMM yyyy')}</div>
                            <div className="text-xs" style={{color:'rgba(245,158,11,0.35)'}}>Deadline</div>
                          </div>
                        )}
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                          style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)', color:'rgba(245,158,11,0.60)'}}>
                          →
                        </div>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
