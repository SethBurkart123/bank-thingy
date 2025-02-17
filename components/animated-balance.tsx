'use client'

import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"

interface AnimatedBalanceProps {
  value: number
  className?: string
}

export function AnimatedBalance({ value, className = "" }: AnimatedBalanceProps) {
  // Convert balance to string with 2 decimal places
  const formattedValue = value.toFixed(2)
  const [prevValue, setPrevValue] = useState(formattedValue)
  
  useEffect(() => {
    setPrevValue(formattedValue)
  }, [formattedValue])

  // Split the value into individual characters
  const chars = formattedValue.split('')
  const prevChars = prevValue.split('')

  return (
    <div className={`flex font-mono tabular-nums leading-none tracking-tighter ${className}`}>
      <div className="w-[0.6em] flex justify-center">$</div>
      {chars.map((char, i) => {
        const prevChar = prevChars[i] || char
        const isNumber = !isNaN(Number(char))
        
        // Adjust width for period
        const width = char === '.' ? '0.4em' : '0.52em'

        return (
          <div 
            key={i} 
            className="relative overflow-hidden flex justify-center"
            style={{ width }}
          >
            <AnimatePresence initial={false}>
              <motion.span
                key={char}
                initial={{ 
                  y: isNumber ? (Number(char) > Number(prevChar) ? 100 : -100) : 0,
                  opacity: 0 
                }}
                animate={{ 
                  y: 0,
                  opacity: 1 
                }}
                exit={{ 
                  y: isNumber ? (Number(char) > Number(prevChar) ? -100 : 100) : 0,
                  opacity: 0 
                }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30
                }}
                className="absolute flex items-center justify-center"
              >
                {char}
              </motion.span>
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
