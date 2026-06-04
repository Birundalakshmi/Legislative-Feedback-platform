import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden" style={{background:'#0A1628', color:'white'}}>

      {/* Navbar */}
      <header className="fixed top-0 inset-x-0 z-50" style={{background:'rgba(10,22,40,0.90)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(245,158,11,0.10)'}}>
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#071020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 8h14"/>
                <path d="M5 8L3 13h4L5 8z"/><path d="M19 8l-2 5h4l-2-5z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white">Lawlytics</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-medium px-4 py-2 transition-colors" style={{color:'rgba(245,158,11,0.6)'}}
              onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.6)'}>Sign In</Link>
            <Link to="/register" className="btn-primary text-sm px-5 py-2.5">Get Started</Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full blur-[120px]" style={{background:'rgba(245,158,11,0.06)'}} />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px]" style={{background:'rgba(245,158,11,0.04)'}} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{backgroundImage:'linear-gradient(rgba(245,158,11,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(245,158,11,0.5) 1px, transparent 1px)', backgroundSize:'60px 60px'}} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <h1 className="font-display text-6xl md:text-7xl lg:text-8xl font-bold leading-[1.0] mb-8">
            <span className="text-white">Where Citizens</span>
            <br />
            <span className="gold-text">Shape India's Laws</span>
          </h1>

          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed" style={{color:'rgba(255,255,255,0.40)'}}>
            Submit feedback on bills, comment on specific provisions, and let our AI surface insights for policymakers — all in one transparent platform.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mb-20">
            <Link to="/register" className="btn-primary text-base px-8 py-4 rounded-2xl">
              Start Participating Free →
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-base px-8 py-4 rounded-2xl font-semibold transition-all"
              style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.20)', color:'rgba(245,158,11,0.8)'}}>
              Sign In
            </Link>
          </div>
        </div>


      </section>

      {/* Mock UI */}
      <section className="py-20 relative overflow-hidden">
        <div className="relative max-w-5xl mx-auto px-6">
          <div className="relative">
            <div className="absolute inset-0 rounded-3xl blur-3xl scale-95" style={{background:'rgba(245,158,11,0.08)'}} />
            <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{background:'#071020', border:'1px solid rgba(245,158,11,0.15)'}}>
              <div className="flex items-center gap-3 px-5 py-3.5" style={{borderBottom:'1px solid rgba(245,158,11,0.08)', background:'rgba(245,158,11,0.03)'}}>
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
                </div>
              </div>
              <div className="p-6 grid md:grid-cols-3 gap-4">
                {[
                  { title:'Digital Personal Data Protection Bill', cat:'Technology', status:'Open', comments:342, gradient:'from-blue-500 to-cyan-500' },
                  { title:'National Education Policy Amendment', cat:'Education', status:'Open', comments:218, gradient:'from-amber-500 to-yellow-500' },
                  { title:'Clean Energy Transition Framework', cat:'Environment', status:'Closing Soon', comments:567, gradient:'from-emerald-500 to-teal-500' },
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden cursor-pointer group transition-all"
                    style={{background:'rgba(245,158,11,0.04)', border:'1px solid rgba(245,158,11,0.10)'}}
                    onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.25)'}
                    onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.10)'}>
                    <div className={`h-0.5 bg-gradient-to-r ${item.gradient}`} />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2 py-0.5 rounded-lg" style={{background:'rgba(245,158,11,0.10)', color:'rgba(245,158,11,0.7)', border:'1px solid rgba(245,158,11,0.15)'}}>{item.cat}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${item.status==='Open'?'bg-emerald-500/15 text-emerald-400':'bg-orange-500/15 text-orange-400'}`}>{item.status}</span>
                      </div>
                      <div className="font-display font-bold text-sm leading-snug mb-3 group-hover:text-amber-300 transition-colors" style={{color:'rgba(255,255,255,0.80)'}}>{item.title}</div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs" style={{color:'rgba(255,255,255,0.25)'}}>💬 {item.comments}</span>
                        <span className={`text-xs font-bold text-white px-2.5 py-1 rounded-lg bg-gradient-to-r ${item.gradient}`}>Comment →</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-6 pb-6">
                <div className="rounded-2xl p-4 flex items-center gap-4" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.15)'}}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>🤖</div>
                  <div className="flex-1">
                    <div className="text-xs font-bold mb-1" style={{color:'rgba(245,158,11,0.7)'}}>AI Sentiment Analysis — Live</div>
                    <div className="flex gap-2">
                      <div className="flex-1 rounded-full h-1.5" style={{background:'rgba(255,255,255,0.05)'}}><div className="bg-emerald-400 h-1.5 rounded-full" style={{width:'68%'}} /></div>
                      <div className="flex-1 rounded-full h-1.5" style={{background:'rgba(255,255,255,0.05)'}}><div className="bg-slate-400 h-1.5 rounded-full" style={{width:'22%'}} /></div>
                      <div className="flex-1 rounded-full h-1.5" style={{background:'rgba(255,255,255,0.05)'}}><div className="bg-red-400 h-1.5 rounded-full" style={{width:'10%'}} /></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-28 relative" style={{background:'#071020'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.20)'}}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{color:'rgba(245,158,11,0.7)'}}>How It Works</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Three steps to impact</h2>
            <p className="max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.35)'}}>From registration to real policy influence in under 5 minutes.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { n:'01', icon:'📝', title:'Register Free', desc:'Create your account in 60 seconds. Choose your stakeholder type — citizen, legal, NGO, academic or industry.' },
              { n:'02', icon:'🔍', title:'Browse Bills', desc:'Explore open consultations across all ministries. Filter by category, deadline or ministry name.' },
              { n:'03', icon:'💬', title:'Submit Feedback', desc:'Comment on specific provisions. AI instantly analyses sentiment and generates summaries for policymakers.' },
            ].map((s, i) => (
              <div key={i} className="relative rounded-3xl p-8 overflow-hidden group transition-all duration-300"
                style={{background:'#0A1628', border:'1px solid rgba(245,158,11,0.10)'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.25)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.10)'}>
                <div className="absolute top-5 right-5 font-display text-7xl font-black select-none leading-none" style={{color:'rgba(245,158,11,0.04)'}}>{s.n}</div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 shadow-lg" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)', color:'#071020'}}>{s.icon}</div>
                <h3 className="font-display text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{color:'rgba(255,255,255,0.35)'}}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who can participate */}
      <section className="py-28" style={{background:'#0A1628'}}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-5" style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.20)'}}>
              <span className="text-xs font-bold uppercase tracking-widest" style={{color:'rgba(245,158,11,0.7)'}}>Participants</span>
            </div>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">Open to every voice</h2>
            <p style={{color:'rgba(255,255,255,0.35)'}}>Anyone can participate — from individual citizens to legal professionals and NGOs.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { icon:'👤', label:'Individual Citizen' },
              { icon:'⚖️', label:'Legal Professional' },
              { icon:'🏭', label:'Industry Body' },
              { icon:'🤝', label:'NGO / Civil Society' },
              { icon:'🎓', label:'Academic / Research' },
            ].map((s, i) => (
              <div key={i} className="rounded-2xl p-6 text-center hover:-translate-y-1 transition-all duration-300 group cursor-default"
                style={{background:'#071020', border:'1px solid rgba(245,158,11,0.10)'}}
                onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.30)'}
                onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(245,158,11,0.10)'}>
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform inline-block">{s.icon}</div>
                <div className="text-sm font-semibold" style={{color:'rgba(255,255,255,0.60)'}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 relative overflow-hidden" style={{background:'#071020'}}>
        <div className="absolute inset-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-3xl" style={{background:'rgba(245,158,11,0.06)'}} />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{backgroundImage:'radial-gradient(circle, rgba(245,158,11,0.8) 1px, transparent 1px)', backgroundSize:'30px 30px'}} />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-5xl md:text-6xl font-bold text-white mb-5 leading-tight">
            Your opinion<br />
            <span className="gold-text">deserves to be heard</span>
          </h2>
          <p className="text-lg mb-10 max-w-xl mx-auto" style={{color:'rgba(255,255,255,0.35)'}}>
            Join thousands of citizens already shaping India's legislative future.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base px-10 py-4 rounded-2xl">Create Free Account →</Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-base px-10 py-4 rounded-2xl font-semibold transition-all"
              style={{background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.20)', color:'rgba(245,158,11,0.8)'}}>
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10" style={{borderTop:'1px solid rgba(245,158,11,0.10)'}}>
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:'linear-gradient(135deg,#F59E0B,#D97706)'}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#071020" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v18"/><path d="M8 21h8"/><path d="M5 8h14"/>
                <path d="M5 8L3 13h4L5 8z"/><path d="M19 8l-2 5h4l-2-5z"/>
              </svg>
            </div>
            <span className="font-display font-bold text-white text-sm">Lawlytics</span>
          </div>
          <div className="text-sm" style={{color:'rgba(245,158,11,0.25)'}}>© 2024 Lawlytics — Government of India. All rights reserved.</div>
          <div className="flex gap-5 text-sm">
            <Link to="/login" className="transition-colors" style={{color:'rgba(245,158,11,0.35)'}}
              onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.35)'}>Sign In</Link>
            <Link to="/register" className="transition-colors" style={{color:'rgba(245,158,11,0.35)'}}
              onMouseEnter={e=>e.currentTarget.style.color='#F59E0B'}
              onMouseLeave={e=>e.currentTarget.style.color='rgba(245,158,11,0.35)'}>Register</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
