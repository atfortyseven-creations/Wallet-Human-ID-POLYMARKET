"use client"

import { useUIStore } from "@/lib/store/ui-store"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

interface StealthTextProps {
  children: React.ReactNode
  className?: string
  behavior?: "blur" | "mask" | "hide"
}

export function StealthText({ children, className, behavior = "blur" }: StealthTextProps) {
  const { isStealthMode } = useUIStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <span className={className}>{children}</span>
  }

  if (isStealthMode) {
    if (behavior === "mask") {
      return <span className={className}>******</span>
    }
    
    if (behavior === "hide") {
      return null
    }

    // Default to blur
    return (
      <span className={cn("filter blur-md select-none transition-all duration-300", className)}>
        {children}
      </span>
    )
  }

  return (
    <span className={cn("transition-all duration-300", className)}>
      {children}
    </span>
  )
}

