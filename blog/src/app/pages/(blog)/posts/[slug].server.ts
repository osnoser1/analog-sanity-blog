import { PageServerLoad } from '@analogjs/router';

import { PostQueryResult } from '../../../../../sanity.types';
import { sanityFetch } from '../../../../sanity/lib/fetch';
import { postBySlugQuery } from '../../../../sanity/lib/queries';
import { isDraftMode } from '../../../../server/utils/draft-mode';
import { readToken } from '../../../../sanity/lib/token';
import {
  getClient,
  getMoreStories,
  getSettings,
} from '../../../../sanity/lib/client';

export const load = async ({ event, params }: PageServerLoad) => {
  const draftMode = isDraftMode(event);
  const client = getClient(draftMode ? { token: readToken } : undefined);
  const [post, settings, morePosts] = await Promise.all([
    sanityFetch<PostQueryResult>({
      query: postBySlugQuery,
      params,
    }),
    getSettings(client),
    getMoreStories(client, params!['slug'], 2),
  ]);

  return {
    loaded: true,
    post,
    settings,
    morePosts,
    draftMode,
    token: draftMode ? readToken : '',
  };
};

export type LoadResult = Awaited<ReturnType<typeof load>>;
