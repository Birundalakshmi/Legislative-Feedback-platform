import { Link } from 'react-router-dom'
import { differenceInDays, parseISO, format } from 'date-fns'
import { CATEGORY_COLORS, CATEGORY_ICONS, getStatusBadge, getProgress } from '../utils/helpers'

export default function LegislationCard({ leg, index = 0 }) {
  const daysLeft = leg.end_date ? differenceInDays(parseISO(leg.end_date), new Date()) : null
  const progress = getProgress(leg)
  const cat = CATEGORY_COLORS[leg.category] || CATEGORY_COLORS.Other
  const isClosingSoon = daysLeft !== null && daysLeft <= 3 && daysLeft >= 0 && leg.status === 'Open'

  return (
    <Link to={`/legislation/${leg.id}`}
      className="group rounded-2xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 block fade-up"
      style={{
        background:'#0F2040',
        border:'1px solid rgba(245,158,11,0.12)',
        boxShadow:'0 4px 20px rgba(0,0,0,0.3)',
        animationDelay:`${index*50}ms`
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor='rgba(245,158,11,0.30)'}
      onMouseLeave={e => e.currentTarget.style.borderColor='rgba(245,158,11,0.12)'}>

      <div className={`h-0.5 bg-gradient-to-r ${cat.gradient}`} />

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">{CATEGORY_ICONS[leg.category]||'📄'}</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-lg border ${cat.badge}`}>{leg.category}</span>
          </div>
          {getStatusBadge(leg)}
        </div>

        <h3 className="font-display font-bold text-white group-hover:text-amber-300 transition-colors mb-1 line-clamp-2 leading-snug text-sm">{leg.title}</h3>
        <p className="text-xs font-medium mb-4" style={{color:'rgba(245,158,11,0.4)'}}>{leg.ministry}</p>

        {leg.status === 'Open' && leg.end_date && (
          <div className="mb-4">
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-slate-600">Progress</span>
              <span className={`font-semibold ${isClosingSoon ? 'text-orange-400' : 'text-slate-500'}`}>
                {daysLeft !== null && daysLeft >= 0 ? `${daysLeft}d left` : 'Ended'}
              </span>
            </div>
            <div className="w-full rounded-full h-1.5" style={{background:'rgba(255,255,255,0.06)'}}>
              <div className={`h-1.5 rounded-full bg-gradient-to-r transition-all ${isClosingSoon ? 'from-orange-400 to-amber-500' : cat.gradient}`}
                style={{width:`${progress}%`}} />
            </div>
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span>💬 {leg.comment_count}</span>
            {leg.end_date && <span>{format(parseISO(leg.end_date),'dd MMM yy')}</span>}
          </div>
          <span className={`text-xs font-bold px-3 py-1.5 rounded-xl text-white bg-gradient-to-r ${leg.status==='Open'?cat.gradient:'from-slate-600 to-slate-700'} shadow-sm`}>
            {leg.status==='Open'?'Comment →':'View →'}
          </span>
        </div>
      </div>
    </Link>
  )
}
