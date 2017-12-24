import { NgChat } from '../ng-chat/ng-chat.component';

describe('NgChat', () => {
    beforeEach(function() {
        this.subject = new NgChat();
    });

    it('Should have default title', function() {
        expect(this.subject.title).toBe('Friends');
    });
});
