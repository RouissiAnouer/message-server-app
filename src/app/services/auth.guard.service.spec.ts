import { TestBed } from '@angular/core/testing';

import { Auth.GuardService } from './auth.guard.service';

describe('Auth.GuardService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: Auth.GuardService = TestBed.get(Auth.GuardService);
    expect(service).toBeTruthy();
  });
});
