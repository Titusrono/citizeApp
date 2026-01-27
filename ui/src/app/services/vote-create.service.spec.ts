import { TestBed } from '@angular/core/testing';

import { VoteCreateService } from './vote-create.service';

describe('VoteCreateService', () => {
  let service: VoteCreateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VoteCreateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
