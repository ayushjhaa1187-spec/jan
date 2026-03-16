import { useEffect, useState } from 'react'

interface CountUpProps {
  target: number
  duration?: number
  suffix?: string
}

export const CountUp = ({ target, duration = 1000, suffix = '' }: CountUpProps) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      setCount(Math.floor(progress * target))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return <span>{count.toLocaleString()}{suffix}</span>
}
