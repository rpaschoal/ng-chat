import { NgChat } from '../ng-chat/ng-chat.component';
import { User } from '../ng-chat/core/user';
import { Window } from '../ng-chat/core/window';

describe('NgChat', () => {
    beforeEach(function() {
        this.subject = new NgChat();
    });

    it('Should have default title', function() {
        expect(this.subject.title).toBe('Friends');
    });

    it('Should have default message placeholder', function() {
        expect(this.subject.messagePlaceholder).toBe('Type a message');
    });

    it('Should have default polling interval', function() {
        expect(this.subject.pollingInterval).toBe(5000);
    });

    it('Exercise users filter', function() {
        this.subject.users = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        this.subject.searchInput = 'Test 1';

        const result = this.subject.filteredUsers;

        expect(this.subject.users.length).toBe(2);
        expect(result.length).toBe(1);
    });

    it('Exercise user not found filter', function() {
        this.subject.users = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        this.subject.searchInput = 'Test 3';

        const result = this.subject.filteredUsers;

        expect(this.subject.users.length).toBe(2);
        expect(result.length).toBe(0);
    });

    it('Must display max visible windows on viewport', function() {
        this.subject.viewPortTotalArea = 960; // Just enough for 2 windows based on the default window size of 320

        this.subject.windows = [
            new Window(),
            new Window(),
            new Window()
        ];
        
        this.subject.NormalizeWindows();

        expect(this.subject.windows.length).toBe(2);
    });
});
