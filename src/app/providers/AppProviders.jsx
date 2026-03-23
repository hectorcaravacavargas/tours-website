import { ThemeProvider } from '../../features/theme/context/ThemeContext'

export function AppProviders({ children }) {
  return (
    <ThemeProvider>
      {children}
    </ThemeProvider>
  )
}
