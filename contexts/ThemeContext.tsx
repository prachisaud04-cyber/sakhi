'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light' | 'system'
export type ResolvedTheme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  resolvedTheme: ResolvedTheme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>('dark')
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('dark')

  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('sakhi_theme') as Theme | null
      if (stored && (stored === 'dark' || stored === 'light' || stored === 'system')) {
        setThemeState(stored)
      } else {
        setThemeState('dark')
      }
    } catch (e) {
      console.warn('Could not read stored theme:', e)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    const root = document.documentElement

    const applyTheme = (targetTheme: Theme) => {
      let resolved: ResolvedTheme = 'dark'

      if (targetTheme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        resolved = systemPrefersDark ? 'dark' : 'light'
      } else {
        resolved = targetTheme
      }

      setResolvedTheme(resolved)

      if (resolved === 'light') {
        root.classList.remove('dark')
        root.classList.add('light')
        document.body.classList.remove('dark')
        document.body.classList.add('light')
      } else {
        root.classList.remove('light')
        root.classList.add('dark')
        document.body.classList.remove('light')
        document.body.classList.add('dark')
      }
    }

    applyTheme(theme)

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handleChange = () => applyTheme('system')
      mediaQuery.addEventListener('change', handleChange)
      return () => mediaQuery.removeEventListener('change', handleChange)
    }
  }, [theme])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    try {
      localStorage.setItem('sakhi_theme', newTheme)
    } catch (e) {
      console.warn('Could not save theme:', e)
    }
  }

  const toggleTheme = () => {
    const nextTheme: Theme = resolvedTheme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
  }

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
