export default function WordCloud({ words=[] }) {
  if (!words.length) return (
    <div className="flex flex-col items-center justify-center py-12" style={{color:'rgba(245,158,11,0.30)'}}>
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-3" style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.10)'}}>☁️</div>
      <div className="font-semibold text-sm" style={{color:'rgba(245,158,11,0.40)'}}>No keyword data available</div>
    </div>
  )
  const vals = words.map(w=>w.value)
  const min = Math.min(...vals), max = Math.max(...vals)
  const colors = ['#F59E0B','#FCD34D','#D97706','#FBBF24','#10B981','#F59E0B','#FDE68A','#D97706','#FBBF24','#10B981']

  return (
    <div className="w-full rounded-2xl p-6 flex flex-wrap gap-2 justify-center items-center min-h-[160px]"
      style={{background:'rgba(245,158,11,0.03)', border:'1px solid rgba(245,158,11,0.08)'}}>
      {words.map((w,i) => {
        const ratio = max===min ? 0.5 : (w.value-min)/(max-min)
        const size = 12+ratio*32
        const weight = ratio>0.6?'800':ratio>0.3?'700':'600'
        return (
          <span key={i} className="cursor-default select-none transition-all duration-200 hover:scale-110"
            style={{fontSize:`${size}px`, fontWeight:weight, display:'inline-block', lineHeight:1.4, color:colors[i%colors.length], opacity:0.7+ratio*0.3}}
            title={`${w.text}: ${w.value}`}>
            {w.text}
          </span>
        )
      })}
    </div>
  )
}
