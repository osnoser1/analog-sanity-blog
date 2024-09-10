import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  standalone: true,
  template: ` <p>Hello World!</p>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class HomePage {}
