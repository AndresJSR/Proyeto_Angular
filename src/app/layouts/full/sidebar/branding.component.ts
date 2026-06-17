import { Component, HostBinding, OnDestroy } from '@angular/core';
import { CoreService } from 'src/app/services/core.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-branding',
  imports: [],
  template: `
    <a href="/" style="display:flex;justify-content:center;">
      <img
        [src]="isDark ? '/assets/images/logos/light-logo.svg' : '/assets/images/logos/dark-logo.svg'"
        class="align-middle m-2"
        alt="logo"
        width="140"
        height="auto"
      />
    </a>
  `,
})
export class BrandingComponent implements OnDestroy {
  isDark = false;
  private sub: Subscription;

  constructor(private settings: CoreService) {
    this.isDark = this.settings.getOptions().theme === 'dark';
    this.sub = this.settings.notify.subscribe(() => {
      this.isDark = this.settings.getOptions().theme === 'dark';
    });
  }

  ngOnDestroy() { this.sub.unsubscribe(); }
}
