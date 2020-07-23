import { TestBed } from '@angular/core/testing';

import { SocketListenerServiceService } from './socket-listener-service.service';

describe('SocketListenerServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: SocketListenerServiceService = TestBed.get(SocketListenerServiceService);
    expect(service).toBeTruthy();
  });
});
