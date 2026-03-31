import { TestBed } from '@angular/core/testing';

import { UsersregService } from './usersreg.service';

describe('UsersregService', () => {
  let service: UsersregService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UsersregService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
