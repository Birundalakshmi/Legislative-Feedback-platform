import { differenceInDays, parseISO } from 'date-fns'

export const CATEGORY_COLORS = {
  Technology:       { gradient:'from-blue-500 to-cyan-500',    badge:'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  Education:        { gradient:'from-amber-500 to-yellow-500',  badge:'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  Environment:      { gradient:'from-emerald-500 to-teal-500', badge:'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  Health:           { gradient:'from-rose-500 to-pink-500',    badge:'bg-rose-500/15 text-rose-300 border-rose-500/25' },
  Finance:          { gradient:'from-amber-500 to-orange-500', badge:'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  Agriculture:      { gradient:'from-lime-500 to-green-500',   badge:'bg-lime-500/15 text-lime-300 border-lime-500/25' },
  Infrastructure:   { gradient:'from-orange-500 to-amber-600', badge:'bg-orange-500/15 text-orange-300 border-orange-500/25' },
  'Social Welfare': { gradient:'from-pink-500 to-rose-500',    badge:'bg-pink-500/15 text-pink-300 border-pink-500/25' },
  Defence:          { gradient:'from-slate-500 to-gray-600',   badge:'bg-slate-500/20 text-slate-300 border-slate-500/30' },
  Other:            { gradient:'from-amber-500 to-yellow-500', badge:'bg-amber-500/15 text-amber-300 border-amber-500/25' },
}

export const CATEGORY_ICONS = {
  Technology:'💻', Education:'📚', Environment:'🌿', Health:'🏥',
  Finance:'💰', Agriculture:'🌾', Infrastructure:'🏗️',
  'Social Welfare':'🤝', Defence:'🛡️', Other:'📄',
}

export const CATEGORY_GRADIENTS = Object.fromEntries(Object.entries(CATEGORY_COLORS).map(([k,v])=>[k,v.gradient]))
export const CATEGORY_BADGE_COLORS = Object.fromEntries(Object.entries(CATEGORY_COLORS).map(([k,v])=>[k,v.badge]))

export function getStatusBadge(leg) {
  if (leg.status === 'Closed') return <span className="badge-closed">● Closed</span>
  if (leg.status === 'Draft')  return <span className="badge-draft">● Draft</span>
  const d = leg.end_date ? differenceInDays(parseISO(leg.end_date), new Date()) : null
  if (d !== null && d <= 3 && d >= 0)
    return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/15 text-orange-400 border border-orange-500/25"><span className="w-1.5 h-1.5 bg-orange-400 rounded-full animate-ping"/>Closing Soon</span>
  return <span className="badge-open"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"/>Open</span>
}

export function getSentimentBadge(sentiment, confidence) {
  const conf = confidence !== undefined ? ` ${Math.round(confidence*100)}%` : ''
  if (sentiment === 'positive') return <span className="badge-positive"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"/>↑ Positive{conf && <span className="opacity-60">{conf}</span>}</span>
  if (sentiment === 'negative') return <span className="badge-negative"><span className="w-1.5 h-1.5 bg-red-400 rounded-full"/>↓ Negative{conf && <span className="opacity-60">{conf}</span>}</span>
  return <span className="badge-neutral"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full"/>→ Neutral{conf && <span className="opacity-60">{conf}</span>}</span>
}

export function getProgress(leg) {
  if (!leg.start_date || !leg.end_date) return 0
  const total = differenceInDays(parseISO(leg.end_date), parseISO(leg.start_date))
  const elapsed = differenceInDays(new Date(), parseISO(leg.start_date))
  return Math.min(100, Math.max(0, Math.round((elapsed/total)*100)))
}
