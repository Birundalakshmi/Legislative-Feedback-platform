import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'
import { getSentimentBadge } from '../../utils/helpers'

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => { api.get('/admin/dashboard').then(r => setData(r.data)).finally(() => setLoading(false)) }, [])

  if (loading) return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.2)', borderTopColor:'#F59E0B'}} />
        <div className="text-sm font-medium" style={{color:'rgba(245,158,11,0.5)'}}>Loading dashboard...</div>
      </div>
    </div>
  )

  const metrics = [
    { icon:'💬', val:data.total_comments, label:'Total Comments', sub:'All time', from:'from-amber-500', to:'to-yellow-500' },
    { icon:'✅', val:`${data.total_comments?Math.round(data.positive/data.total_comments*100):0}%`, sub:`${data.positive} comments`, label:'Positive', from:'from-emerald-500', to:'to-teal-500' },
    { icon:'❌', val:`${data.total_comments?Math.round(data.negative/data.total_comments*100):0}%`, sub:`${data.negative} comments`, label:'Negative', from:'from-red-500', to:'to-rose-500' },
    { icon:'📋', val:data.active_consultations, label:'Active', sub:'Open consultations', from:'from-amber-600', to:'to-orange-500' },
  ]

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Dashboard" subtitle="Overview of all consultations and public feedback" />
        <div className="p-8 max-w-7xl">

          {/* Header actions */}
          <div className="flex items-center justify-end mb-8">
            {data.flagged_provisions?.length > 0 && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>
                🚨 {data.flagged_provisions.length} flagged provision(s)
              </div>
            )}
          </div>

          {/* Metric cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {metrics.map((m,i) => (
              <div key={i} className="rounded-2xl p-5 relative overflow-hidden transition-all" style={{background:'#0F2040', border:'1px solid rgba(245,158,11,0.12)'}}>
                <div className="absolute -bottom-4 -right-4 w-20 h-20 rounded-full" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className={`w-10 h-10 bg-gradient-to-br ${m.from} ${m.to} rounded-xl flex items-center justify-center text-xl mb-3 shadow-md`}>{m.icon}</div>
                <div className="text-2xl font-display font-bold text-white">{m.val}</div>
                <div className="text-sm font-semibold mt-0.5" style={{color:'rgba(245,158,11,0.7)'}}>{m.label}</div>
                <div className="text-xs mt-0.5" style={{color:'rgba(245,158,11,0.35)'}}>{m.sub}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mb-6">
            {/* Active Consultations */}
            <div className="rounded-2xl p-6" style={{background:'#0F2040', border:'1px solid rgba(245,158,11,0.12)'}}>
              <h2 className="font-display font-bold text-white mb-4">Active Consultations</h2>
              {data.active_legislations?.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{color:'rgba(245,158,11,0.30)'}}>No active consultations</div>
              ) : (
                <div className="space-y-3">
                  {data.active_legislations?.map(l => (
                    <div key={l.id} className="rounded-xl p-3.5 transition-all" style={{background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.10)'}}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-white truncate flex-1">{l.title}</span>
                        <div className="flex items-center gap-2 shrink-0 ml-2">
                          {l.days_left !== null && l.days_left <= 3 && (
                            <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{background:'rgba(249,115,22,0.15)', color:'#fb923c', border:'1px solid rgba(249,115,22,0.25)'}}>{l.days_left}d</span>
                          )}
                          <span className="text-xs font-medium" style={{color:'rgba(245,158,11,0.40)'}}>💬 {l.comment_count}</span>
                        </div>
                      </div>
                      <div className="w-full rounded-full h-1.5" style={{background:'rgba(245,158,11,0.08)'}}>
                        <div className="h-1.5 rounded-full transition-all" style={{width:`${l.progress}%`, background:'linear-gradient(90deg,#F59E0B,#D97706)'}} />
                      </div>
                      {l.end_date && <div className="text-[10px] mt-1.5" style={{color:'rgba(245,158,11,0.30)'}}>Ends {format(parseISO(l.end_date),'dd MMM yyyy')}</div>}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent Comments */}
            <div className="rounded-2xl p-6" style={{background:'#0F2040', border:'1px solid rgba(245,158,11,0.12)'}}>
              <h2 className="font-display font-bold text-white mb-4">Recent Comments</h2>
              <div className="space-y-4">
                {data.recent_comments?.map(c => (
                  <div key={c.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow-sm" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>
                      {c.user?.name?.[0]?.toUpperCase()||'?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-bold" style={{color:'rgba(245,158,11,0.7)'}}>{c.user?.name}</span>
                        {getSentimentBadge(c.sentiment)}
                      </div>
                      <div className="text-xs truncate" style={{color:'rgba(255,255,255,0.30)'}}>{c.text}</div>
                      <div className="text-[10px] mt-0.5" style={{color:'rgba(245,158,11,0.25)'}}>{format(parseISO(c.created_at),'dd MMM yyyy')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
