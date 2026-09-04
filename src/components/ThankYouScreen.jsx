import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'

export function ThankYouScreen({ onViewResults }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const raf = requestAnimationFrame(() => setVisible(true))
    const timer = setTimeout(onViewResults, 1500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(timer)
    }
  }, [onViewResults])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div
        className={`flex flex-col items-center gap-4 transition-all duration-500 ${
          visible ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
        }`}
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sun">
          <Check className="h-8 w-8 text-ink" />
        </div>
        <h1 className="text-2xl font-bold text-ink">תודה! התשובה שלך נשלחה בהצלחה ✓</h1>
        <button
          type="button"
          onClick={onViewResults}
          className="rounded-2xl bg-sun px-6 py-3 font-bold text-ink transition-all hover:bg-sun-dark active:scale-95"
        >
          צפה בתוצאות
        </button>
      </div>
    </div>
  )
}
