import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesListComponent } from './list.component';

describe('EntitiesListComponent', () => {
  let component: EntitiesListComponent;
  let fixture: ComponentFixture<EntitiesListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitiesListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitiesListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
