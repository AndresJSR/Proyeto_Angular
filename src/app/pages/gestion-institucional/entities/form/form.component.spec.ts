import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntitiesFormComponent } from './form.component';

describe('EntitiesFormComponent', () => {
  let component: EntitiesFormComponent;
  let fixture: ComponentFixture<EntitiesFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntitiesFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EntitiesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
