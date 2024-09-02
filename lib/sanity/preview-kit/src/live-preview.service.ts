import { Injectable, inject, PLATFORM_ID, DestroyRef } from '@angular/core';
import {
  BehaviorSubject,
  combineLatest,
  EMPTY,
  from,
  Observable,
  of,
} from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  filter,
  finalize,
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
import { QuerySnapshot, QueryCacheKey } from './types';
import {
  ContentSourceMap,
  QueryParams,
  SanityDocument,
  MutationEvent,
  InitializedClientConfig,
  type SanityClient,
} from '@sanity/client';
import { RevalidateService } from './revalidate.service';
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

/**
 * Return params that are stable with deep equal as long as the key order is the same
 *
 * Based on https://github.com/sanity-io/visual-editing/blob/main/packages/visual-editing-helpers/src/hooks/useQueryParams.ts
 * @internal
 */
function getStableQueryParams(
  params?: undefined | null | QueryParams,
): QueryParams {
  return JSON.parse(JSON.stringify(params ?? {}));
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
  private docsInUse = new Map<string, ContentSourceMap['documents'][number]>();
  private lastMutatedDocumentId$ = new BehaviorSubject<string | null>(null);
  private turboIds = new BehaviorSubject<string[]>([]);
  private isInitialized = false;
  private warnedAboutCrossDatasetReference = false;

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
      this.setupTurboUpdates();
      this.loadMissingDocuments();
      this.revalidateService.setupRevalidate(this.refreshInterval);
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

  private turboIdsFromSourceMap(resultSourceMap: ContentSourceMap) {
    const nextTurboIds = new Set<string>();
    this.docsInUse.clear();
    if (resultSourceMap?.documents?.length) {
      for (const document of resultSourceMap.documents) {
        nextTurboIds.add(document._id);
        this.docsInUse.set(document._id, document);
      }

      this.useDocumentsInUse.updateDocumentsInUse(this.docsInUse);
    }

    const prevTurboIds = this.turboIds.getValue();
    const mergedTurboIds = Array.from(
      new Set([...prevTurboIds, ...nextTurboIds]),
    );
    if (
      JSON.stringify(mergedTurboIds.sort()) !==
      JSON.stringify(prevTurboIds.sort())
    ) {
      this.turboIds.next(mergedTurboIds);
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
          // @TODO Handle cross dataset references
          if (!this.warnedAboutCrossDatasetReference) {
            console.warn(
              'Cross dataset references are not supported yet, ignoring source document',
              sourceDocument,
            );
            this.warnedAboutCrossDatasetReference = true;
          }
          return undefined;
        }
        return this.documentsCache.get(
          getTurboCacheKey(
            this.config.projectId,
            this.config.dataset,
            sourceDocument._id,
          ),
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

  listenLiveQuery<QueryResult>(
    initialData: QueryResult,
    query: string,
    queryParams?: QueryParams,
  ): Observable<QueryResult> {
    if (!this.isBrowser) {
      return of(initialData);
    }

    this.checkInitialization();

    const params = getStableQueryParams(queryParams);
    const key = getQueryCacheKey(query, params);
    let snapshot = this.snapshots.get(key) as
      | BehaviorSubject<QuerySnapshot<QueryResult>>
      | undefined;

    if (!snapshot) {
      snapshot = new BehaviorSubject<QuerySnapshot<QueryResult>>({
        result: initialData ?? (null as unknown as QueryResult),
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

      this.handleRevalidation(query, params);
    }

    return new Observable<QueryResult>((observer) => {
      const subscription = snapshot
        .pipe(
          map((snapshot) => snapshot.result),
          distinctUntilChanged(),
        )
        .subscribe(observer);

      return () => {
        subscription.unsubscribe();
        this.cacheCleanup(key);
      };
    }).pipe(shareReplay(1));
  }

  private handleRevalidation(query: string, params: QueryParams) {
    this.revalidateService
      .getRevalidateState()
      .pipe(
        map((state) => state === 'refresh' || state === 'inflight'),
        filter(Boolean),
        distinctUntilChanged(),
        switchMap(() => this.fetchQuery(query, params)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  private fetchQuery(query: string, params: QueryParams): Observable<void> {
    const onFinally = this.revalidateService.startRefresh();
    const controller = new AbortController();
    return from(
      this.client.fetch(query, params, {
        signal: controller.signal,
        filterResponse: false,
      }),
    ).pipe(
      tap(({ result, resultSourceMap }) => {
        this.updateSnapshot(query, params, result, resultSourceMap);

        if (resultSourceMap) {
          this.turboIdsFromSourceMap(resultSourceMap);
        }
      }),
      catchError((error) => {
        if (error.name !== 'AbortError') {
          // Here you might want to implement error handling
          console.error(error);
        }
        return EMPTY;
      }),
      finalize(onFinally),
      map(() => undefined),
    );
  }

  private updateSnapshot(
    query: string,
    params: QueryParams,
    result: unknown,
    resultSourceMap?: ContentSourceMap,
  ): void {
    const key = getQueryCacheKey(query, params);
    const snapshot = this.snapshots.get(key);
    if (snapshot) {
      snapshot.next({
        result: this.turboChargeResultIfSourceMap(result, resultSourceMap),
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        resultSourceMap: resultSourceMap!,
      });
    }
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
          const cachedDocument = this.documentsCache.peek(key);
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

  private cacheCleanup(key: QueryCacheKey) {
    const entry = this.queryParamsCache.get(key);
    if (entry) {
      entry.refCount--;
      if (entry.refCount === 0) {
        this.queryParamsCache.delete(key);
        this.snapshots.delete(key);
      }
    }
  }
}
