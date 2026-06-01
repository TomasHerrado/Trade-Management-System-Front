import { TestBed } from '@angular/core/testing';

import { CommerceService as Commerce } from './commerce';

describe('Commerce', () => {
  let service: Commerce;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Commerce);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
