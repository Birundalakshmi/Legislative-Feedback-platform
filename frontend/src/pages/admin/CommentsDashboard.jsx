import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'
import { getSentimentBadge } from '../../utils/helpers'

const ROLES = ['individual','legal','industry','ngo','academic']

const goldBorder = { border:'1px solid rgba(245,158,11,0.12)' }
const goldBorderHover = 'rgba(245,158,11,0.25)'

export default function CommentsDashboard() {
  const [legislations, setLegislations] = useState([])
  const [comments, setComments] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [filters, setFilters] = useState({ legislation_id:'', sentiment:'', role:'', search:'', from_date:'', to_date:'' })
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState(null)

  useEffect(() => { api.get('/legislations/').then(r => setLegislations(r.data)) }, [])
  useEffect(() => { fetchComments() }, [page, filters])

  const fetchComments = async () => {
    setLoading(true)
    try {
      const params = { page, ...Object.fromEntries(Object.entries(filters).filter(([,v]) => v)) }
      const r = await api.get('/admin/comments', { params })
      setComments(r.data.comments); setTotal(r.data.total); setPages(r.data.pages)
    } finally { setLoading(false) }
  }

  const setFilter = (k,v) => { setFilters(f => ({...f,[k]:v})); setPage(1) }
  const clearFilters = () => { setFilters({ legislation_id:'', sentiment:'', role:'', search:'', from_date:'', to_date:'' }); setPage(1) }

  const exportFile = async (type) => {
    const params = Object.fromEntries(Object.entries(filters).filter(([,v]) => v))
    try {
      const r = await api.get(`/admin/export/${type}`, { params, responseType:'blob' })
      const a = document.createElement('a')
      a.href = URL.createObjectURL(new Blob([r.data]))
      a.download = `comments.${type === 'excel' ? 'xlsx' : 'pdf'}`
      document.body.appendChild(a); a.click(); document.body.removeChild(a)
      URL.revokeObjectURL(a.href)
    } catch (err) { alert(`Download failed: ${err.message}`) }
  }

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Comments Dashboard" subtitle={`${total} total comments`} />
        <div className="p-8 max-w-7xl">

          <div className="flex items-center justify-between mb-6">
            <div />
            <div className="flex gap-2">
              <button onClick={() => exportFile('excel')}
                className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                style={{background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.25)', color:'#34d399'}}>📊 Excel</button>
              <button onClick={() => exportFile('pdf')}
                className="text-sm font-semibold px-4 py-2.5 rounded-xl transition-all"
                style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)', color:'#f87171'}}>📄 PDF</button>
            </div>
          </div>

          {/* Filters */}
          <div className="rounded-2xl p-5 mb-6" style={{background:'#0F2040', ...goldBorder}}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
              <select className="input text-sm" value={filters.legislation_id} onChange={e => setFilter('legislation_id', e.target.value)}>
                <option value="">All Legislations</option>
                {legislations.map(l => <option key={l.id} value={l.id}>{l.title.slice(0,35)}...</option>)}
              </select>
              <select className="input text-sm" value={filters.sentiment} onChange={e => setFilter('sentiment', e.target.value)}>
                <option value="">All Sentiments</option>
                {['positive','negative','neutral'].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select className="input text-sm" value={filters.role} onChange={e => setFilter('role', e.target.value)}>
                <option value="">All Roles</option>
                {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <input className="input text-sm" placeholder="🔍 Search comments..." value={filters.search} onChange={e => setFilter('search', e.target.value)} />
            </div>
            <div className="flex gap-3 items-center">
              <input className="input text-sm w-40" type="date" value={filters.from_date} onChange={e => setFilter('from_date', e.target.value)} />
              <span className="text-sm" style={{color:'rgba(245,158,11,0.3)'}}>to</span>
              <input className="input text-sm w-40" type="date" value={filters.to_date} onChange={e => setFilter('to_date', e.target.value)} />
              <button onClick={clearFilters} className="text-sm font-medium ml-auto" style={{color:'rgba(239,68,68,0.7)'}}>Clear all</button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl overflow-hidden" style={{background:'#0F2040', ...goldBorder}}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(245,158,11,0.10)', background:'rgba(245,158,11,0.04)'}}>
                    {['#','Stakeholder','Comment','Provision','Sentiment','Confidence','Date',''].map(h => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide" style={{color:'rgba(245,158,11,0.5)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.2)', borderTopColor:'#F59E0B'}} />
                        <span className="text-sm" style={{color:'rgba(245,158,11,0.4)'}}>Loading...</span>
                      </div>
                    </td></tr>
                  ) : comments.length === 0 ? (
                    <tr><td colSpan={8} className="text-center py-16">
                      <div className="flex flex-col items-center gap-2">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>💬</div>
                        <span className="text-sm" style={{color:'rgba(245,158,11,0.4)'}}>No comments found</span>
                      </div>
                    </td></tr>
                  ) : comments.map((c,i) => (
                    <tr key={c.id} className="group transition-colors" style={{borderBottom:'1px solid rgba(245,158,11,0.06)'}}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(245,158,11,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                      <td className="px-4 py-3.5 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>{(page-1)*10+i+1}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>
                            {c.user?.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-xs text-white">{c.user?.name}</div>
                            <div className="text-[10px] capitalize" style={{color:'rgba(245,158,11,0.40)'}}>{c.user?.stakeholder_type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 max-w-xs"><div className="truncate text-xs" style={{color:'rgba(255,255,255,0.50)'}}>{c.text}</div></td>
                      <td className="px-4 py-3.5">
                        <span className="text-xs px-2 py-1 rounded-lg font-medium" style={{background:'rgba(245,158,11,0.08)', color:'rgba(245,158,11,0.6)', border:'1px solid rgba(245,158,11,0.12)'}}>
                          {c.provision ? `§${c.provision.section_number}` : 'General'}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">{getSentimentBadge(c.sentiment)}</td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <div className="w-14 rounded-full h-1.5" style={{background:'rgba(245,158,11,0.08)'}}>
                            <div className="h-1.5 rounded-full" style={{width:`${c.confidence*100}%`, background:'linear-gradient(90deg,#F59E0B,#D97706)'}} />
                          </div>
                          <span className="text-[10px]" style={{color:'rgba(245,158,11,0.40)'}}>{Math.round(c.confidence*100)}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>{format(parseISO(c.created_at),'dd MMM yy')}</td>
                      <td className="px-4 py-3.5">
                        <button onClick={() => setModal(c)}
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-sm transition-all"
                          style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)', color:'rgba(245,158,11,0.6)'}}>👁️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3.5" style={{borderTop:'1px solid rgba(245,158,11,0.08)', background:'rgba(245,158,11,0.02)'}}>
              <span className="text-xs" style={{color:'rgba(245,158,11,0.40)'}}>Showing {Math.min((page-1)*10+1,total)}–{Math.min(page*10,total)} of {total}</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p=>p-1)} disabled={page===1} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">←</button>
                {Array.from({length:Math.min(5,pages)},(_,i) => {
                  const p = Math.max(1,page-2)+i
                  if (p>pages) return null
                  return <button key={p} onClick={()=>setPage(p)}
                    className="w-8 h-8 rounded-xl text-xs font-semibold transition-all"
                    style={p===page ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'} : {background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.12)', color:'rgba(245,158,11,0.6)'}}>
                    {p}
                  </button>
                })}
                <button onClick={() => setPage(p=>p+1)} disabled={page===pages} className="btn-secondary text-xs py-1.5 px-3 disabled:opacity-40">→</button>
              </div>
            </div>
          </div>

          {/* Modal */}
          {modal && (
            <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50 p-4" style={{background:'rgba(7,16,32,0.80)'}} onClick={() => setModal(null)}>
              <div className="rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden fade-in" style={{background:'#0F2040', border:'1px solid rgba(245,158,11,0.20)'}} onClick={e => e.stopPropagation()}>
                <div className="p-5 flex items-center justify-between" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
                  <div className="font-bold" style={{color:'#071020'}}>Comment Detail</div>
                  <button onClick={() => setModal(null)} className="text-2xl leading-none" style={{color:'rgba(7,16,32,0.6)'}}>×</button>
                </div>
                <div className="p-6 space-y-3 text-sm">
                  <div className="grid grid-cols-2 gap-3">
                    {[['User',modal.user?.name],['Role',modal.user?.stakeholder_type],['Date',format(parseISO(modal.created_at),'dd MMM yyyy, HH:mm')],['Provision',modal.provision?`§${modal.provision.section_number}`:'General']].map(([label,val])=>(
                      <div key={label}>
                        <span className="text-xs font-bold uppercase" style={{color:'rgba(245,158,11,0.40)'}}>{label}</span>
                        <div className="mt-1 font-medium text-white capitalize">{val}</div>
                      </div>
                    ))}
                  </div>
                  <div><span className="text-xs font-bold uppercase" style={{color:'rgba(245,158,11,0.40)'}}>Sentiment</span><div className="mt-1">{getSentimentBadge(modal.sentiment, modal.confidence)}</div></div>
                  <div>
                    <span className="text-xs font-bold uppercase" style={{color:'rgba(245,158,11,0.40)'}}>Comment</span>
                    <p className="mt-1 text-white/70 rounded-xl p-3 leading-relaxed" style={{background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.08)'}}>{modal.text}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
