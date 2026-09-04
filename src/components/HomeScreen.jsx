import { CalendarCheck, ChevronLeft, Plus } from 'lucide-react'
import { describeActivitySchedule } from '../lib/activityUtils'
import { Badge } from './shared'

export function HomeScreen({ onCreate, activities, onOpenActivity }) {
  const activityList = Object.values(activities).sort((a, b) => b.createdAt - a.createdAt)

  return (
    <div className="home-notebook-bg flex min-h-screen flex-col items-center gap-10 px-4 py-16 text-center">
      <div dir="rtl" className="logo-handwriting flex items-center justify-center text-[10.8rem] sm:text-[13.5rem]">
        <span className="logo-first">פלא</span>
        <svg viewBox="0 0 100 100" className="v-checkmark" aria-hidden="true">
          <path
            d="M20 55 L42 76 L82 24"
            fill="none"
            stroke="#111111"
            strokeWidth="16"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M20 55 L42 76 L82 24"
            fill="none"
            stroke="#FFD600"
            strokeWidth="9"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span>ר</span>
      </div>
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-ink sm:h-24 sm:w-24">
            <CalendarCheck className="h-10 w-10 text-sun sm:h-12 sm:w-12" />
          </div>
          <h1 className="text-4xl font-bold text-ink sm:text-5xl">ניהול פעילויות</h1>
          <p className="max-w-md text-lg text-ink/60">
            צרו פעילות, שתפו קישור עם משתתפים, ועקבו אחרי מי מאשר ומי לא — הכל במקום אחד.
          </p>
        </div>
        <button
          type="button"
          onClick={onCreate}
          className="flex items-center gap-2 rounded-2xl bg-sun px-10 py-5 text-xl font-bold text-ink shadow-md transition-all hover:bg-sun-dark active:scale-95"
        >
          <Plus className="h-7 w-7" />
          צור פעילות חדשה
        </button>

        {activityList.length > 0 && (
          <div className="w-full max-w-md text-right">
            <h2 className="mb-3 text-lg font-bold text-ink">הפעילויות שלי</h2>
            <ul className="flex flex-col gap-3">
              {activityList.map((activity) => (
                <li key={activity.id}>
                  <button
                    type="button"
                    onClick={() => onOpenActivity(activity.id)}
                    className="flex w-full items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-paper px-4 py-3 text-right shadow-sm transition-all hover:border-sun"
                  >
                    <div className="flex min-w-0 flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-bold text-ink">{activity.name}</span>
                        {activity.status === 'cancelled' && <Badge tone="outline">בוטלה</Badge>}
                        {activity.status === 'confirmed' && <Badge>מאושרת</Badge>}
                      </div>
                      <span className="truncate text-xs text-ink/50">
                        {describeActivitySchedule(activity)}
                      </span>
                    </div>
                    <ChevronLeft className="h-5 w-5 shrink-0 text-ink/40" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
