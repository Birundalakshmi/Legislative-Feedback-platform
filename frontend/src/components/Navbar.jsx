import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [unread, setUnread] = useState(0)
  const [dropOpen, setDropOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropRef = useRef(null)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', fn)
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    if (!user || user.is_admin) return
    const fetch = () => api.get('/notifications/unread-count').then(r => setUnread(r.data.unread_count)).catch(()=>{})
    fetch()
    const t = setInterval(fetch, 30000)
    return () => clearInterval(t)
  }, [user])

  useEffect(() => {
    const fn = e => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false) }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])

  const isActive = to => location.pathname === to
  const navLinks = [
    { to:'/home', label:'Consultations' },
    { to:'/active', label:'Active' },
    { to:'/my-comments', label:'My Comments' },
  ]

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-xl shadow-md shadow-slate-200/40 border-b border-slate-200' : 'bg-white border-b border-slate-100'}`}>
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">

        {/* Logo — same as AdminSidebar */}
        <Link to={user?(user.is_admin?'/admin':'/home'):'/'} className="flex items-center gap-2.5 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-200">L</div>
          <div className="hidden sm:block">
            <div className="font-display font-bold text-slate-900 text-sm leading-tight">Lawlytics</div>
            <div className="text-[9px] text-slate-400 uppercase tracking-widest leading-tight">Gov. of India</div>
          </div>
        </Link>

        {/* Desktop nav */}
        {user && !user.is_admin && (
          <div className="hidden md:flex items-center bg-slate-100 rounded-2xl p-1 gap-0.5">
            {navLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all duration-200 ${isActive(l.to) ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-800 hover:bg-white/60'}`}>
                {l.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right */}
        <div className="flex items-center gap-2">
          {user && !user.is_admin && (
            <Link to="/notifications" className="relative w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/>
              </svg>
              {unread > 0 && <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">{unread>9?'9+':unread}</span>}
            </Link>
          )}

          {user ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropOpen(!dropOpen)}
                className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 transition-all">
                <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-xs shadow-sm">
                  {user.name[0].toUpperCase()}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-xs font-bold text-slate-800 leading-tight">{user.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-400 capitalize leading-tight">{user.is_admin?'Admin':user.stakeholder_type}</div>
                </div>
                <svg className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropOpen?'rotate-180':''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                </svg>
              </button>

              {dropOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 overflow-hidden fade-in z-50">
                  <div className="bg-gradient-to-r from-indigo-50 to-violet-50 px-4 py-3.5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl flex items-center justify-center text-white font-bold shadow-md">{user.name[0].toUpperCase()}</div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{user.name}</div>
                        <div className="text-xs text-slate-500 truncate max-w-[120px]">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-2">
                    <Link to="/profile" onClick={()=>setDropOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-slate-700 hover:bg-slate-50 transition-all">
                      <span className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-sm">👤</span>
                      View Profile
                    </Link>
                    <button onClick={()=>{logout();navigate('/')}}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-all w-full">
                      <span className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center text-sm">🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn-ghost text-sm py-2 px-4">Sign In</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4">Register</Link>
            </div>
          )}

          {user && !user.is_admin && (
            <button className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-100 transition-colors" onClick={()=>setMobileOpen(!mobileOpen)}>
              <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={mobileOpen?"M6 18L18 6M6 6l12 12":"M4 6h16M4 12h16M4 18h16"}/>
              </svg>
            </button>
          )}
        </div>
      </div>

      {mobileOpen && user && !user.is_admin && (
        <div className="md:hidden bg-white border-t border-slate-100 px-4 py-3 space-y-1 fade-in">
          {navLinks.map(l => (
            <Link key={l.to} to={l.to} onClick={()=>setMobileOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${isActive(l.to)?'bg-indigo-50 text-indigo-600':'text-slate-600 hover:bg-slate-50'}`}>
              {l.label}
            </Link>
          ))}
          <button onClick={()=>{logout();navigate('/')}} className="flex items-center px-4 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 w-full">Sign Out</button>
        </div>
      )}
    </nav>
  )
}
