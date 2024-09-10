import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { HomePageComponent } from './home-page.component';
import type { load } from './(home).server';
import { moreStoriesQuery, settingsQuery } from '@analog-sanity-blog/sanity';
import { createLiveData } from '../../utils/create-live-data';

@Component({
  selector: 'preview-home-page',
  standalone: true,
  imports: [HomePageComponent],
  template: `<home-page [data]="liveData()" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewHomePageComponent {
  data = input.required<Awaited<ReturnType<typeof load>>>();

  liveData = createLiveData(this.data, () => ({
    posts: { query: moreStoriesQuery, params: { limit: 100, skip: null } },
    settings: { query: settingsQuery },
  }));
}
