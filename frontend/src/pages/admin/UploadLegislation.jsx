import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import AdminSidebar from '../../components/AdminSidebar'
import TopBar from '../../components/TopBar'

const CATEGORIES = ['Technology','Education','Environment','Health','Finance','Agriculture','Infrastructure','Social Welfare','Defence','Other']
const STEPS = [
  { label:'Basic Info', icon:'📋', desc:'Title, ministry & dates' },
  { label:'Document',   icon:'📄', desc:'Upload PDF file' },
  { label:'Provisions', icon:'📑', desc:'Add bill sections' },
]
const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }
const Label = ({ children }) => <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{color:'rgba(245,158,11,0.40)'}}>{children}</label>

export default function UploadLegislation() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState({ title:'', description:'', ministry:'', category:'Technology', status:'Draft', start_date:'', end_date:'' })
  const [pdf, setPdf] = useState(null)
  const [provisions, setProvisions] = useState([{ section_number:'', title:'', text:'' }])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const addProvision = () => setProvisions(p=>[...p,{section_number:'',title:'',text:''}])
  const updateProvision = (i,k,v) => setProvisions(p=>p.map((item,idx)=>idx===i?{...item,[k]:v}:item))
  const removeProvision = i => setProvisions(p=>p.filter((_,idx)=>idx!==i))
  const isComplete = p => p.section_number && p.title && p.text

  const handleSubmit = async () => {
    setLoading(true); setError('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k,v]) => v && fd.append(k,v))
      if (pdf) fd.append('pdf', pdf)
      fd.append('provisions', JSON.stringify(provisions.filter(p=>p.section_number||p.title)))
      await api.post('/legislations/', fd)
      navigate('/admin')
    } catch (e) { setError(e.response?.data?.error||'Upload failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Upload Legislation" subtitle="Create a new public consultation" />
        <div className="p-8">

          {/* Step indicator */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((s,i) => (
              <div key={s.label} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold transition-all duration-300 shadow-sm"
                    style={i < step
                      ? {background:'#10B981', color:'white'}
                      : i === step
                      ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020', boxShadow:'0 4px 12px rgba(245,158,11,0.30)'}
                      : {background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.12)', color:'rgba(245,158,11,0.30)'}}>
                    {i < step ? '✓' : s.icon}
                  </div>
                  <div className="text-xs font-bold mt-2" style={{color: i===step?'#F59E0B': i<step?'#10B981':'rgba(245,158,11,0.30)'}}>{s.label}</div>
                  <div className="text-[10px] mt-0.5" style={{color:'rgba(245,158,11,0.25)'}}>{s.desc}</div>
                </div>
                {i < STEPS.length-1 && (
                  <div className="w-24 h-0.5 mx-3 mb-6 rounded-full transition-all" style={{background: i<step?'#10B981':'rgba(245,158,11,0.10)'}} />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="max-w-3xl mx-auto mb-6 rounded-2xl px-5 py-3.5 text-sm flex items-center gap-2" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>
              <span>⚠️</span>{error}
            </div>
          )}

          {/* Step 0 */}
          {step === 0 && (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl overflow-hidden" style={G}>
                <div className="px-8 py-5 flex items-center gap-4" style={{background:'rgba(245,158,11,0.06)', borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>📋</div>
                  <div>
                    <div className="font-display font-bold text-white text-lg">Basic Information</div>
                    <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>Fill in the legislation details</div>
                  </div>
                </div>
                <div className="p-8 space-y-6">
                  <div><Label>Title *</Label><input className="input text-base" value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Digital Personal Data Protection Bill 2024" /></div>
                  <div><Label>Description</Label><textarea className="input resize-none" rows={3} value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Brief overview..." /></div>
                  <div className="grid grid-cols-2 gap-5">
                    <div><Label>Ministry</Label><input className="input" value={form.ministry} onChange={e=>set('ministry',e.target.value)} placeholder="e.g. Ministry of Electronics & IT" /></div>
                    <div><Label>Category</Label><select className="input" value={form.category} onChange={e=>set('category',e.target.value)}>{CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></div>
                  </div>
                  <div className="grid grid-cols-3 gap-5">
                    <div><Label>Status</Label><select className="input" value={form.status} onChange={e=>set('status',e.target.value)}>{['Draft','Open','Closed'].map(s=><option key={s}>{s}</option>)}</select></div>
                    <div><Label>Start Date</Label><input className="input" type="date" value={form.start_date} onChange={e=>set('start_date',e.target.value)} /></div>
                    <div><Label>End Date</Label><input className="input" type="date" value={form.end_date} onChange={e=>set('end_date',e.target.value)} /></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl overflow-hidden" style={G}>
                <div className="px-8 py-5 flex items-center gap-4" style={{background:'rgba(245,158,11,0.06)', borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>📄</div>
                  <div>
                    <div className="font-display font-bold text-white text-lg">PDF Document</div>
                    <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>Upload the official legislation document</div>
                  </div>
                </div>
                <div className="p-8">
                  {pdf ? (
                    <div className="rounded-2xl p-6 flex items-center justify-between" style={{background:'rgba(16,185,129,0.10)', border:'2px solid rgba(16,185,129,0.25)'}}>
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{background:'rgba(16,185,129,0.15)'}}>📄</div>
                        <div>
                          <div className="font-bold text-white">{pdf.name}</div>
                          <div className="text-sm mt-0.5" style={{color:'rgba(16,185,129,0.70)'}}>{(pdf.size/1024/1024).toFixed(2)} MB</div>
                        </div>
                      </div>
                      <button onClick={()=>setPdf(null)} className="text-sm font-semibold px-4 py-2 rounded-xl transition-all" style={{background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>Remove</button>
                    </div>
                  ) : (
                    <label className="rounded-2xl p-12 flex flex-col items-center gap-4 cursor-pointer transition-all duration-300 group"
                      style={{border:'2px dashed rgba(245,158,11,0.15)'}}>
                      <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl transition-all group-hover:scale-110" style={{background:'rgba(245,158,11,0.06)'}}>📎</div>
                      <div className="text-center">
                        <div className="font-display font-bold text-lg text-white">Click to upload PDF</div>
                        <div className="text-sm mt-1" style={{color:'rgba(245,158,11,0.35)'}}>Maximum file size: 10MB · PDF format only</div>
                      </div>
                      <div className="text-sm font-semibold px-5 py-2 rounded-xl" style={{background:'rgba(245,158,11,0.10)', border:'1px solid rgba(245,158,11,0.20)', color:'#F59E0B'}}>Browse Files</div>
                      <input type="file" accept=".pdf" className="hidden" onChange={e=>setPdf(e.target.files[0])} />
                    </label>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="max-w-3xl mx-auto">
              <div className="rounded-3xl overflow-hidden" style={G}>
                <div className="px-8 py-5 flex items-center justify-between" style={{background:'rgba(245,158,11,0.06)', borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>📑</div>
                    <div>
                      <div className="font-display font-bold text-white text-lg">Provisions / Sections</div>
                      <div className="text-sm" style={{color:'rgba(245,158,11,0.40)'}}>{provisions.length} section{provisions.length!==1?'s':''} added</div>
                    </div>
                  </div>
                  <button onClick={addProvision} className="btn-primary text-sm px-4 py-2">+ Add Section</button>
                </div>
                <div className="p-8 space-y-4">
                  {provisions.map((p,i) => (
                    <div key={i} className="rounded-2xl p-5 transition-all duration-200"
                      style={{border: isComplete(p)?'2px solid rgba(16,185,129,0.30)':'2px solid rgba(245,158,11,0.10)', background: isComplete(p)?'rgba(16,185,129,0.05)':'rgba(245,158,11,0.02)'}}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold transition-all"
                            style={isComplete(p)?{background:'#10B981', color:'white'}:{background:'rgba(245,158,11,0.10)', color:'rgba(245,158,11,0.50)', border:'1px solid rgba(245,158,11,0.15)'}}>
                            {isComplete(p)?'✓':i+1}
                          </div>
                          <span className="font-display font-bold text-white">Section {i+1}</span>
                          {isComplete(p) && <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{background:'rgba(16,185,129,0.15)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}}>Complete</span>}
                        </div>
                        {provisions.length>1 && (
                          <button onClick={()=>removeProvision(i)} className="text-xs font-medium px-3 py-1.5 rounded-lg transition-all" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>Remove</button>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div><Label>Section Number</Label><input className="input text-sm" placeholder="e.g. 1.1" value={p.section_number} onChange={e=>updateProvision(i,'section_number',e.target.value)} /></div>
                        <div><Label>Section Title</Label><input className="input text-sm" placeholder="e.g. Definitions" value={p.title} onChange={e=>updateProvision(i,'title',e.target.value)} /></div>
                      </div>
                      <div><Label>Full Section Text</Label><textarea className="input text-sm resize-none" rows={4} placeholder="Paste the full text here..." value={p.text} onChange={e=>updateProvision(i,'text',e.target.value)} /></div>
                    </div>
                  ))}
                  <button onClick={addProvision} className="w-full rounded-2xl py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                    style={{border:'2px dashed rgba(245,158,11,0.12)', color:'rgba(245,158,11,0.40)'}}>
                    + Add Another Section
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="max-w-3xl mx-auto mt-6 flex justify-between items-center">
            <button onClick={() => step>0?setStep(s=>s-1):navigate('/admin')} className="btn-secondary px-6 py-2.5">
              {step===0?'← Cancel':'← Back'}
            </button>
            <div className="flex items-center gap-2">
              {STEPS.map((_,i) => (
                <div key={i} className="h-2 rounded-full transition-all" style={{
                  width: i===step?'24px':'8px',
                  background: i===step?'#F59E0B': i<step?'#10B981':'rgba(245,158,11,0.15)'
                }} />
              ))}
            </div>
            {step<2 ? (
              <button onClick={()=>setStep(s=>s+1)} disabled={step===0&&!form.title} className="btn-primary px-6 py-2.5 disabled:opacity-40">Next →</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading} className="btn-primary px-8 py-2.5 flex items-center gap-2">
                {loading?<><div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'rgba(7,16,32,0.3)',borderTopColor:'#071020'}}/>Publishing...</>:'🚀 Publish Legislation'}
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
