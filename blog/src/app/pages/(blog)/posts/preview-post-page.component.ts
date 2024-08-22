import {
  Component,
  computed,
  effect,
  EnvironmentInjector,
  inject,
  input,
  OnInit,
  runInInjectionContext,
  type Signal,
} from '@angular/core';

import { type load } from './[slug].server';
import { PostPageComponent } from './post-page.component';
import { LivePreviewService } from '@limitless-angular/sanity/preview-kit';
import { toSignal } from '@angular/core/rxjs-interop';
import { PostQueryResult } from '../../../../../sanity.types';
import { postBySlugQuery } from '../../../../sanity/lib/queries';
import { tap } from 'rxjs';

@Component({
  selector: 'preview-post-page',
  standalone: true,
  template: `@if (computedDataPreview?.().post) {
    <post-page [slug]="slug()" [data]="computedDataPreview()" />
  }`,
  imports: [PostPageComponent],
})
export class PreviewPostPageComponent implements OnInit {
  private environmentInjector = inject(EnvironmentInjector);

  private liveStoreService = inject(LivePreviewService);

  slug = input.required<string>();

  data = input.required<Awaited<ReturnType<typeof load>>>();

  postPreview!: Signal<PostQueryResult | undefined>;

  computedDataPreview!: Signal<ReturnType<typeof this.data>>;

  constructor() {
    effect(() => {
      console.log('Slug:', this.slug());
    });
  }

  ngOnInit() {
    runInInjectionContext(this.environmentInjector, () => {
      this.postPreview = toSignal(
        this.liveStoreService.listenQuery<PostQueryResult>(
          postBySlugQuery,
          { slug: this.slug() },
          { initialSnapshot: this.data().post },
        ),
      );

      this.computedDataPreview = computed(
        () =>
          ({ ...this.data(), post: this.postPreview() }) as ReturnType<
            typeof this.data
          >,
      );
    });
  }
}
