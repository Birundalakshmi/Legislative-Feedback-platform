import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { format, parseISO, differenceInDays } from 'date-fns'
import api from '../../api/axios'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'
import { getStatusBadge, CATEGORY_COLORS, CATEGORY_ICONS } from '../../utils/helpers'

const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

export default function LegislationDetail() {
  const { id } = useParams()
  const [leg, setLeg] = useState(null)
  const [text, setText] = useState('')
  const [attachment, setAttachment] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const MAX = 2000

  const fetchLeg = () => api.get(`/legislations/${id}`).then(r => setLeg(r.data))
  useEffect(() => { fetchLeg() }, [id])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!text.trim() || text.length > MAX) return
    setSubmitting(true); setError('')
    try {
      const fd = new FormData()
      fd.append('text', text); fd.append('legislation_id', id)
      if (attachment) fd.append('attachment', attachment)
      await api.post('/comments/', fd)
      setSuccess(true)
      setTimeout(() => { setSuccess(false); setText(''); setAttachment(null); fetchLeg() }, 2500)
    } catch (err) { setError(err.response?.data?.error || 'Submission failed') }
    finally { setSubmitting(false) }
  }

  const charPct = (text.length / MAX) * 100
  const charColor = text.length > 1800 ? '#f87171' : text.length > 1500 ? '#fb923c' : 'rgba(245,158,11,0.40)'
  const barColor = charPct > 90 ? 'bg-red-500' : charPct > 75 ? 'bg-orange-400' : ''
  const daysLeft = leg?.end_date ? differenceInDays(parseISO(leg.end_date), new Date()) : null
  const cat = CATEGORY_COLORS[leg?.category] || CATEGORY_COLORS.Other

  if (!leg) return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="" />
      <main className="flex-1 flex flex-col items-center justify-center gap-3" style={{background:'#0A1628'}}>
        <div className="w-10 h-10 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.2)', borderTopColor:'#F59E0B'}} />
        <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>Loading legislation...</div>
      </main>
    </div>
  )

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title={leg.title.slice(0,50)+(leg.title.length>50?'...':'')} subtitle={leg.ministry} />
        <div className="p-8 max-w-6xl">
          <div className="grid lg:grid-cols-2 gap-6">

            {/* Left: Law Info + PDF */}
            <div className="space-y-5">
              <div className="rounded-2xl p-6 relative overflow-hidden" style={{background:'linear-gradient(135deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
                <div className="absolute top-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
                <div className="relative">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${cat.badge}`}>{CATEGORY_ICONS[leg.category]} {leg.category}</span>
                    {getStatusBadge(leg)}
                    {daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && (
                      <span className="text-xs px-2.5 py-1 rounded-lg font-bold animate-pulse" style={{background:'rgba(249,115,22,0.15)', color:'#fb923c', border:'1px solid rgba(249,115,22,0.25)'}}>⚠️ Closes in {daysLeft}d</span>
                    )}
                  </div>
                  <h2 className="font-display text-xl font-bold mb-1" style={{color:'#F59E0B'}}>{leg.title}</h2>
                  <p className="text-sm" style={{color:'rgba(245,158,11,0.50)'}}>{leg.ministry}</p>
                  {leg.description && <p className="text-sm mt-2 leading-relaxed" style={{color:'rgba(245,158,11,0.35)'}}>{leg.description}</p>}
                  <div className="flex items-center gap-4 mt-4 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>
                    <span>💬 {leg.comment_count} comments</span>
                    {leg.end_date && <span>📅 Deadline: {format(parseISO(leg.end_date),'dd MMM yyyy')}</span>}
                  </div>
                </div>
              </div>

              {leg.pdf_path && (
                <div className="rounded-2xl overflow-hidden" style={G}>
                  <div className="flex items-center justify-between px-5 py-4" style={{borderBottom:'1px solid rgba(245,158,11,0.08)'}}>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.20)'}}>📄</div>
                      <div>
                        <div className="font-display font-bold text-sm text-white">Legislation Document</div>
                        <div className="text-xs" style={{color:'rgba(245,158,11,0.35)'}}>Official PDF</div>
                      </div>
                    </div>
                    <a href={`http://localhost:5000/api/legislations/pdf/${leg.pdf_path}`} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3">Open ↗</a>
                  </div>
                  <iframe src={`http://localhost:5000/api/legislations/pdf/${leg.pdf_path}`} className="w-full h-72" title="PDF" />
                </div>
              )}
            </div>

            {/* Right: Comment Form */}
            <div>
              <div className="sticky top-8">
                <div className="rounded-2xl overflow-hidden" style={{background:'#0F2040', border:'1px solid rgba(245,158,11,0.20)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>
                  <div className="p-5 relative overflow-hidden" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
                    <div className="absolute top-0 right-0 w-24 h-24 rounded-full translate-x-8 -translate-y-8" style={{background:'rgba(255,255,255,0.08)'}} />
                    <div className="relative flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl border" style={{background:'rgba(7,16,32,0.20)', borderColor:'rgba(7,16,32,0.20)'}}>💬</div>
                      <div>
                        <div className="font-display font-bold" style={{color:'#071020'}}>Submit Feedback</div>
                        <div className="text-xs" style={{color:'rgba(7,16,32,0.60)'}}>Your opinion shapes policy</div>
                      </div>
                    </div>
                  </div>

                  <div className="p-5">
                    {leg.status !== 'Open' ? (
                      <div className="flex flex-col items-center py-10 text-center">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>🔒</div>
                        <div className="font-display font-bold" style={{color:'rgba(245,158,11,0.60)'}}>Consultation {leg.status.toLowerCase()}</div>
                        <div className="text-sm mt-1" style={{color:'rgba(245,158,11,0.30)'}}>Comments are no longer accepted</div>
                      </div>
                    ) : success ? (
                      <div className="flex flex-col items-center py-10 text-center fade-in">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center text-4xl mb-4 float shadow-xl shadow-emerald-900/50">✅</div>
                        <div className="font-display font-bold text-lg" style={{color:'#34d399'}}>Comment Submitted!</div>
                        <div className="text-sm mt-2 flex items-center gap-1.5" style={{color:'rgba(245,158,11,0.40)'}}>
                          <div className="w-3 h-3 border border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(245,158,11,0.20)', borderTopColor:'#F59E0B'}} />
                          AI is analysing your feedback...
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                          <div className="rounded-xl p-3 text-xs flex items-center gap-2" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>
                            <span>⚠️</span>{error}
                          </div>
                        )}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'rgba(245,158,11,0.40)'}}>Your Feedback</label>
                          <textarea className="input resize-none text-sm leading-relaxed" rows={6}
                            placeholder="Share your detailed thoughts on this legislation..."
                            value={text} onChange={e => setText(e.target.value)} maxLength={MAX} />
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex-1 rounded-full h-1 mr-3" style={{background:'rgba(245,158,11,0.08)'}}>
                              <div className={`h-1 rounded-full transition-all duration-300 ${barColor}`}
                                style={{width:`${charPct}%`, background: charPct <= 75 ? 'linear-gradient(90deg,#F59E0B,#D97706)' : undefined}} />
                            </div>
                            <span className="text-xs font-semibold tabular-nums" style={{color:charColor}}>{text.length}/{MAX}</span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'rgba(245,158,11,0.40)'}}>
                            Attachment <span className="font-normal normal-case" style={{color:'rgba(245,158,11,0.25)'}}>(PDF/DOC, max 5MB)</span>
                          </label>
                          {attachment ? (
                            <div className="rounded-xl p-3 flex items-center justify-between" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)'}}>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{background:'rgba(245,158,11,0.10)'}}>📎</div>
                                <span className="text-xs font-semibold truncate" style={{color:'rgba(245,158,11,0.70)'}}>{attachment.name}</span>
                              </div>
                              <button type="button" onClick={() => setAttachment(null)}
                                className="w-6 h-6 rounded-lg flex items-center justify-center text-xs shrink-0 ml-2 transition-colors" style={{background:'rgba(239,68,68,0.12)', color:'#f87171'}}>✕</button>
                            </div>
                          ) : (
                            <label className="rounded-xl p-4 flex flex-col items-center gap-2 cursor-pointer transition-all group"
                              style={{border:'2px dashed rgba(245,158,11,0.15)'}}>
                              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all" style={{background:'rgba(245,158,11,0.06)', color:'rgba(245,158,11,0.40)'}}>📎</div>
                              <span className="text-xs font-medium" style={{color:'rgba(245,158,11,0.35)'}}>Click to upload file</span>
                              <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={e => setAttachment(e.target.files[0])} />
                            </label>
                          )}
                        </div>

                        <button type="submit" disabled={!text.trim() || text.length > MAX || submitting}
                          className="btn-primary w-full py-3.5 rounded-xl text-sm">
                          {submitting
                            ? <><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(7,16,32,0.3)', borderTopColor:'#071020'}} />Submitting...</>
                            : '✉️ Submit Feedback'}
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                <div className="mt-4 rounded-2xl p-4" style={{background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.10)'}}>
                  <div className="font-display font-bold text-xs mb-2" style={{color:'rgba(245,158,11,0.60)'}}>💡 Tips for effective feedback</div>
                  <ul className="space-y-1 text-xs" style={{color:'rgba(245,158,11,0.35)'}}>
                    <li>• Be specific about what you support or oppose</li>
                    <li>• Provide evidence or examples where possible</li>
                    <li>• Suggest alternatives if you oppose a clause</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
