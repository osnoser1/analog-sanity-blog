import { Component, computed, input } from '@angular/core';

import { load, type LoadResult } from './[slug].server';
import { type ResolveFn, RouterLink } from '@angular/router';
import { CoverImageComponent } from '../components/cover-image';
import { FooterComponent } from '../components/footer.component';
import { MoreStoriesComponent } from '../components/more-stories.component';
import { AvatarComponent } from '../components/avatar.component';
import { DateComponent } from '../components/date.component';
import { PortableTextComponent } from '../components/portable-text.component';
import { PreviewPostPageComponent } from './preview-post-page.component';
import { PostPageComponent } from './post-page.component';
import { type MetaTag, RouteMeta } from '@analogjs/router';
import { ROUTE_META_TAGS_KEY, ROUTE_TITLE_KEY } from '../../../utils/meta-tags';
import { toPlainText } from '@limitless-angular/sanity';
import { resolveOpenGraphImage } from '../../../utils/resolve-open-graph-image';
import { generateMetaTags } from '../../../utils/generate-metatags';
import * as demo from '../../../../sanity/lib/demo';

// See https://discord.com/channels/994618831987290112/1276597066096840784
export const routeMeta: RouteMeta = {
  data: {
    [ROUTE_TITLE_KEY]: ((route) => {
      const { settings, post } = route.data['load'] as LoadResult;
      const title = settings?.title ?? demo.title;
      return post?.title ? `${post.title} | ${title}` : title;
    }) satisfies ResolveFn<string>,
    [ROUTE_META_TAGS_KEY]: ((route) => {
      const { settings, post } = route.data['load'] as LoadResult;
      const title = settings?.title ?? '';
      const description = toPlainText(settings?.description ?? []);
      const image = resolveOpenGraphImage(post?.coverImage);
      return generateMetaTags({ title, description, image });
    }) satisfies ResolveFn<MetaTag[]>,
  },
};

@Component({
  standalone: true,
  template: `
    @if (draftMode()) {
      <preview-post-page [slug]="slug()" [data]="load()" />
    } @else {
      <post-page [slug]="slug()" [data]="load()" />
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

  load = input.required<Awaited<ReturnType<typeof load>>>();

  draftMode = computed(() => this.load().draftMode);
}
