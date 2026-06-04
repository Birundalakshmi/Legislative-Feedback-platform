export default function SentimentStrip({ positive=0, negative=0, neutral=0 }) {
  const total = positive+negative+neutral||1
  const pPct = Math.round((positive/total)*100)
  const nPct = Math.round((negative/total)*100)
  const nuPct = 100-pPct-nPct
  return (
    <div>
      <div className="flex rounded-full overflow-hidden h-2.5" style={{background:'rgba(255,255,255,0.05)'}}>
        {pPct>0 && <div className="bg-emerald-500 transition-all" style={{width:`${pPct}%`}} />}
        {nuPct>0 && <div className="bg-slate-600 transition-all" style={{width:`${nuPct}%`}} />}
        {nPct>0 && <div className="bg-red-500 transition-all" style={{width:`${nPct}%`}} />}
      </div>
      <div className="flex gap-4 mt-2 text-xs text-slate-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-emerald-500 rounded-full"/>Positive {positive} ({pPct}%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-slate-600 rounded-full"/>Neutral {neutral} ({nuPct}%)</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-red-500 rounded-full"/>Negative {negative} ({nPct}%)</span>
      </div>
    </div>
  )
}
