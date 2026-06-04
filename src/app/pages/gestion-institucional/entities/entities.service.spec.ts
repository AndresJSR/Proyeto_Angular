import { TestBed } from '@angular/core/testing';

import { EntitiesAdminService } from './entities.service';

describe('EntitiesAdminService', () => {
  let service: EntitiesAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EntitiesAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
