import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
} from '@angular/core';
import { LivePreviewService } from './live-preview.service';
import { RevalidateService } from './revalidate.service';
import { UseDocumentsInUse } from '@limitless-angular/sanity/preview-kit-compat';

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'live-query-provider',
  standalone: true,
  template: `<ng-content />`,
  providers: [LivePreviewService, RevalidateService, UseDocumentsInUse],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LiveQueryProviderComponent {
  token = input.required<string>();

  private livePreviewService = inject(LivePreviewService);

  constructor() {
    afterNextRender(() => {
      console.log('afterNextRender');
      this.livePreviewService.initialize(this.token());
    });
  }
}
