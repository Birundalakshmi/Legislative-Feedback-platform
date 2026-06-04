import { useState, useEffect } from 'react'
import { parseISO, formatDistanceToNow } from 'date-fns'
import api from '../../api/axios'
import UserSidebar from '../../components/UserSidebar'
import TopBar from '../../components/TopBar'

const G = { border:'1px solid rgba(245,158,11,0.12)', background:'#0F2040' }

const TYPE_CONFIG = {
  new_legislation:    { icon:'📋', bg:'rgba(59,130,246,0.10)',   text:'#60a5fa', border:'rgba(59,130,246,0.20)',   label:'New Bill',  dot:'bg-blue-400' },
  legislation_closed: { icon:'🔒', bg:'rgba(249,115,22,0.10)',   text:'#fb923c', border:'rgba(249,115,22,0.20)',   label:'Closed',    dot:'bg-orange-400' },
  comment_submitted:  { icon:'✅', bg:'rgba(16,185,129,0.10)',   text:'#34d399', border:'rgba(16,185,129,0.20)',   label:'Comment',   dot:'bg-emerald-400' },
  deadline:           { icon:'⚠️', bg:'rgba(239,68,68,0.10)',    text:'#f87171', border:'rgba(239,68,68,0.20)',    label:'Deadline',  dot:'bg-red-400' },
}
const TABS = [
  { key:'all',               label:'All',       icon:'🔔' },
  { key:'new_legislation',   label:'New Bills', icon:'📋' },
  { key:'comment_submitted', label:'Comments',  icon:'✅' },
  { key:'deadline',          label:'Deadlines', icon:'⚠️' },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('all')

  const fetchNotifs = () => {
    setLoading(true)
    api.get('/notifications/').then(r => setNotifications(r.data.notifications)).finally(() => setLoading(false))
  }
  useEffect(() => {
    fetchNotifs()
    window.dispatchEvent(new Event('notifications-read'))
  }, [])

  const markRead = async id => {
    await api.put(`/notifications/${id}/read`)
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
    window.dispatchEvent(new Event('notifications-read'))
  }
  const markAllRead = async () => {
    await api.put('/notifications/read-all')
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    window.dispatchEvent(new Event('notifications-read'))
  }

  const filtered = tab === 'all' ? notifications : notifications.filter(n => n.type === tab)
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div className="flex h-screen" style={{background:'#0A1628'}}>
      <UserSidebar active="/notifications" />
      <main className="flex-1 overflow-auto" style={{background:'#0A1628'}}>
        <TopBar title="Notifications" subtitle={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'} />
        <div className="p-8 max-w-4xl">

          <div className="flex items-center justify-between mb-5">
            <div className="rounded-2xl p-1.5 flex gap-1 flex-wrap" style={G}>
              {TABS.map(t => {
                const count = t.key === 'all' ? notifications.length : notifications.filter(n => n.type === t.key).length
                const unread = t.key === 'all' ? unreadCount : notifications.filter(n => n.type === t.key && !n.is_read).length
                return (
                  <button key={t.key} onClick={() => setTab(t.key)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={tab === t.key
                      ? {background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}
                      : {color:'rgba(245,158,11,0.50)'}}>
                    <span>{t.icon}</span><span>{t.label}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full font-bold"
                      style={tab === t.key ? {background:'rgba(7,16,32,0.20)'} : {background:'rgba(245,158,11,0.08)', color:'rgba(245,158,11,0.50)'}}>
                      {count}
                    </span>
                    {unread > 0 && tab !== t.key && <span className="w-1.5 h-1.5 bg-red-400 rounded-full" />}
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <button onClick={fetchNotifs} className="btn-secondary text-xs px-4 py-2">↻ Refresh</button>
              {unreadCount > 0 && <button onClick={markAllRead} className="btn-secondary text-xs px-4 py-2">✓ Mark all read</button>}
            </div>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(4)].map((_,i) => (
                <div key={i} className="rounded-2xl p-4 flex gap-4" style={G}>
                  <div className="w-10 h-10 shimmer rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2"><div className="h-4 shimmer w-3/4" /><div className="h-3 shimmer w-1/3" /></div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mb-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>🔔</div>
              <div className="font-display font-bold text-lg" style={{color:'rgba(245,158,11,0.50)'}}>No notifications</div>
              <div className="text-sm mt-1" style={{color:'rgba(245,158,11,0.30)'}}>You're all caught up!</div>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((n,i) => {
                const cfg = TYPE_CONFIG[n.type] || { icon:'🔔', bg:'rgba(245,158,11,0.06)', text:'rgba(245,158,11,0.60)', border:'rgba(245,158,11,0.12)', label:n.type, dot:'bg-amber-400' }
                return (
                  <div key={n.id}
                    className="rounded-2xl p-4 flex items-start gap-4 cursor-pointer transition-all duration-200 fade-up"
                    style={{
                      animationDelay:`${i*30}ms`,
                      background: !n.is_read ? cfg.bg : '#0F2040',
                      border: `1px solid ${!n.is_read ? cfg.border : 'rgba(245,158,11,0.10)'}`,
                    }}
                    onClick={() => !n.is_read && markRead(n.id)}>
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{background:cfg.bg, border:`1px solid ${cfg.border}`}}>
                      {cfg.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-snug" style={{color: !n.is_read ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)', fontWeight: !n.is_read ? '600' : '400'}}>
                        {n.message}
                      </div>
                      <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                        <span className="text-xs" style={{color:'rgba(245,158,11,0.30)'}}>{formatDistanceToNow(parseISO(n.created_at), { addSuffix:true })}</span>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{background:cfg.bg, color:cfg.text, border:`1px solid ${cfg.border}`}}>{cfg.label}</span>
                      </div>
                    </div>
                    {!n.is_read && <div className={`w-2 h-2 ${cfg.dot} rounded-full mt-2 shrink-0 animate-pulse`} />}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
