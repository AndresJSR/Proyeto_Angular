import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MapaTerritorialComponent } from './mapa-territorial.component';

describe('MapaTerritorialComponent', () => {
  let component: MapaTerritorialComponent;
  let fixture: ComponentFixture<MapaTerritorialComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapaTerritorialComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MapaTerritorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
