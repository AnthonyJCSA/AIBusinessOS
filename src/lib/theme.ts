export type ThemeMode = 'dark' | 'light'

export function applyTheme(mode: ThemeMode, accentColor?: string) {
  const root = document.documentElement

  if (mode === 'light') {
    root.classList.add('theme-light')
  } else {
    root.classList.remove('theme-light')
  }

  if (accentColor) {
    root.style.setProperty('--accent', accentColor)
    root.style.setProperty('--accent3', accentColor)
    root.style.setProperty('--gradient', `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`)
  }
}

export function loadThemeFromOrg(org: { settings?: { theme_color?: string; theme_mode?: string } }) {
  const mode = (org?.settings?.theme_mode as ThemeMode) || 'dark'
  const accent = org?.settings?.theme_color
  applyTheme(mode, accent)
}
