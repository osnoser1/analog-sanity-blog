import { Component, input } from '@angular/core';

import { type load } from './[slug].server';
import { PostPageComponent } from './post-page.component';
import {
  moreStoriesQuery,
  postBySlugQuery,
  settingsQuery,
} from '../../../../sanity/lib/queries';
import { createLiveData } from '../../../utils/create-live-data';

@Component({
  selector: 'preview-post-page',
  standalone: true,
  template: `<post-page [slug]="slug()" [data]="liveData()" />`,
  imports: [PostPageComponent],
})
export class PreviewPostPageComponent {
  slug = input.required<string>();

  data = input.required<Awaited<ReturnType<typeof load>>>();

  liveData = createLiveData(this.data, () => ({
    post: { query: postBySlugQuery, params: { slug: this.slug() } },
    settings: { query: settingsQuery },
    morePosts: {
      query: moreStoriesQuery,
      params: { skip: this.slug(), limit: 2 },
    },
  }));
}
