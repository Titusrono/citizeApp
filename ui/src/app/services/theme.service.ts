import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';

export type Theme = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'app-theme';
  private currentTheme$ = new BehaviorSubject<Theme>('light');
  public theme$: Observable<Theme> = this.currentTheme$.asObservable();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializeTheme();
    }
  }

  /**
   * Initialize theme from localStorage or fallback default
   */
  private initializeTheme(): void {
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    const theme: Theme = savedTheme === 'dark' || savedTheme === 'light'
      ? savedTheme
      : this.getDefaultTheme();
    this.setTheme(theme);
  }

  /**
   * Resolve first-load default theme
   */
  private getDefaultTheme(): Theme {
    if (!window.matchMedia) return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): Theme {
    return this.currentTheme$.value;
  }

  /**
   * Set theme (light or dark)
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
    this.setTheme(currentTheme === 'light' ? 'dark' : 'light');
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(theme: Theme): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const html = document.documentElement;
    const body = document.body;
    const classesToClear = ['dark', 'light'];

    const apply = (resolved: Theme) => {
      html.classList.remove(...classesToClear);
      body.classList.remove(...classesToClear);
      html.dataset['theme'] = resolved;
      body.dataset['theme'] = resolved;
      html.style.colorScheme = resolved;
      body.style.colorScheme = resolved;

      if (resolved === 'dark') {
        html.classList.add('dark');
        body.classList.add('dark');
      } else {
        html.classList.add('light');
        body.classList.add('light');
      }
    };

    apply(theme);
    // Re-apply on next frame to beat conflicting class mutations
    requestAnimationFrame(() => apply(theme));
  }

  /**
   * Check if dark mode is currently active
   */
  isDarkMode(): boolean {
    if (!isPlatformBrowser(this.platformId)) return false;
    return document.documentElement.classList.contains('dark');
  }

  /**
   * Get the current effective theme
   */
  getEffectiveTheme(): Theme {
    return this.currentTheme$.value;
  }
}
