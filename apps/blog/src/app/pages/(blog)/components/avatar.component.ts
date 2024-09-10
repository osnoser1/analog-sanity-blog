import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';

import { SanityImage } from '@limitless-angular/sanity';
import type { Author } from '@analog-sanity-blog/sanity';

@Component({
  selector: 'avatar',
  standalone: true,
  imports: [SanityImage],
  template: `
    @if (hasPicture()) {
      <div class="flex items-center text-xl">
        <div class="mr-4 h-12 w-12">
          <img
            class="h-full rounded-full object-cover"
            height="48"
            width="48"
            [sanityImage]="this.picture()"
            [alt]="picture()?.alt ?? ''"
          />
        </div>
        <div class="text-pretty text-xl font-bold">{{ name() }}</div>
      </div>
    } @else {
      <div class="flex items-center text-xl">
        <div class="mr-1">By</div>
        <div class="text-pretty text-xl font-bold">{{ name() }}</div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarComponent {
  name = input.required<string>();
  picture = input<Exclude<Author['picture'], undefined> | null>();
  hasPicture = computed(() => !!this.picture()?.asset?._ref);
}