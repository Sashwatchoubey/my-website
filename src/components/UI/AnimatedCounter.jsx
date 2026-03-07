import { useEffect, useRef, useState } from 'react'
import { clamp } from '../../utils/helpers'

/**
 * Animated counter that counts up from 0 to `target` over `duration` ms.
 */
export default function AnimatedCounter({ target, duration = 1500, prefix = '', suffix = '', decimals = 0 }) {
  const [current, setCurrent] = useState(0)
  const raf = useRef(null)
  const start = useRef(null)

  useEffect(() => {
    start.current = null
    const step = (timestamp) => {
      if (!start.current) start.current = timestamp
      const elapsed = timestamp - start.current
      const progress = clamp(elapsed / duration, 0, 1)
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(eased * target)
      if (progress < 1) raf.current = requestAnimationFrame(step)
    }
    raf.current = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf.current)
  }, [target, duration])

  const formatted = current.toLocaleString('en-IN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <span>
      {prefix}{formatted}{suffix}
    </span>
  )
}
