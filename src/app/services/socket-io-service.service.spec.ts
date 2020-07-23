import { TestBed } from '@angular/core/testing';

import { SocketIoServiceService } from './socket-io-service.service';

describe('SocketIoServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketIoServiceService = TestBed.get(SocketIoServiceService);
    expect(service).toBeTruthy();
  });
});
