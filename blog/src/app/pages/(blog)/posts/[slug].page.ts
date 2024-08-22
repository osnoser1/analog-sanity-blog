import { Component, computed, input } from '@angular/core';
import { injectLoad } from '@analogjs/router';

import * as demo from '../../../../sanity/lib/demo';

import { load } from './[slug].server';
import { RouterLink } from '@angular/router';
import { CoverImageComponent } from '../components/cover-image';
import { FooterComponent } from '../components/footer.component';
import { MoreStoriesComponent } from '../components/more-stories.component';
import { AvatarComponent } from '../components/avatar.component';
import { DateComponent } from '../components/date.component';
import { PortableTextComponent } from '../components/portable-text.component';
import { toSignal } from '@angular/core/rxjs-interop';
import { PreviewPostPageComponent } from './preview-post-page.component';
import { PostPageComponent } from './post-page.component';

@Component({
  standalone: true,
  template: `
    @if (draftMode()) {
      <preview-post-page [slug]="slug()" [data]="data()" />
    } @else {
      <post-page [slug]="slug()" [data]="data()" />
    }
  `,
  imports: [
    RouterLink,
    PortableTextComponent,
    CoverImageComponent,
    FooterComponent,
    MoreStoriesComponent,
    AvatarComponent,
    DateComponent,
    PreviewPostPageComponent,
    PostPageComponent,
  ],
})
export default class PostPage {
  slug = input.required<string>();

  data = toSignal(injectLoad<typeof load>(), { requireSync: true });

  draftMode = computed(() => this.data().draftMode);
}
