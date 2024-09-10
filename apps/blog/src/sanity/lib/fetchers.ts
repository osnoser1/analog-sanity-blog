import type { SanityClient } from '@sanity/client';

import {
  moreStoriesQuery,
  type MoreStoriesQueryResult,
  postBySlugQuery,
  type PostBySlugQueryResult,
  settingsQuery,
  SettingsQueryResult,
} from '@analog-sanity-blog/sanity';

export async function getSettings(
  client: SanityClient,
): Promise<SettingsQueryResult> {
  return await client.fetch(settingsQuery);
}

export async function getPostBySlug(
  client: SanityClient,
  slug: string,
): Promise<PostBySlugQueryResult> {
  return await client.fetch(postBySlugQuery, { slug });
}

export async function getMoreStories(
  client: SanityClient,
  skip: string | null = null,
  limit = 100,
): Promise<MoreStoriesQueryResult> {
  return await client.fetch(moreStoriesQuery, { skip, limit });
}
