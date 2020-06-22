import { TestBed } from '@angular/core/testing';

import { SendFileService } from './send-file.service';

describe('SendFileService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SendFileService = TestBed.get(SendFileService);
    expect(service).toBeTruthy();
  });
});
