import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark' | 'system';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private currentTheme$ = new BehaviorSubject<Theme>('system');
  public theme$: Observable<Theme> = this.currentTheme$.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
      this.listenToSystemThemeChanges();
    }
  }

  /**
   * Initialize theme from localStorage or default to system
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY) as Theme | null;
    const theme = savedTheme || 'system';
    this.setTheme(theme);
  }

  /**
   * Listen to system theme preference changes
   */
  private listenToSystemThemeChanges(): void {
    if (!window.matchMedia) return;

    const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    darkModeQuery.addEventListener('change', (e) => {
      if (this.currentTheme$.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  /**
   * Set theme (light, dark, or system)
   */
  setTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.currentTheme$.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    this.applyTheme(theme);
  }

  /**
   * Toggle between light and dark themes
   */
  toggleTheme(): void {
    const currentTheme = this.currentTheme$.value;
    console.log('Toggling theme from:', currentTheme);
    
    if (currentTheme === 'system') {
      // If on system, switch to light
      this.setTheme('light');
    } else if (currentTheme === 'light') {
      // If light, switch to dark
      this.setTheme('dark');
    } else {
      // If dark, switch to system
      this.setTheme('system');
    }
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    // Always apply theme class to <html> element for global Tailwind dark mode
    const html = document.documentElement;
    html.classList.remove('dark', 'light');

    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        html.classList.add('dark');
      }
      // If not dark, do not add any class (light is default)
      // Safety: ensure sidebar and all content respond to <html>.dark
      setTimeout(() => {
        if (theme === 'system' && prefersDark && !html.classList.contains('dark')) {
          html.classList.add('dark');
        }
      }, 10);
      console.log('Theme applied (system):', prefersDark ? 'dark' : 'light', 'Classes:', html.classList.value);
    } else if (theme === 'dark') {
      html.classList.add('dark');
      setTimeout(() => {
        if (!html.classList.contains('dark')) {
          html.classList.add('dark');
        }
      }, 10);
      console.log('Theme applied: dark', 'Classes:', html.classList.value);
    } else {
      // For light, do not add any class (light is default)
      setTimeout(() => {
        html.classList.remove('dark');
      }, 10);
      console.log('Theme applied: light', 'Classes:', html.classList.value);
    }
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Get the effective theme (resolves 'system' to actual theme)
   */
  getEffectiveTheme(): 'light' | 'dark' {
    const theme = this.currentTheme$.value;
    
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    return theme;
  }
}
