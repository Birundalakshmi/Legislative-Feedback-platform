import { useState, useEffect } from 'react'
import { differenceInDays, parseISO, format } from 'date-fns'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'
import { CATEGORY_ICONS, CATEGORY_COLORS, getStatusBadge, getProgress } from '../../utils/helpers'

const CATEGORIES = ['Technology','Education','Environment','Health','Finance','Agriculture','Infrastructure','Social Welfare','Defence','Other']
const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function Home() {
  const [legislations, setLegislations] = useState([])
  const [myComments, setMyComments] = useState([])
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [status, setStatus] = useState('All')
  const [sort, setSort] = useState('Newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/legislations/'), api.get('/comments/my')])
      .then(([lr, cr]) => { setLegislations(lr.data); setMyComments(cr.data) })
      .finally(() => setLoading(false))
  }, [])

  // Show ALL consultations by default (Open + Closed + Draft)
  const filtered = legislations.filter(l => {
    if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.ministry?.toLowerCase().includes(search.toLowerCase())) return false
    if (category && l.category !== category) return false
    if (status === 'Open') return l.status === 'Open'
    if (status === 'Closed') return l.status === 'Closed'
    if (status === 'Closing Soon') {
      const d = l.end_date ? differenceInDays(parseISO(l.end_date), new Date()) : null
      return l.status === 'Open' && d !== null && d <= 3 && d >= 0
    }
    return true // 'All' — show everything
  }).sort((a, b) => {
    if (sort === 'Newest') return new Date(b.created_at) - new Date(a.created_at)
    if (sort === 'Oldest') return new Date(a.created_at) - new Date(b.created_at)
    if (sort === 'Most Commented') return b.comment_count - a.comment_count
    if (sort === 'By Deadline') return new Date(a.end_date||'9999') - new Date(b.end_date||'9999')
    return 0
  })

  const openCount    = legislations.filter(l => l.status === 'Open').length
  const closingSoon  = legislations.filter(l => {
    const d = l.end_date ? differenceInDays(parseISO(l.end_date), new Date()) : null
    return l.status === 'Open' && d !== null && d <= 3 && d >= 0
  })
  const activeFilters = [search && `"${search}"`, category, status !== 'All' && status].filter(Boolean)

  const stats = [
    { icon:['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2','M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2','M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2','M9 12h6','M9 16h4'],
      val: legislations.length, label:'Total Consultations', from:'from-amber-500', to:'to-yellow-500' },
    { icon:['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'],
      val: openCount, label:'Open Now', from:'from-emerald-500', to:'to-teal-500' },
    { icon:['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'],
      val: myComments.length, label:'My Comments', from:'from-amber-600', to:'to-orange-500' },
    { icon:['M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z','M12 9v4','M12 17h.01'],
      val: closingSoon.length, label:'Closing Soon', from:'from-red-500', to:'to-rose-500' },
  ]

  const SvgIcon = ({ d, size=18 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {d.map((p,i) => <path key={i} d={p} />)}
    </svg>
  )

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="/home" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Dashboard" />
        <div className="p-8 max-w-7xl space-y-6">

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((s, i) => (
              <div key={i} className="rounded-2xl px-5 py-4 flex items-center gap-4" style={{background:'#071020', border:'1px solid rgba(245,158,11,0.10)'}}>
                <div className={`w-10 h-10 bg-gradient-to-br ${s.from} ${s.to} rounded-xl flex items-center justify-center shrink-0`} style={{color:'#071020'}}>
                  <SvgIcon d={s.icon} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{s.val}</div>
                  <div className="text-xs" style={{color:'rgba(245,158,11,0.45)'}}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Closing Soon Alert */}
          {closingSoon.length > 0 && (
            <div className="rounded-2xl px-5 py-3.5 flex items-center gap-3" style={{background:'rgba(249,115,22,0.10)', border:'1px solid rgba(249,115,22,0.20)'}}>
              <span className="text-xl shrink-0">⚠️</span>
              <span className="font-semibold text-sm" style={{color:'rgba(249,115,22,0.9)'}}>
                {closingSoon.length} consultation{closingSoon.length > 1 ? 's are' : ' is'} closing within 3 days — don't miss your chance to participate!
              </span>
            </div>
          )}

          {/* Filters */}
          <div className="rounded-2xl p-4" style={{background:'#071020', border:'1px solid rgba(245,158,11,0.10)'}}>
            <div className="text-xs font-bold uppercase tracking-widest mb-3" style={{color:'rgba(245,158,11,0.40)'}}>All Consultations</div>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.3)'}}>🔍</span>
                <input className="input pl-9" placeholder="Search by title or ministry..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input w-40" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input w-36" value={status} onChange={e => setStatus(e.target.value)}>
                {['All','Open','Closing Soon','Closed'].map(s => <option key={s}>{s}</option>)}
              </select>
              <select className="input w-44" value={sort} onChange={e => setSort(e.target.value)}>
                {['Newest','Oldest','Most Commented','By Deadline'].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3 items-center">
                <span className="text-xs" style={{color:'rgba(245,158,11,0.4)'}}>{filtered.length} results:</span>
                {activeFilters.map(f => (
                  <span key={f} className="pill cursor-pointer" onClick={() => { if (f===`"${search}"`) setSearch(''); else if (f===category) setCategory(''); else setStatus('All') }}>
                    {f} ×
                  </span>
                ))}
                <button onClick={() => { setSearch(''); setCategory(''); setStatus('All') }} className="text-xs font-semibold" style={{color:'rgba(239,68,68,0.7)'}}>Clear all</button>
              </div>
            )}
          </div>

          {/* All Consultations List */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="rounded-2xl p-5 space-y-3" style={G}>
                  <div className="flex gap-3"><div className="h-4 shimmer w-1/4" /><div className="h-4 shimmer w-16" /></div>
                  <div className="h-5 shimmer w-3/4" /><div className="h-3 shimmer w-1/2" /><div className="h-1.5 shimmer w-full" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20" style={{color:'rgba(245,158,11,0.30)'}}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>📋</div>
              <div className="font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No consultations found</div>
              <div className="text-sm mt-1" style={{color:'rgba(245,158,11,0.30)'}}>Try adjusting your filters</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((l, i) => {
                const daysLeft      = l.end_date ? differenceInDays(parseISO(l.end_date), new Date()) : null
                const isClosingSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
                const hasCommented  = myComments.some(c => c.legislation_id === l.id)
                const progress      = getProgress(l)
                const cat           = CATEGORY_COLORS[l.category] || CATEGORY_COLORS.Other

                return (
                  <div key={l.id}
                    className="rounded-2xl overflow-hidden transition-all duration-300 fade-up"
                    style={{...G, animationDelay:`${i*40}ms`, borderColor: isClosingSoon ? 'rgba(249,115,22,0.25)' : 'rgba(245,158,11,0.12)'}}
                    onMouseEnter={e => e.currentTarget.style.borderColor='rgba(245,158,11,0.30)'}
                    onMouseLeave={e => e.currentTarget.style.borderColor=isClosingSoon?'rgba(249,115,22,0.25)':'rgba(245,158,11,0.12)'}>
                    <div className={`h-0.5 bg-gradient-to-r ${cat.gradient}`} />
                    <div className="p-5">
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 bg-gradient-to-br ${cat.gradient} rounded-xl flex items-center justify-center text-xl shrink-0 shadow-md`}>
                          {CATEGORY_ICONS[l.category] || '📄'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${cat.badge}`}>{l.category}</span>
                            {getStatusBadge(l)}
                          </div>
                          <h3 className="font-bold mb-1 leading-snug" style={{color:'rgba(245,158,11,0.85)'}}>{l.title}</h3>
                          <p className="text-sm" style={{color:'rgba(245,158,11,0.35)'}}>{l.ministry}</p>
                          {l.status === 'Open' && l.end_date && (
                            <div className="mt-3">
                              <div className="flex justify-between text-xs mb-1">
                                <span style={{color:'rgba(245,158,11,0.35)'}}>Progress</span>
                                <span className={`font-semibold ${isClosingSoon?'text-orange-400':''}`} style={!isClosingSoon?{color:'rgba(245,158,11,0.50)'}:{}}>
                                  {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : 'Ended'}
                                </span>
                              </div>
                              <div className="w-full rounded-full h-1.5" style={{background:'rgba(245,158,11,0.08)'}}>
                                <div className={`h-1.5 rounded-full bg-gradient-to-r transition-all ${isClosingSoon?'from-orange-400 to-amber-500':cat.gradient}`}
                                  style={{width:`${progress}%`}} />
                              </div>
                            </div>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>
                            <span>💬 {l.comment_count}</span>
                            {l.end_date && <span>📅 {format(parseISO(l.end_date),'dd MMM yyyy')}</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2.5 shrink-0">
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                            style={hasCommented
                              ? {background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}
                              : {background:'rgba(245,158,11,0.08)', color:'rgba(245,158,11,0.60)', border:'1px solid rgba(245,158,11,0.15)'}}>
                            {hasCommented ? '✓ Commented' : '○ Pending'}
                          </span>
                          <Link to={`/legislation/${l.id}`}
                            className={`text-xs font-bold px-4 py-2 rounded-xl text-white bg-gradient-to-r ${l.status==='Open'?cat.gradient:'from-slate-600 to-slate-700'} shadow-sm hover:-translate-y-0.5 transition-all`}>
                            {l.status==='Open' ? 'Comment →' : 'View →'}
                          </Link>
                        </div>
                      </div>
                    </div>
                    {isClosingSoon && (
                      <div className="px-5 py-2.5 flex items-center gap-2" style={{background:'rgba(249,115,22,0.08)', borderTop:'1px solid rgba(249,115,22,0.15)'}}>
                        <span className="animate-pulse">⚠️</span>
                        <span className="text-xs font-semibold" style={{color:'rgba(249,115,22,0.80)'}}>Closing in {daysLeft} day{daysLeft!==1?'s':''} — submit your feedback now!</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
