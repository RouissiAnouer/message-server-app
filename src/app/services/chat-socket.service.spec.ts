import { TestBed } from '@angular/core/testing';
import { ChatSocketService } from './chat-socket.service';


describe('ChatSocketServiceService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ChatSocketService = TestBed.get(ChatSocketService);
    expect(service).toBeTruthy();
  });
});
