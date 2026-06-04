import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'
import WordCloud from '../../components/WordCloud'
import { CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = { positive:'#10B981', negative:'#EF4444', neutral:'#64748b' }
const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl px-4 py-3 text-sm" style={{background:'#071020', border:'1px solid rgba(245,158,11,0.20)', boxShadow:'0 8px 24px rgba(0,0,0,0.4)'}}>
      <div className="font-bold mb-1" style={{color:'rgba(245,158,11,0.80)'}}>{label}</div>
      {payload.map((p,i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full" style={{background:p.fill||p.color}} />
          <span style={{color:'rgba(245,158,11,0.50)'}}>{p.name}:</span>
          <span className="font-bold text-white">{p.value}</span>
        </div>
      ))}
    </div>
  )
}

export default function SentimentDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [leg, setLeg] = useState(null)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(`/legislations/${id}`), api.get(`/admin/sentiment/${id}`)])
      .then(([lr,dr]) => { setLeg(lr.data); setData(dr.data) })
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [id])

  const total = data?.total || 1
  const pPct = data ? Math.round((data.positive/total)*100) : 0
  const nPct = data ? Math.round((data.negative/total)*100) : 0
  const nuPct = data ? 100-pPct-nPct : 0
  const pieData = data ? [
    { name:'Positive', value:data.positive, color:COLORS.positive },
    { name:'Negative', value:data.negative, color:COLORS.negative },
    { name:'Neutral',  value:data.neutral,  color:COLORS.neutral  },
  ] : []
  const cat = CATEGORY_COLORS[leg?.category] || CATEGORY_COLORS.Other

  const exportPDF = () => {
    const token = localStorage.getItem('token')
    fetch(`http://localhost:5000/api/admin/export/pdf?legislation_id=${id}`, { headers:{ Authorization:`Bearer ${token}` } })
      .then(r => r.blob())
      .then(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `sentiment-report-${id}.pdf`; a.click() })
  }

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Sentiment Detail" subtitle={leg?.title||'Loading...'} />
        <div className="p-8 max-w-6xl">

          <button onClick={() => navigate('/admin/sentiment')}
            className="flex items-center gap-2 text-sm font-semibold mb-6 transition-colors"
            style={{color:'rgba(245,158,11,0.50)'}}
            onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
            onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.50)'}>
            ← Back to all consultations
          </button>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-3">
              <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.2)', borderTopColor:'#F59E0B'}} />
              <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>Loading analysis...</div>
            </div>
          ) : !data ? (
            <div className="flex flex-col items-center justify-center py-32" style={{color:'rgba(245,158,11,0.30)'}}>
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>💬</div>
              <div className="font-display font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No comments yet</div>
            </div>
          ) : (
            <div className="space-y-5">

              {/* Legislation header */}
              {leg && (
                <div className="rounded-2xl p-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
                  <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cat.badge}`}>{CATEGORY_ICONS[leg.category]} {leg.category}</span>
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${leg.status==='Open'?'bg-emerald-500/15 text-emerald-400':'bg-white/10 text-white/60'}`}>{leg.status}</span>
                    </div>
                    <h2 className="font-display text-2xl font-bold mb-1" style={{color:'#F59E0B'}}>{leg.title}</h2>
                    <p className="text-sm" style={{color:'rgba(245,158,11,0.50)'}}>{leg.ministry}</p>
                  </div>
                </div>
              )}

              {/* AI Summary */}
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className="relative flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shadow-lg shrink-0" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>🤖</div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="font-display font-bold text-white text-lg">AI Summary</div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wide" style={{background:'rgba(245,158,11,0.15)', color:'#F59E0B'}}>AI Generated</span>
                    </div>
                    <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.60)'}}>{data.summary}</p>
                  </div>
                </div>
              </div>

              {/* Flagged */}
              {data.flagged_provisions?.length > 0 && (
                <div className="rounded-2xl px-5 py-4 flex items-start gap-3" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)'}}>
                  <span className="text-2xl shrink-0">🚨</span>
                  <div>
                    <div className="font-bold text-sm mb-1" style={{color:'#f87171'}}>High Negative Sentiment Detected</div>
                    <div className="text-xs" style={{color:'rgba(248,113,113,0.70)'}}>
                      Provisions with &gt;50% negative:{' '}
                      {data.flagged_provisions.map(p => (
                        <span key={p.provision_id} className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold mr-1" style={{background:'rgba(239,68,68,0.15)', color:'#f87171', border:'1px solid rgba(239,68,68,0.25)'}}>§{p.section_number}</span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 5 Metric cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { icon:'💬', val:data.total, label:'Total', sub:'100%', from:'from-amber-500', to:'to-yellow-500' },
                  { icon:'✅', val:data.positive, label:'Positive', sub:`${pPct}%`, from:'from-emerald-500', to:'to-teal-500' },
                  { icon:'❌', val:data.negative, label:'Negative', sub:`${nPct}%`, from:'from-red-500', to:'to-rose-500' },
                  { icon:'➖', val:data.neutral, label:'Neutral', sub:`${nuPct}%`, from:'from-slate-500', to:'to-slate-600' },
                  { icon:'🎯', val:`${Math.round(data.avg_confidence*100)}%`, label:'Avg Confidence', sub:'AI certainty', from:'from-amber-600', to:'to-orange-500' },
                ].map((m,i) => (
                  <div key={i} className="rounded-2xl p-5 relative overflow-hidden" style={G}>
                    <div className="absolute -bottom-4 -right-4 w-16 h-16 rounded-full" style={{background:'rgba(245,158,11,0.04)'}} />
                    <div className={`w-9 h-9 bg-gradient-to-br ${m.from} ${m.to} rounded-xl flex items-center justify-center text-lg mb-3 shadow-md`}>{m.icon}</div>
                    <div className="text-2xl font-display font-bold text-white">{m.val}</div>
                    <div className="text-sm font-semibold" style={{color:'rgba(245,158,11,0.70)'}}>{m.label}</div>
                    <div className="text-xs" style={{color:'rgba(245,158,11,0.35)'}}>{m.sub}</div>
                  </div>
                ))}
              </div>

              {/* Sentiment strip */}
              <div className="rounded-2xl p-5" style={G}>
                <h3 className="font-display font-bold text-white mb-3">Sentiment Distribution</h3>
                <div className="flex rounded-full overflow-hidden h-4 mb-3">
                  {pPct>0 && <div className="bg-emerald-500 flex items-center justify-center" style={{width:`${pPct}%`}}>{pPct>10&&<span className="text-white text-[10px] font-bold">{pPct}%</span>}</div>}
                  {nuPct>0 && <div className="bg-slate-600 flex items-center justify-center" style={{width:`${nuPct}%`}}>{nuPct>10&&<span className="text-white text-[10px] font-bold">{nuPct}%</span>}</div>}
                  {nPct>0 && <div className="bg-red-500 flex items-center justify-center" style={{width:`${nPct}%`}}>{nPct>10&&<span className="text-white text-[10px] font-bold">{nPct}%</span>}</div>}
                </div>
                <div className="flex gap-5 text-xs" style={{color:'rgba(245,158,11,0.50)'}}>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded-full"/>Positive {data.positive} ({pPct}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-600 rounded-full"/>Neutral {data.neutral} ({nuPct}%)</span>
                  <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-500 rounded-full"/>Negative {data.negative} ({nPct}%)</span>
                </div>
              </div>

              {/* Charts */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={G}>
                  <h3 className="font-display font-bold text-white mb-4">Overall Sentiment</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={[{name:'Positive',count:data.positive},{name:'Negative',count:data.negative},{name:'Neutral',count:data.neutral}]} barSize={56}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(245,158,11,0.06)" vertical={false} />
                      <XAxis dataKey="name" tick={{fontSize:13,fontWeight:600,fill:'rgba(245,158,11,0.50)'}} axisLine={false} tickLine={false} />
                      <YAxis tick={{fontSize:12,fill:'rgba(245,158,11,0.30)'}} axisLine={false} tickLine={false} />
                      <Tooltip content={<DarkTooltip />} cursor={{fill:'rgba(245,158,11,0.04)'}} />
                      <Bar dataKey="count" radius={[8,8,0,0]} label={{position:'top',fontSize:12,fontWeight:700,fill:'rgba(245,158,11,0.60)'}}>
                        {[COLORS.positive,COLORS.negative,COLORS.neutral].map((c,i)=><Cell key={i} fill={c} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="rounded-2xl p-5" style={G}>
                  <h3 className="font-display font-bold text-white mb-4">Sentiment Share</h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} label={({name,percent})=>`${Math.round(percent*100)}%`}>
                        {pieData.map((e,i)=><Cell key={i} fill={e.color} />)}
                      </Pie>
                      <Legend iconType="circle" iconSize={8} wrapperStyle={{fontSize:12, color:'rgba(245,158,11,0.50)'}} />
                      <Tooltip content={<DarkTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Top comments */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl p-5" style={{background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.15)'}}>
                  <h3 className="font-display font-bold mb-3 flex items-center gap-2" style={{color:'#34d399'}}>
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(16,185,129,0.15)'}}>🌟</span>
                    Top Positive Comments
                  </h3>
                  {data.top_positive?.length===0 && <div className="text-sm text-center py-4" style={{color:'rgba(16,185,129,0.50)'}}>No positive comments yet.</div>}
                  <div className="space-y-3">
                    {data.top_positive?.map(c => (
                      <div key={c.id} className="rounded-xl p-4" style={{background:'rgba(16,185,129,0.06)', border:'1px solid rgba(16,185,129,0.12)'}}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{c.user?.name}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(16,185,129,0.15)', color:'#34d399'}}>{Math.round(c.confidence*100)}%</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl p-5" style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)'}}>
                  <h3 className="font-display font-bold mb-3 flex items-center gap-2" style={{color:'#f87171'}}>
                    <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(239,68,68,0.15)'}}>⚠️</span>
                    Top Negative Comments
                  </h3>
                  {data.top_negative?.length===0 && <div className="text-sm text-center py-4" style={{color:'rgba(239,68,68,0.50)'}}>No negative comments yet.</div>}
                  <div className="space-y-3">
                    {data.top_negative?.map(c => (
                      <div key={c.id} className="rounded-xl p-4" style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.12)'}}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-bold text-white">{c.user?.name}</span>
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(239,68,68,0.15)', color:'#f87171'}}>{Math.round(c.confidence*100)}%</span>
                        </div>
                        <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.55)'}}>{c.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Word cloud */}
              <div className="rounded-2xl p-5" style={G}>
                <h3 className="font-display font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-8 h-8 rounded-xl flex items-center justify-center" style={{background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.15)'}}>☁️</span>
                  Keyword Word Cloud
                </h3>
                <WordCloud words={data.keywords} />
              </div>

              {/* Export */}
              <div className="flex justify-end pb-4">
                <button onClick={exportPDF} className="btn-secondary text-sm">📄 Export PDF Report</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
