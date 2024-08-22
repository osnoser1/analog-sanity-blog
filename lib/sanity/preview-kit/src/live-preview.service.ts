import { Injectable, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  forkJoin,
  from,
  Observable,
  Subject,
} from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { LRUCache } from 'lru-cache';
import { applyPatch } from 'mendoza';
import { vercelStegaSplit } from '@vercel/stega';
import { applySourceDocuments } from '@sanity/client/csm';
import { LIVE_PREVIEW_REFRESH_INTERVAL, SANITY_CLIENT_FACTORY } from './tokens';
import {
  QuerySnapshot,
  QuerySubscription,
  QueryCacheKey,
  QueryOptions,
} from './types';
import {
  ContentSourceMap,
  QueryParams,
  SanityDocument,
  MutationEvent,
  InitializedClientConfig,
  type SanityClient,
} from '@sanity/client';
import { RevalidateService, RevalidateState } from './revalidate.service';
import { isPlatformBrowser } from '@angular/common';
import { UseDocumentsInUse } from '@limitless-angular/sanity/preview-kit-compat';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

const DEFAULT_TAG = 'sanity.preview-kit';

function getTurboCacheKey(
  projectId: string,
  dataset: string,
  _id: string,
): `${string}-${string}-${string}` {
  return `${projectId}-${dataset}-${_id}`;
}

/** @internal */
function getQueryCacheKey(query: string, params: QueryParams): QueryCacheKey {
  return `${query}-${JSON.stringify(params)}`;
}

@Injectable()
export class LivePreviewService {
  private client!: SanityClient;
  private clientFactory = inject(SANITY_CLIENT_FACTORY);
  private destroyRef = inject(DestroyRef);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private refreshInterval = inject(LIVE_PREVIEW_REFRESH_INTERVAL);
  private revalidateService = inject(RevalidateService);
  private useDocumentsInUse = inject(UseDocumentsInUse);

  private config!: Required<InitializedClientConfig>;
  private snapshots = new Map<
    QueryCacheKey,
    BehaviorSubject<QuerySnapshot<unknown>>
  >();
  private queryParamsCache = new Map<
    string,
    { query: string; params: QueryParams; refCount: number }
  >();
  private documentsCache!: LRUCache<string, SanityDocument>;
  private documentsInUse = new Map<
    string,
    ContentSourceMap['documents'][number]
  >();
  private lastMutatedDocumentId$ = new BehaviorSubject<string | null>(null);
  private subscriptions = new Subject<QuerySubscription>();
  private turboIds = new BehaviorSubject<string[]>([]);
  private isInitialized = false;

  initialize(token: string): void {
    if (this.isInitialized) {
      console.warn('LiveStoreService is already initialized');
      return;
    }

    const client = this.clientFactory({ token });
    const { requestTagPrefix, resultSourceMap } = client.config();

    this.client = client.withConfig({
      requestTagPrefix: requestTagPrefix ?? DEFAULT_TAG,
      resultSourceMap:
        resultSourceMap === 'withKeyArraySelector'
          ? 'withKeyArraySelector'
          : true,
      // Set the recommended defaults, this is a convenience to make it easier to share a client config from a server component to the client component
      ...(token && {
        token,
        useCdn: false,
        perspective: 'previewDrafts',
        ignoreBrowserTokenWarning: true,
      }),
    });
    this.config = this.client.config() as Required<InitializedClientConfig>;

    this.documentsCache = new LRUCache<string, SanityDocument>({ max: 500 });

    if (this.isBrowser) {
      this.useDocumentsInUse.initialize(this.config);
      this.setupSubscriptions();
      this.setupTurboUpdates();
      this.loadMissingDocuments();
      this.setupRefreshCycle();
      this.setupSourceMapUpdates();
    }

    this.isInitialized = true;
  }

  private checkInitialization(): void {
    if (!this.isInitialized) {
      throw new Error(
        'LiveStoreService is not initialized. Call initialize(token) first.',
      );
    }
  }

  private setupSubscriptions() {
    this.subscriptions
      .pipe(
        distinctUntilChanged(
          (prev, curr) =>
            prev.query === curr.query &&
            JSON.stringify(prev.params) === JSON.stringify(curr.params),
        ),
        tap(({ query, params }) => {
          const key = getQueryCacheKey(query, params);
          if (!this.snapshots.has(key)) {
            this.snapshots.set(
              key,
              new BehaviorSubject<QuerySnapshot<unknown>>({
                result: null,
                resultSourceMap: {} as ContentSourceMap,
              }),
            );
          }
        }),
        switchMap(({ query, params }) =>
          this.fetchAndUpdateSnapshot(query, params),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchAndUpdateSnapshot(
    query: string,
    params: QueryParams,
  ): Observable<void> {
    return from(
      this.client
        .fetch<{
          result: unknown;
          resultSourceMap: ContentSourceMap;
        }>(query, params, { filterResponse: false })
        .then(({ result, resultSourceMap }) => {
          const key = getQueryCacheKey(query, params);
          const snapshot = this.snapshots.get(key);
          if (snapshot) {
            snapshot.next({
              result: this.turboChargeResultIfSourceMap(
                result,
                resultSourceMap,
              ),
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              resultSourceMap: resultSourceMap ?? ({} as ContentSourceMap),
            });
          }

          return resultSourceMap;
        }),
    ).pipe(
      tap((resultSourceMap) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.updateTurboIds(resultSourceMap!);
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.updateDocumentsInUse(resultSourceMap!);
      }),
      map(() => undefined),
    );
  }

  private refreshAllSnapshots(): Observable<void> {
    const refreshObservables = Array.from(this.snapshots.entries())
      .filter(([key]) => this.queryParamsCache.has(key))
      .map(([key]) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const { query, params } = this.queryParamsCache.get(key)!;
        return this.fetchAndUpdateSnapshot(query, params);
      });

    return forkJoin(refreshObservables).pipe(map(() => undefined));
  }

  private updateTurboIds(resultSourceMap: ContentSourceMap) {
    if (resultSourceMap?.documents?.length) {
      const newIds = resultSourceMap.documents.map((doc) => doc._id);
      this.turboIds.next([
        ...new Set([...this.turboIds.getValue(), ...newIds]),
      ]);
    }
  }

  private updateDocumentsInUse(resultSourceMap: ContentSourceMap) {
    if (resultSourceMap?.documents?.length) {
      for (const document of resultSourceMap.documents) {
        this.documentsInUse.set(document._id, document);
      }

      this.useDocumentsInUse.updateDocumentsInUse(this.documentsInUse);
    }
  }

  private turboChargeResultIfSourceMap(
    result: unknown,
    resultSourceMap?: ContentSourceMap,
  ): unknown {
    if (!resultSourceMap) {
      return result;
    }

    return applySourceDocuments(
      result,
      resultSourceMap,
      (sourceDocument) => {
        if (sourceDocument._projectId) {
          console.warn(
            'Cross dataset references are not supported yet, ignoring source document',
            sourceDocument,
          );
          return undefined;
        }
        return this.documentsCache.get(
          `${this.config.projectId}-${this.config.dataset}-${sourceDocument._id}`,
        );
      },
      (changedValue: any, { previousValue }) => {
        if (
          typeof changedValue === 'string' &&
          typeof previousValue === 'string'
        ) {
          const { encoded } = vercelStegaSplit(previousValue);
          const { cleaned } = vercelStegaSplit(changedValue);
          return `${encoded}${cleaned}`;
        }
        return changedValue;
      },
      'previewDrafts',
    );
  }

  listenQuery<T>(
    query: string,
    params: QueryParams,
    options: QueryOptions<T> = {},
  ): Observable<T> {
    this.checkInitialization();

    const key = getQueryCacheKey(query, params);
    let snapshot = this.snapshots.get(key) as
      | BehaviorSubject<QuerySnapshot<T>>
      | undefined;

    if (!snapshot) {
      snapshot = new BehaviorSubject<QuerySnapshot<T>>({
        result: options.initialSnapshot ?? (null as unknown as T),
        resultSourceMap: {} as ContentSourceMap,
      });
      this.snapshots.set(
        key,
        snapshot as BehaviorSubject<QuerySnapshot<unknown>>,
      );

      let cacheEntry = this.queryParamsCache.get(key);
      if (!cacheEntry) {
        cacheEntry = { query, params, refCount: 0 };
        this.queryParamsCache.set(key, cacheEntry);
      }

      cacheEntry.refCount++;
    }

    // Ensure we add the query to the subscriptions
    this.subscriptions.next({ query, params });

    return this.revalidateService.getRevalidateState().pipe(
      tap(console.log),
      switchMap((state) =>
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        this.handleRevalidateState(state, query, params, snapshot!),
      ),
      map((snapshot) => snapshot.result),
      distinctUntilChanged(),
      shareReplay(1),
      takeUntilDestroyed(this.destroyRef),
      tap(() => this.cacheCleanup(key)),
    );
  }

  private fetchQuery(query: string, params: QueryParams): Observable<void> {
    return from(
      this.client.fetch(query, params, { filterResponse: false }),
    ).pipe(
      tap(({ result, resultSourceMap }) => {
        const key = getQueryCacheKey(query, params);
        const snapshot = this.snapshots.get(key);
        if (snapshot) {
          snapshot.next({
            result: this.turboChargeResultIfSourceMap(result, resultSourceMap),
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            resultSourceMap: resultSourceMap!,
          });
        }
      }),
      map(() => undefined),
    );
  }

  private handleRevalidateState<T>(
    state: RevalidateState,
    query: string,
    params: QueryParams,
    snapshot: BehaviorSubject<QuerySnapshot<T>>,
  ): Observable<QuerySnapshot<T>> {
    if (state === 'refresh' || state === 'stale') {
      return this.fetchQuery(query, params).pipe(
        tap(() => {
          const endRefresh = this.revalidateService.startRefresh();
          endRefresh(); // Call immediately after fetch is complete
        }),
        switchMap(() => snapshot.asObservable()),
      );
    }
    return snapshot.asObservable();
  }

  private setupTurboUpdates() {
    this.client
      .listen(
        '*',
        {},
        {
          events: ['mutation'],
          effectFormat: 'mendoza',
          includePreviousRevision: false,
          includeResult: false,
          tag: 'turbo',
        },
      )
      .pipe(
        filter(
          (update): update is MutationEvent =>
            update.type === 'mutation' &&
            (update.effects?.apply?.length ?? 0) > 0,
        ),
        tap((update) => {
          const key = getTurboCacheKey(
            this.config.projectId,
            this.config.dataset,
            update.documentId,
          );
          const cachedDocument = this.documentsCache.get(key);
          if (cachedDocument) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const patchDoc = { ...cachedDocument } as any;
            delete patchDoc._rev;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const patchedDocument = applyPatch(patchDoc, update.effects!.apply);
            this.documentsCache.set(key, patchedDocument);
          }
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((update) => {
        this.lastMutatedDocumentId$.next(update.documentId);
      });
  }

  private setupSourceMapUpdates(): void {
    combineLatest([this.lastMutatedDocumentId$, this.turboIds])
      .pipe(
        filter(
          ([lastMutatedDocumentId, turboIds]) =>
            !!lastMutatedDocumentId && turboIds.includes(lastMutatedDocumentId),
        ),
        switchMap(() => this.updateAllSnapshots()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.lastMutatedDocumentId$.next(null);
      });
  }

  private updateAllSnapshots(): Observable<void> {
    for (const [, snapshot] of this.snapshots.entries()) {
      const currentSnapshot = snapshot.getValue();
      if (currentSnapshot.resultSourceMap?.documents?.length) {
        const updatedResult = this.turboChargeResultIfSourceMap(
          currentSnapshot.result,
          currentSnapshot.resultSourceMap,
        );
        snapshot.next({
          ...currentSnapshot,
          result: updatedResult,
        });
      }
    }

    return EMPTY;
  }

  private loadMissingDocuments() {
    this.turboIds
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr),
        ),
        map((ids) =>
          ids.filter(
            (id) =>
              !this.documentsCache.has(
                `${this.config.projectId}-${this.config.dataset}-${id}`,
              ),
          ),
        ),
        filter((missingIds) => missingIds.length > 0),
        switchMap((missingIds) => this.client.getDocuments(missingIds)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((documents) => {
        for (const doc of documents) {
          if (doc && doc._id) {
            this.documentsCache.set(
              `${this.config.projectId}-${this.config.dataset}-${doc._id}`,
              doc,
            );
          }
        }
      });
  }

  private setupRefreshCycle(): void {
    this.revalidateService
      .setupRevalidate(this.refreshInterval)
      .pipe(
        filter((state) => state === 'refresh' || state === 'stale'),
        switchMap(() => this.refreshAllSnapshots()),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const endRefresh = this.revalidateService.startRefresh();
        // The refresh is complete when this subscription fires
        endRefresh();
      });
  }

  private cacheCleanup(key: string) {
    const entry = this.queryParamsCache.get(key);
    if (entry) {
      entry.refCount--;
      if (entry.refCount === 0) {
        this.queryParamsCache.delete(key);
      }
    }
  }
}
