import { useEffect, useState } from 'react'

function diff(target) {
  const ms = Math.max(0, target.getTime() - Date.now())
  return {
    done: ms === 0,
    days: Math.floor(ms / 86_400_000),
    hours: Math.floor(ms / 3_600_000) % 24,
    minutes: Math.floor(ms / 60_000) % 60,
    seconds: Math.floor(ms / 1000) % 60,
  }
}

/**
 * Live countdown to `target` (a Date, or null when no launch date is set).
 * Ticks aligned to the wall-clock second and re-syncs when the tab becomes
 * visible again, so mobile browsers that throttle timers stay accurate.
 */
export default function useCountdown(target) {
  const [time, setTime] = useState(() => (target ? diff(target) : null))

  useEffect(() => {
    if (!target) return
    let timer
    const tick = () => {
      const next = diff(target)
      setTime(next)
      if (!next.done) timer = setTimeout(tick, 1000 - (Date.now() % 1000) + 5)
    }
    tick()
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        clearTimeout(timer)
        tick()
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [target])

  return time
}
