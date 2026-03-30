import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ThemeMode = 'system' | 'light' | 'dark';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'ptcg-theme-mode';

@Injectable({
  providedIn: 'root'
})
export class ThemePreferenceService {
  private document = inject(DOCUMENT);
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  private modeSubject = new BehaviorSubject<ThemeMode>(this.getStoredMode());
  private resolvedThemeSubject = new BehaviorSubject<ResolvedTheme>(this.getResolvedTheme(this.modeSubject.value));

  public readonly mode$ = this.modeSubject.asObservable();
  public readonly resolvedTheme$ = this.resolvedThemeSubject.asObservable();

  constructor() {
    this.applyTheme(this.modeSubject.value);
    this.mediaQuery.addEventListener('change', () => {
      if (this.modeSubject.value === 'system') {
        this.applyTheme('system');
      }
    });
  }

  public get mode(): ThemeMode {
    return this.modeSubject.value;
  }

  public get resolvedTheme(): ResolvedTheme {
    return this.resolvedThemeSubject.value;
  }

  public setMode(mode: ThemeMode): void {
    window.localStorage.setItem(STORAGE_KEY, mode);
    this.applyTheme(mode);
  }

  private applyTheme(mode: ThemeMode): void {
    const resolvedTheme = this.getResolvedTheme(mode);
    const root = this.document.documentElement;

    this.modeSubject.next(mode);
    this.resolvedThemeSubject.next(resolvedTheme);
    root.dataset.themeMode = mode;
    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  }

  private getStoredMode(): ThemeMode {
    const storedMode = window.localStorage.getItem(STORAGE_KEY);
    return storedMode === 'light' || storedMode === 'dark' || storedMode === 'system'
      ? storedMode
      : 'system';
  }

  private getResolvedTheme(mode: ThemeMode): ResolvedTheme {
    if (mode === 'light' || mode === 'dark') {
      return mode;
    }
    return this.mediaQuery.matches ? 'dark' : 'light';
  }
}
