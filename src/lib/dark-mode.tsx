"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

// 다크모드/라이트모드 전환을 위한 ThemeProvider
export function DarkModeProvider({ 
  children, 
  ...props 
}: React.ComponentProps<typeof NextThemesProvider>) {
  return (
    <div suppressHydrationWarning>
      <NextThemesProvider {...props}>{children}</NextThemesProvider>
    </div>
  )
} 