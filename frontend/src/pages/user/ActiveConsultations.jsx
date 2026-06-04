import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { differenceInDays, parseISO, format } from 'date-fns'
import api from '../../api/axios'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'
import { CATEGORY_ICONS, CATEGORY_COLORS, getStatusBadge, getProgress } from '../../utils/helpers'

const CATEGORIES = ['Technology','Education','Environment','Health','Finance','Agriculture','Infrastructure','Social Welfare','Defence','Other']
const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function ActiveConsultations() {
  const [legs, setLegs] = useState([])
  const [myComments, setMyComments] = useState([])
  const [tab, setTab] = useState('all')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [sort, setSort] = useState('Newest')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get('/legislations/'), api.get('/comments/my')])
      .then(([lr,cr]) => { setLegs(lr.data); setMyComments(cr.data) })
      .finally(() => setLoading(false))
  }, [])

  const commentedIds = new Set(myComments.map(c => c.legislation_id))
  const openLegs = legs.filter(l => l.status === 'Open')
  const closedLegs = legs.filter(l => l.status === 'Closed')
  const displayed = (tab === 'open' ? openLegs : tab === 'closed' ? closedLegs : legs)
    .filter(l => {
      if (search && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.ministry?.toLowerCase().includes(search.toLowerCase())) return false
      if (category && l.category !== category) return false
      return true
    })
    .sort((a,b) => sort === 'Newest' ? new Date(b.created_at)-new Date(a.created_at) : new Date(a.created_at)-new Date(b.created_at))

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="/active" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Consultations" subtitle={`${openLegs.length} open · ${closedLegs.length} closed`} />
        <div className="p-8 max-w-5xl">

          {/* Tabs */}
          <div className="rounded-2xl p-1.5 flex gap-1 mb-5 w-fit" style={G}>
            {[
              { key:'all',    label:'All',    count:legs.length },
              { key:'open',   label:'Open',   count:openLegs.length },
              { key:'closed', label:'Closed', count:closedLegs.length },
            ].map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all"
                style={tab === t.key
                  ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}
                  : {color:'rgba(245,158,11,0.50)'}}>
                {t.label}
                <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                  style={tab === t.key ? {background:'rgba(7,16,32,0.20)'} : {background:'rgba(245,158,11,0.08)', color:'rgba(245,158,11,0.50)'}}>
                  {t.count}
                </span>
              </button>
            ))}
          </div>

          {/* Filters */}
          <div className="rounded-2xl p-4 mb-5" style={G}>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-48">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.30)'}}>🔍</span>
                <input className="input pl-9" placeholder="Search by title or ministry..." value={search} onChange={e => setSearch(e.target.value)} />
              </div>
              <select className="input w-40" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
              <select className="input w-32" value={sort} onChange={e => setSort(e.target.value)}>
                <option>Newest</option><option>Oldest</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="rounded-2xl p-5 space-y-3" style={G}>
                  <div className="flex gap-3"><div className="h-4 shimmer w-1/4" /><div className="h-4 shimmer w-16" /></div>
                  <div className="h-5 shimmer w-3/4" /><div className="h-3 shimmer w-1/2" /><div className="h-1.5 shimmer w-full" />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>📋</div>
              <div className="font-display font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No consultations found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {displayed.map((l,i) => {
                const daysLeft = l.end_date ? differenceInDays(parseISO(l.end_date), new Date()) : null
                const isClosingSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0
                const hasCommented = commentedIds.has(l.id)
                const progress = getProgress(l)
                const cat = CATEGORY_COLORS[l.category] || CATEGORY_COLORS.Other

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
                          <h3 className="font-display font-bold mb-1 leading-snug" style={{color:'rgba(245,158,11,0.85)'}}>{l.title}</h3>
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
                            {l.status==='Open'?'Comment →':'View →'}
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
