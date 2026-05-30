/// <reference types="jasmine" />
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiltrosPanelComponent } from './filtros-panel.component';

describe('FiltrosPanelComponent', () => {
  let component: FiltrosPanelComponent;
  let fixture: ComponentFixture<FiltrosPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FiltrosPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FiltrosPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
