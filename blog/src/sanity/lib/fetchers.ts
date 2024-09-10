import type { SanityClient } from '@sanity/client';
// import { sanity } from '@limitless-angular/sanity/visual-editing';
import {
  heroPostQuery,
  type HeroPostQueryResult,
  moreStoriesQuery,
  type MoreStoriesQueryResult,
  postBySlugQuery,
  type PostBySlugQueryResult,
  settingsQuery,
  SettingsQueryResult,
} from '@analog-sanity-blog/sanity';

// console.log(`Sanity import test: `, sanity());

export async function getSettings(
  client: SanityClient,
): Promise<SettingsQueryResult> {
  return await client.fetch(settingsQuery);
}

export async function getHeroPost(
  client: SanityClient,
): Promise<HeroPostQueryResult> {
  return await client.fetch(heroPostQuery);
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
