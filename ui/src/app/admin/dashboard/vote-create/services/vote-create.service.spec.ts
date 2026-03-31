import { TestBed } from '@angular/core/testing';

import { AdminVoteCreateService } from './vote-create.service';

describe('VoteCreateService', () => {
  let service: AdminVoteCreateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminVoteCreateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
