import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnotacionDetalleComponent } from './anotacion-detalle.component';

describe('AnotacionDetalleComponent', () => {
  let component: AnotacionDetalleComponent;
  let fixture: ComponentFixture<AnotacionDetalleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnotacionDetalleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnotacionDetalleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
