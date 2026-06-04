import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const TYPES = [
  { value:'individual', label:'Individual Citizen', icon:'👤' },
  { value:'legal', label:'Legal Professional', icon:'⚖️' },
  { value:'industry', label:'Industry Body', icon:'🏭' },
  { value:'ngo', label:'NGO / Civil Society', icon:'🤝' },
  { value:'academic', label:'Academic / Research', icon:'🎓' },
]

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name:'', email:'', password:'', organisation:'', location:'', stakeholder_type:'individual' })
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try { await register(form); navigate('/home') }
    catch (err) { setError(err.response?.data?.error || 'Registration failed') }
    finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex" style={{background:'#0A1628'}}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-center items-center p-12" style={{background:'#071020', borderRight:'1px solid rgba(245,158,11,0.10)'}}>
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.06)'}} />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.04)'}} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{backgroundImage:'linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)', backgroundSize:'40px 40px'}} />
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <Link to="/" className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#071020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 8h14"/>
                <path d="M5 8L3 13h4L5 8z"/><path d="M19 8l-2 5h4l-2-5z"/>
              </svg>
            </div>
            <div>
              <div className="font-display font-bold text-white text-xl">Lawlytics</div>

            </div>
          </Link>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Join thousands<br />shaping India's laws
          </h2>
          <p className="text-sm leading-relaxed max-w-xs mb-10" style={{color:'rgba(255,255,255,0.35)'}}>
            Create your free account and start participating in legislative consultations today.
          </p>

        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto" style={{background:'#0A1628'}}>
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 8h14"/>
                <path d="M5 8L3 13h4L5 8z"/><path d="M19 8l-2 5h4l-2-5z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">Lawlytics</span>
          </div>
          <div className="mb-8">
            <h1 className="font-display text-3xl font-bold text-white mb-2">Create account</h1>
            <p className="text-sm" style={{color:'rgba(245,158,11,0.4)'}}>Your voice matters — join today for free</p>
          </div>

          <div className="rounded-3xl p-8" style={{background:'#071020', border:'1px solid rgba(245,158,11,0.12)'}}>
            {error && (
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 mb-5 text-sm" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>
                <span>⚠️</span>{error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              {[
                { label:'Full Name *', key:'name', icon:'👤', placeholder:'Rahul Sharma', type:'text' },
                { label:'Email *', key:'email', icon:'✉️', placeholder:'you@example.com', type:'email' },
              ].map(({ label, key, icon, placeholder, type }) => (
                <div key={key}>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'rgba(245,158,11,0.4)'}}>{label}</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.3)'}}>{icon}</span>
                    <input className="input pl-10" type={type} placeholder={placeholder} value={form[key]} onChange={e=>set(key,e.target.value)} required />
                  </div>
                </div>
              ))}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'rgba(245,158,11,0.4)'}}>Password * <span className="font-normal normal-case" style={{color:'rgba(245,158,11,0.25)'}}>(min 6 chars)</span></label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.3)'}}>🔒</span>
                  <input className="input pl-10 pr-12" type={showPw?'text':'password'} placeholder="••••••••" value={form.password} onChange={e=>set('password',e.target.value)} required />
                  <button type="button" onClick={()=>setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.3)'}}>{showPw?'🙈':'👁️'}</button>
                </div>
                {form.password.length > 0 && (
                  <div className={`text-xs mt-1.5 font-semibold ${form.password.length>=6?'text-emerald-400':'text-red-400'}`}>
                    {form.password.length>=6?'✓ Strong enough':'✗ Too short'}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'rgba(245,158,11,0.4)'}}>Stakeholder Type *</label>
                <select className="input" value={form.stakeholder_type} onChange={e=>set('stakeholder_type',e.target.value)}>
                  {TYPES.map(t=><option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label:'Organisation', key:'organisation', icon:'🏢', placeholder:'Optional' },
                  { label:'Location', key:'location', icon:'📍', placeholder:'City, State' },
                ].map(({ label, key, icon, placeholder }) => (
                  <div key={key}>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1.5" style={{color:'rgba(245,158,11,0.4)'}}>{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{color:'rgba(245,158,11,0.3)'}}>{icon}</span>
                      <input className="input pl-9 text-sm" placeholder={placeholder} value={form[key]} onChange={e=>set(key,e.target.value)} />
                    </div>
                  </div>
                ))}
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 rounded-2xl text-base flex items-center justify-center gap-2 mt-2">
                {loading ? <><div className="w-4 h-4 border-2 rounded-full animate-spin" style={{borderColor:'rgba(10,22,40,0.3)', borderTopColor:'#071020'}} />Creating account...</> : 'Create Account →'}
              </button>
            </form>
          </div>

          <p className="text-center text-sm mt-6" style={{color:'rgba(245,158,11,0.30)'}}>
            Already have an account?{' '}
            <Link to="/login" className="font-semibold transition-colors" style={{color:'rgba(245,158,11,0.60)'}}
              onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.60)'}>Sign in →</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
