import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { format, parseISO } from 'date-fns'
import api from '../../api/axios'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'
import { getSentimentBadge } from '../../utils/helpers'
import SentimentStrip from '../../components/SentimentStrip'

const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function MyComments() {
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(new Set())
  const [filter, setFilter] = useState('all')

  useEffect(() => { api.get('/comments/my').then(r => setComments(r.data)).finally(() => setLoading(false)) }, [])

  const stats = {
    total: comments.length,
    participated: new Set(comments.map(c => c.legislation_id)).size,
    positive: comments.filter(c => c.sentiment === 'positive').length,
    negative: comments.filter(c => c.sentiment === 'negative').length,
    neutral: comments.filter(c => c.sentiment === 'neutral').length,
  }
  const filtered = filter === 'all' ? comments : comments.filter(c => c.sentiment === filter)
  const toggleExpand = id => setExpanded(prev => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s })

  const FILTERS = [
    { key:'all', label:'All', count:stats.total },
    { key:'positive', label:'Positive', count:stats.positive },
    { key:'negative', label:'Negative', count:stats.negative },
    { key:'neutral', label:'Neutral', count:stats.neutral },
  ]

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="/my-comments" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="My Comments" subtitle="Track all your submitted feedback" />
        <div className="p-8 max-w-5xl">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { icon:'💬', val:stats.total, label:'Total Comments', from:'from-amber-500', to:'to-yellow-500' },
              { icon:'📋', val:stats.participated, label:'Consultations', from:'from-amber-600', to:'to-orange-500' },
              { icon:'✅', val:stats.positive, label:'Positive', from:'from-emerald-500', to:'to-teal-500' },
              { icon:'❌', val:stats.negative, label:'Negative', from:'from-red-500', to:'to-rose-500' },
            ].map(({ icon, val, label, from, to }) => (
              <div key={label} className="rounded-2xl p-5 relative overflow-hidden" style={G}>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className={`w-9 h-9 bg-gradient-to-br ${from} ${to} rounded-xl flex items-center justify-center text-lg mb-3 shadow-md`}>{icon}</div>
                <div className="text-2xl font-display font-bold text-white">{val}</div>
                <div className="text-xs mt-0.5" style={{color:'rgba(245,158,11,0.50)'}}>{label}</div>
              </div>
            ))}
          </div>

          {stats.total > 0 && (
            <div className="rounded-2xl p-5 mb-5" style={G}>
              <div className="font-display font-bold text-sm mb-3" style={{color:'rgba(245,158,11,0.70)'}}>Sentiment Mix</div>
              <SentimentStrip positive={stats.positive} negative={stats.negative} neutral={stats.neutral} />
            </div>
          )}

          {/* Filter tabs */}
          {stats.total > 0 && (
            <div className="rounded-2xl p-1.5 flex gap-1 mb-5 w-fit" style={G}>
              {FILTERS.map(f => (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                  style={filter === f.key
                    ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}
                    : {color:'rgba(245,158,11,0.50)'}}>
                  {f.label}
                  <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                    style={filter === f.key ? {background:'rgba(7,16,32,0.20)'} : {background:'rgba(245,158,11,0.08)', color:'rgba(245,158,11,0.50)'}}>
                    {f.count}
                  </span>
                </button>
              ))}
            </div>
          )}

          {loading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_,i) => (
                <div key={i} className="rounded-2xl p-5 space-y-3" style={G}>
                  <div className="h-4 shimmer w-2/3" /><div className="h-3 shimmer w-full" /><div className="h-3 shimmer w-4/5" />
                </div>
              ))}
            </div>
          ) : comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>💬</div>
              <div className="font-display font-bold text-lg mb-2" style={{color:'rgba(245,158,11,0.50)'}}>No comments yet</div>
              <div className="text-sm mb-6" style={{color:'rgba(245,158,11,0.30)'}}>Start participating in consultations</div>
              <Link to="/home" className="btn-primary px-6 py-2.5">Browse Consultations →</Link>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16" style={{color:'rgba(245,158,11,0.30)'}}>
              <div className="text-3xl mb-3">🔍</div>
              <div className="font-semibold" style={{color:'rgba(245,158,11,0.40)'}}>No {filter} comments found</div>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((c,i) => (
                <div key={c.id} className="rounded-2xl overflow-hidden transition-all duration-200 fade-up"
                  style={{...G, animationDelay:`${i*40}ms`}}>
                  <div className={`h-0.5 ${c.sentiment==='positive'?'bg-emerald-500':c.sentiment==='negative'?'bg-red-500':'bg-slate-600'}`} />
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <Link to={`/legislation/${c.legislation_id}`}
                          className="font-display font-bold text-sm leading-snug block truncate transition-colors"
                          style={{color:'rgba(245,158,11,0.80)'}}
                          onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
                          onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.80)'}>
                          {c.legislation_title}
                        </Link>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          <span className="text-xs px-2 py-0.5 rounded-full font-semibold"
                            style={c.legislation_status==='Open'
                              ? {background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}
                              : {background:'rgba(100,116,139,0.15)', color:'#94a3b8', border:'1px solid rgba(100,116,139,0.25)'}}>
                            {c.legislation_status==='Open'?'● Open':'● Closed'}
                          </span>
                          {c.provision && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{background:'rgba(245,158,11,0.06)', color:'rgba(245,158,11,0.40)', border:'1px solid rgba(245,158,11,0.10)'}}>
                              §{c.provision.section_number}: {c.provision.title}
                            </span>
                          )}
                        </div>
                      </div>
                      {getSentimentBadge(c.sentiment, c.confidence)}
                    </div>

                    <div className="rounded-xl p-3 text-sm leading-relaxed" style={{background:'rgba(245,158,11,0.03)', border:'1px solid rgba(245,158,11,0.08)', color:'rgba(255,255,255,0.55)'}}>
                      {c.text.length > 200 && !expanded.has(c.id) ? (
                        <>{c.text.slice(0,200)}<span style={{color:'rgba(245,158,11,0.30)'}}>...</span>
                          <button onClick={() => toggleExpand(c.id)} className="text-xs font-bold ml-1 transition-colors" style={{color:'rgba(245,158,11,0.60)'}}>View full</button>
                        </>
                      ) : (
                        <>{c.text}
                          {c.text.length > 200 && <button onClick={() => toggleExpand(c.id)} className="text-xs font-bold ml-1" style={{color:'rgba(245,158,11,0.60)'}}>Show less</button>}
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-4 mt-3 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>
                      <span>📅 {format(parseISO(c.created_at),'dd MMM yyyy')}</span>
                      <span>🎯 {Math.round(c.confidence*100)}% confidence</span>
                      <span className="ml-auto font-semibold" style={{color:'rgba(16,185,129,0.70)'}}>✓ Submitted</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
