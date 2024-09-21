import { PageServerLoad } from '@analogjs/router';

import { isDraftMode } from '../../../../server/utils/draft-mode';
import { readToken } from '../../../../sanity/lib/token';
import { getClient } from '../../../../sanity/lib/client';
import {
  getMoreStories,
  getPostBySlug,
  getSettings,
} from '../../../../sanity/lib/fetchers';

export const load = async ({ event, params = {} }: PageServerLoad) => {
  const draftMode = isDraftMode(event);
  const client = getClient(draftMode ? { token: readToken } : undefined);
  const [post, settings, morePosts] = await Promise.all([
    getPostBySlug(client, params['slug']),
    getSettings(client),
    getMoreStories(client, params['slug'], 2),
  ]);

  return {
    loaded: true,
    post: (post ?? {}) as NonNullable<typeof post>,
    settings,
    morePosts,
    draftMode,
    token: draftMode ? readToken : '',
  };
};

export type LoadResult = Awaited<ReturnType<typeof load>>;
