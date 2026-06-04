import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

const ICONS = { individual:'👤', legal:'⚖️', industry:'🏭', ngo:'🤝', academic:'🎓' }

const Icon = ({ d, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d.map((p,i) => <path key={i} d={p} />)}
  </svg>
)

const links = [
  { to:'/home',          label:'Dashboard',     icon:['M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2','M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2','M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2','M9 12h6','M9 16h4'] },
  { to:'/active',        label:'Consultations', icon:['M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z','M12 6v6l4 2'] },
  { to:'/my-comments',   label:'My Comments',   icon:['M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'] },
  { to:'/notifications', label:'Notifications', icon:['M15 17h5l-1.405-1.405A2.032 2.032 0 0 1 18 14.158V11a6.002 6.002 0 0 0-4-5.659V5a2 2 0 1 0-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 1 1-6 0v-1m6 0H9'] },
  { to:'/profile',       label:'My Profile',    icon:['M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2','M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'] },
]

export default function UserSidebar({ active }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    const fetch = () => api.get('/notifications/unread-count').then(r => setUnread(r.data.unread_count)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 30000)
    window.addEventListener('notifications-read', fetch)
    return () => { clearInterval(t); window.removeEventListener('notifications-read', fetch) }
  }, [])

  return (
    <aside className="w-60 min-h-screen flex flex-col shrink-0" style={{background:'#071020', borderRight:'1px solid rgba(245,158,11,0.10)'}}>
      {/* Logo */}
      <div className="px-5 py-6" style={{borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#071020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 8h14"/>
              <path d="M5 8L3 13h4L5 8z"/><path d="M19 8l-2 5h4l-2-5z"/>
            </svg>
          </div>
          <div>
            <div className="font-display font-bold text-white text-sm">Lawlytics</div>

          </div>
        </div>
      </div>


      {/* Nav links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(l => (
          <Link key={l.to} to={l.to}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${active === l.to ? 'text-navy-900' : 'text-slate-500 hover:text-amber-300'}`}
            style={active === l.to ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020', boxShadow:'0 4px 12px rgba(245,158,11,0.25)'} : {}}>
            <span className="w-5 flex items-center justify-center shrink-0"><Icon d={l.icon} /></span>
            <span className="flex-1">{l.label}</span>
            {l.to === '/notifications' && unread > 0 && active !== l.to && (
              <span className="min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4" style={{borderTop:'1px solid rgba(245,158,11,0.10)'}}>
        <button onClick={() => { logout(); navigate('/') }}
          className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-sm transition-all"
          style={{color:'rgba(248,113,113,0.6)'}}
          onMouseEnter={e => e.currentTarget.style.color='rgb(248,113,113)'}
          onMouseLeave={e => e.currentTarget.style.color='rgba(248,113,113,0.6)'}>
          <span className="font-mono">⊗</span> Sign Out
        </button>
      </div>
    </aside>
  )
}
