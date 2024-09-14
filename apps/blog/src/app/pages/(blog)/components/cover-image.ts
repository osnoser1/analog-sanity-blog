import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  booleanAttribute,
} from '@angular/core';

import { SanityImage } from '@limitless-angular/sanity/image-loader';

import { JsonPipe } from '@angular/common';

@Component({
  selector: 'cover-image',
  standalone: true,
  imports: [SanityImage, JsonPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="shadow-md transition-shadow duration-200 group-hover:shadow-lg sm:mx-0"
    >
      @if (hasValidImage()) {
        <img
          class="h-auto w-full"
          width="2000"
          height="1000"
          sizes="100vw"
          [alt]="image().alt ?? ''"
          [sanityImage]="this.image()"
          [priority]="priority()"
        />
      } @else {
        <div class="bg-slate-50" style="padding-top: 50%;"></div>
      }
    </div>
  `,
})
export class CoverImageComponent {
  image = input.required<any>();
  priority = input(false, { transform: booleanAttribute });

  hasValidImage = computed(() => !!this.image()?.asset?._ref);
}
