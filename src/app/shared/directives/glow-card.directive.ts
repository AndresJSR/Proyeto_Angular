import { Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appGlowCard]',
  standalone: true,
})
export class GlowCardDirective {
  @HostBinding('attr.data-glow') readonly dataGlow = '';

  constructor(private readonly el: ElementRef<HTMLElement>) {}

  @HostListener('document:pointermove', ['$event'])
  onPointerMove(e: PointerEvent): void {
    const host = this.el.nativeElement;
    host.style.setProperty('--x', e.clientX.toFixed(2));
    host.style.setProperty('--xp', (e.clientX / window.innerWidth).toFixed(2));
    host.style.setProperty('--y', e.clientY.toFixed(2));
    host.style.setProperty('--yp', (e.clientY / window.innerHeight).toFixed(2));
  }
}
