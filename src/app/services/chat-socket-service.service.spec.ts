import { TestBed } from '@angular/core/testing';

import { ChatSocketServiceService } from './chat-socket-service.service';

describe('ChatSocketServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatSocketServiceService = TestBed.get(ChatSocketServiceService);
    expect(service).toBeTruthy();
  });
});
