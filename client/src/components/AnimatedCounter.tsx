import { useEffect, useState } from 'react'
import { motion, useSpring, useTransform } from 'framer-motion'

interface AnimatedCounterProps {
  value: number
  duration?: number
  className?: string
}

export const AnimatedCounter = ({
  value,
  duration = 1,
  className = '',
}: AnimatedCounterProps) => {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 })
  const display = useTransform(spring, (current) =>
    Math.round(current).toLocaleString()
  )

  useEffect(() => {
    spring.set(value)
  }, [value, spring])

  if (!isClient) {
    return <span className={className}>{value.toLocaleString()}</span>
  }

  return <motion.span className={className}>{display}</motion.span>
}
