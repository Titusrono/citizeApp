import { TestBed } from '@angular/core/testing';

import { VirtualService } from './virtual.service';

describe('VirtualService', () => {
  let service: VirtualService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VirtualService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
