import type {
  ContentSourceMap,
  QueryParams,
  SanityClient,
} from '@sanity/client';

export interface QueryOptions<T> {
  initialSnapshot?: T;
}

export interface QuerySnapshot<T> {
  result: T;
  resultSourceMap: ContentSourceMap;
}

export interface QuerySubscription {
  query: string;
  params: QueryParams;
}

/** @internal */
export type QueryCacheKey = `${string}-${string}`;

export type SanityClientFactory = (preview?: { token: string }) => SanityClient;
