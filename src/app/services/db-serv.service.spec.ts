import { TestBed } from '@angular/core/testing';

import { DbServService } from './db-serv.service';

describe('DbServService', () => {
  let service: DbServService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DbServService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
