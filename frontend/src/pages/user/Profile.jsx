import { useState, useEffect } from 'react'
import { format, parseISO } from 'date-fns'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import AdminSidebar from '../../components/AdminSidebar'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'
import { getSentimentBadge } from '../../utils/helpers'

const STAKEHOLDER_TYPES = [
  { value:'individual', label:'Individual Citizen' },
  { value:'legal',      label:'Legal Professional' },
  { value:'industry',   label:'Industry Body' },
  { value:'ngo',        label:'NGO / Civil Society' },
  { value:'academic',   label:'Academic / Research' },
]
const STAKEHOLDER_ICONS = { individual:'👤', legal:'⚖️', industry:'🏭', ngo:'🤝', academic:'🎓' }
const G  = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }
const G2 = { border:'1px solid rgba(245,158,11,0.08)', background:'rgba(245,158,11,0.04)' }

const Field = ({ label, value, editing, inputProps }) => (
  <div>
    <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:'rgba(245,158,11,0.40)'}}>{label}</label>
    {editing
      ? <input className="input" {...inputProps} />
      : <div className="rounded-xl px-4 py-2.5 text-sm" style={{...G2, color:'rgba(255,255,255,0.70)'}}>
          {value || <span style={{color:'rgba(245,158,11,0.25)'}}>Not set</span>}
        </div>
    }
  </div>
)

export default function Profile() {
  const { user, updateUser } = useAuth()
  const [tab, setTab]               = useState('profile')
  const [editing, setEditing]       = useState(false)
  const [form, setForm]             = useState({})
  const [recentComments, setRecentComments] = useState([])
  const [stats, setStats]           = useState({ total:0, positive:0, negative:0, neutral:0 })
  const [msg, setMsg]               = useState('')
  const [err, setErr]               = useState('')

  useEffect(() => {
    if (user) setForm({ name:user.name, organisation:user.organisation||'', location:user.location||'', stakeholder_type:user.stakeholder_type })
    if (!user?.is_admin) {
      api.get('/comments/my').then(r => {
        const c = r.data
        setRecentComments(c.slice(0,6))
        setStats({ total:c.length, positive:c.filter(x=>x.sentiment==='positive').length, negative:c.filter(x=>x.sentiment==='negative').length, neutral:c.filter(x=>x.sentiment==='neutral').length })
      })
    }
  }, [user])

  const save = async () => {
    try {
      const r = await api.put('/profile/', form)
      updateUser(r.data); setEditing(false)
      setMsg('Profile updated successfully!'); setTimeout(()=>setMsg(''),3000)
    } catch { setErr('Update failed. Please try again.') }
  }

  if (!user) return null
  const tabs = user.is_admin ? ['profile'] : ['profile','activity']
  const initials = user.name?.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2)

  const Content = () => (
    <div className="flex gap-6 items-start">

      {/* Left panel */}
      <div className="w-64 shrink-0 space-y-4">

        {/* Avatar card */}
        <div className="rounded-2xl p-6 flex flex-col items-center text-center relative overflow-hidden" style={{background:'linear-gradient(160deg,#0F2040,#071020)', border:'1px solid rgba(245,158,11,0.20)'}}>
          <div className="absolute top-0 left-0 right-0 h-24 opacity-30" style={{background:'linear-gradient(180deg,rgba(245,158,11,0.08),transparent)'}} />
          <div className="relative w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold shadow-2xl mb-4" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>
            {initials}
          </div>
          <div className="font-display font-bold text-white text-base leading-tight">{user.name}</div>
          <div className="text-xs mt-1 mb-3" style={{color:'rgba(245,158,11,0.45)'}}>{user.email}</div>
          {user.is_admin
            ? <span className="text-[11px] font-bold px-3 py-1 rounded-full" style={{background:'rgba(245,158,11,0.15)', color:'#F59E0B', border:'1px solid rgba(245,158,11,0.25)'}}>🛡️ Administrator</span>
            : <span className="text-[11px] font-bold px-3 py-1 rounded-full capitalize" style={{background:'rgba(245,158,11,0.10)', color:'rgba(245,158,11,0.70)', border:'1px solid rgba(245,158,11,0.15)'}}>
                {STAKEHOLDER_ICONS[user.stakeholder_type]} {user.stakeholder_type}
              </span>
          }
          {user.created_at && (
            <div className="mt-4 pt-4 w-full text-xs" style={{borderTop:'1px solid rgba(245,158,11,0.10)', color:'rgba(245,158,11,0.35)'}}>
              Member since {format(parseISO(user.created_at),'MMMM yyyy')}
            </div>
          )}
        </div>



        {/* Stats — users only */}
        {!user.is_admin && (
          <div className="rounded-2xl p-4" style={G}>
            <div className="text-[11px] font-bold uppercase tracking-widest mb-3" style={{color:'rgba(245,158,11,0.40)'}}>Your Activity</div>
            <div className="space-y-2">
              {[
                { label:'Total Comments', val:stats.total,    color:'#F59E0B' },
                { label:'Positive',       val:stats.positive, color:'#10B981' },
                { label:'Negative',       val:stats.negative, color:'#EF4444' },
                { label:'Neutral',        val:stats.neutral,  color:'#64748b' },
              ].map(s => (
                <div key={s.label} className="flex items-center justify-between">
                  <span className="text-xs" style={{color:'rgba(245,158,11,0.45)'}}>{s.label}</span>
                  <span className="text-sm font-bold" style={{color:s.color}}>{s.val}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right panel */}
      <div className="flex-1 min-w-0 space-y-4">

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="rounded-2xl p-1 flex gap-1 w-fit" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>
            {tabs.map(t => (
              <button key={t} onClick={() => setTab(t)}
                className="px-5 py-2 rounded-xl text-sm font-semibold capitalize transition-all"
                style={tab===t ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'} : {color:'rgba(245,158,11,0.50)'}}>
                {t}
              </button>
            ))}
          </div>
        )}

        {msg && <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{background:'rgba(16,185,129,0.10)', border:'1px solid rgba(16,185,129,0.20)', color:'#34d399'}}>{msg}</div>}
        {err && <div className="rounded-xl px-4 py-3 text-sm font-medium" style={{background:'rgba(239,68,68,0.10)', border:'1px solid rgba(239,68,68,0.20)', color:'#f87171'}}>{err}</div>}

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="rounded-2xl p-6" style={G}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-display font-bold text-white">Profile Information</h3>
                <p className="text-xs mt-0.5" style={{color:'rgba(245,158,11,0.35)'}}>Update your personal details</p>
              </div>
              {!editing
                ? <button onClick={() => setEditing(true)} className="btn-secondary text-sm py-2 px-4">Edit Profile</button>
                : <div className="flex gap-2">
                    <button onClick={save} className="btn-primary text-sm py-2 px-4">Save</button>
                    <button onClick={() => { setEditing(false); setErr('') }} className="btn-secondary text-sm py-2 px-4">Cancel</button>
                  </div>
              }
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <Field label="Full Name" value={user.name} editing={editing}
                inputProps={{ value:form.name||'', onChange:e=>setForm(f=>({...f,name:e.target.value})) }} />
              <Field label="Organisation" value={user.organisation} editing={editing}
                inputProps={{ value:form.organisation||'', onChange:e=>setForm(f=>({...f,organisation:e.target.value})) }} />
              <Field label="Location" value={user.location} editing={editing}
                inputProps={{ value:form.location||'', onChange:e=>setForm(f=>({...f,location:e.target.value})) }} />

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:'rgba(245,158,11,0.40)'}}>Stakeholder Type</label>
                {editing
                  ? <select className="input" value={form.stakeholder_type} onChange={e=>setForm(f=>({...f,stakeholder_type:e.target.value}))}>
                      {STAKEHOLDER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  : <div className="rounded-xl px-4 py-2.5 text-sm capitalize" style={{...G2, color:'rgba(255,255,255,0.70)'}}>
                      {STAKEHOLDER_ICONS[user.stakeholder_type]} {user.stakeholder_type}
                    </div>
                }
              </div>

              <div className="md:col-span-2">
                <label className="block text-[11px] font-bold uppercase tracking-widest mb-1.5" style={{color:'rgba(245,158,11,0.40)'}}>Email Address</label>
                <div className="rounded-xl px-4 py-2.5 text-sm flex items-center justify-between" style={{...G2, color:'rgba(255,255,255,0.70)'}}>
                  <span>{user.email}</span>
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold" style={{background:'rgba(16,185,129,0.12)', color:'#34d399', border:'1px solid rgba(16,185,129,0.25)'}}>✓ Verified</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activity tab */}
        {tab === 'activity' && !user.is_admin && (
          <div className="rounded-2xl p-6" style={G}>
            <h3 className="font-display font-bold text-white mb-5">Recent Comments</h3>
            {recentComments.length === 0
              ? <div className="flex flex-col items-center py-12" style={{color:'rgba(245,158,11,0.30)'}}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>💬</div>
                  <div className="font-semibold" style={{color:'rgba(245,158,11,0.40)'}}>No comments yet</div>
                </div>
              : <div className="space-y-3">
                  {recentComments.map(c => (
                    <div key={c.id} className="rounded-xl p-4 flex items-start gap-3 transition-all"
                      style={{background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.08)'}}
                      onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.18)'}
                      onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.08)'}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate mb-1" style={{color:'rgba(245,158,11,0.70)'}}>{c.legislation_title}</div>
                        <div className="text-sm line-clamp-2" style={{color:'rgba(255,255,255,0.45)'}}>{c.text}</div>
                        <div className="text-xs mt-1.5" style={{color:'rgba(245,158,11,0.30)'}}>{format(parseISO(c.created_at),'dd MMM yyyy · h:mm a')}</div>
                      </div>
                      <div className="shrink-0">{getSentimentBadge(c.sentiment, c.confidence)}</div>
                    </div>
                  ))}
                </div>
            }
          </div>
        )}
      </div>
    </div>
  )

  if (user.is_admin) return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <AdminSidebar />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="My Profile" subtitle="Manage your account information" />
        <div className="p-8"><Content /></div>
      </main>
    </div>
  )

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="/profile" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="My Profile" subtitle="Manage your account information" />
        <div className="p-8"><Content /></div>
      </main>
    </div>
  )
}
