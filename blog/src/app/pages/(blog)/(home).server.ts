import { PageServerLoad } from '@analogjs/router';

import { isDraftMode } from '../../../server/utils/draft-mode';
import { readToken } from '../../../sanity/lib/token';
import {
  getClient,
  getHeroPost,
  getMoreStories,
  getSettings,
} from '../../../sanity/lib/client';

export const load = async ({ event }: PageServerLoad) => {
  const draftMode = isDraftMode(event);
  const client = getClient(draftMode ? { token: readToken } : undefined);
  const [settings, posts] = await Promise.all([
    getSettings(client),
    getMoreStories(client, undefined, 100),
  ]);

  return {
    settings,
    posts,
    draftMode,
    token: draftMode ? readToken : '',
  };
};
