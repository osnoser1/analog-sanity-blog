import { DestroyRef, inject, Injectable, PLATFORM_ID } from '@angular/core';

import {
  BehaviorSubject,
  Observable,
  combineLatest,
  fromEvent,
  timer,
  NEVER,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
} from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

export type RevalidateState = 'hit' | 'stale' | 'refresh' | 'inflight';

@Injectable({ providedIn: 'root' })
export class RevalidateService {
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private revalidateState$ = new BehaviorSubject<RevalidateState>('hit');
  private online$ = new BehaviorSubject(false);
  private visibilityState$!: Observable<DocumentVisibilityState>;
  private readonly shouldPause$!: Observable<boolean>;
  private refreshInterval$ = new BehaviorSubject(0);

  constructor() {
    if (this.isBrowser) {
      this.setupOnlineListener();
      this.visibilityState$ = this.createVisibilityState$();
      this.shouldPause$ = this.createShouldPause$();
      this.setupStateManagement();
    }
  }

  private setupOnlineListener() {
    this.online$.next(navigator.onLine);
    fromEvent(window, 'online')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.online$.next(true));

    fromEvent(window, 'offline')
      .pipe(takeUntilDestroyed())
      .subscribe(() => this.online$.next(false));
  }

  private createVisibilityState$(): Observable<DocumentVisibilityState> {
    return new Observable<DocumentVisibilityState>((observer) => {
      const onVisibilityChange = () => observer.next(document.visibilityState);
      document.addEventListener('visibilitychange', onVisibilityChange);
      onVisibilityChange(); // Initial value
      return () =>
        document.removeEventListener('visibilitychange', onVisibilityChange);
    }).pipe(shareReplay(1));
  }

  private createShouldPause$(): Observable<boolean> {
    return combineLatest([this.online$, this.visibilityState$]).pipe(
      map(
        ([online, visibilityState]) => !online || visibilityState === 'hidden',
      ),
      shareReplay(1),
    );
  }

  private setupStateManagement() {
    // Handle window focus
    fromEvent(window, 'focus')
      .pipe(
        filter(() => this.revalidateState$.value === 'hit'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.revalidateState$.next('stale'));

    // Handle refresh interval
    this.refreshInterval$
      .pipe(
        switchMap((interval) =>
          interval > 0 ? timer(interval, interval) : NEVER,
        ),
        filter(() => this.revalidateState$.value === 'hit'),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.revalidateState$.next('stale'));

    // Handle shouldPause changes
    this.shouldPause$
      .pipe(distinctUntilChanged(), takeUntilDestroyed())
      .subscribe((shouldPause) => {
        const currentState = this.revalidateState$.value;
        if (shouldPause && currentState === 'hit') {
          this.revalidateState$.next('stale');
        } else if (!shouldPause && currentState === 'stale') {
          this.revalidateState$.next('refresh');
        }
      });
  }

  setupRevalidate(refreshInterval: number): Observable<RevalidateState> {
    this.refreshInterval$.next(refreshInterval);
    return this.revalidateState$.asObservable();
  }

  startRefresh(): () => void {
    this.revalidateState$.next('inflight');
    return () => this.revalidateState$.next('hit');
  }

  getRevalidateState(): Observable<RevalidateState> {
    return this.revalidateState$.asObservable();
  }
}
