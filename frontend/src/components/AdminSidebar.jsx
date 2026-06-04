import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Icon = ({ d, size=18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    {d.map((p,i) => <path key={i} d={p} />)}
  </svg>
)

const links = [
  { to:'/admin', label:'Dashboard', end:true, icon:[
    'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
    'M9 22V12h6v10'
  ]},
  { to:'/admin/upload', label:'Upload', icon:[
    'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4',
    'M17 8l-5-5-5 5','M12 3v12'
  ]},
  { to:'/admin/comments', label:'Comments', icon:[
    'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z'
  ]},
  { to:'/admin/sentiment', label:'Sentiment', icon:[
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z',
    'M8 14s1.5 2 4 2 4-2 4-2',
    'M9 9h.01','M15 9h.01'
  ]},
  { to:'/profile', label:'My Profile', icon:[
    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2',
    'M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z'
  ]},
]

export default function AdminSidebar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  return (
    <aside className="w-60 min-h-screen flex flex-col shrink-0" style={{background:'#071020', borderRight:'1px solid rgba(245,158,11,0.10)'}}>
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

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {links.map(l => (
          <NavLink key={l.to} to={l.to} end={l.end}
            className={({ isActive }) => `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive ? 'text-navy-900' : 'text-slate-500 hover:text-amber-300'}`}
            style={({ isActive }) => isActive ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020', boxShadow:'0 4px 12px rgba(245,158,11,0.25)'} : {}}>
            <span className="w-5 flex items-center justify-center shrink-0"><Icon d={l.icon} /></span>
            {l.label}
          </NavLink>
        ))}
      </nav>

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
