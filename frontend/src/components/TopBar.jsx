import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

export default function TopBar({ title, subtitle }) {
  const { user } = useAuth()
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    if (user?.is_admin) return
    const fetch = () => api.get('/notifications/unread-count').then(r => setUnread(r.data.unread_count)).catch(() => {})
    fetch()
    const t = setInterval(fetch, 5000)
    window.addEventListener('notifications-read', fetch)
    return () => { clearInterval(t); window.removeEventListener('notifications-read', fetch) }
  }, [user])

  return (
    <div className="flex items-center justify-between px-8 py-5 sticky top-0 z-10"
      style={{background:'#071020', borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
      <div>
        <h1 className="font-display text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm mt-0.5" style={{color:'rgba(245,158,11,0.5)'}}>{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {!user?.is_admin && (
          <Link to="/notifications"
            className="relative w-10 h-10 flex items-center justify-center rounded-xl transition-all group"
            style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)'}}
            title="Notifications">
            <svg className="w-5 h-5 transition-colors" style={{color:'rgba(245,158,11,0.6)'}} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
            </svg>
            {unread > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center px-1 shadow-md animate-pulse">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )}

        <div className="flex items-center gap-2 rounded-xl px-3 py-2" style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.15)'}}>
          <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shadow-sm" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-bold text-white leading-tight">{user?.name?.split(' ')[0]}</div>
            <div className="text-[10px] capitalize leading-tight" style={{color:'rgba(245,158,11,0.4)'}}>{user?.is_admin ? 'Admin' : user?.stakeholder_type}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
