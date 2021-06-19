import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgChatFriendsListComponent } from '../../ng-chat/components/ng-chat-friends-list/ng-chat-friends-list.component';
import { User } from '../../ng-chat/core/user';
import { IChatParticipant } from '../../ng-chat/core/chat-participant';
import { ChatParticipantType } from '../../ng-chat/core/chat-participant-type.enum';
import { ChatParticipantStatus } from '../../ng-chat/core/chat-participant-status.enum';

const participantStub: IChatParticipant = {
	id: 1,
	displayName: 'Test 1',
	avatar: '',
	participantType: ChatParticipantType.User,
	status: ChatParticipantStatus.Online
}

describe('NgChatOptionsComponent', () => {
	let subject: NgChatFriendsListComponent;
	let fixture: ComponentFixture<NgChatFriendsListComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
			declarations: [ NgChatFriendsListComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NgChatFriendsListComponent);
		subject = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('isUserSelectedFromFriendsList exercise', () => {
        let mockedFirstUser = new User();
        let mockedSecondUser = new User();

        mockedFirstUser.id = 888;
        mockedSecondUser.id = 999;
        
        subject.selectedUsersFromFriendsList = [mockedSecondUser];

        expect(subject.isUserSelectedFromFriendsList(mockedFirstUser)).toBeFalsy();
        expect(subject.isUserSelectedFromFriendsList(mockedSecondUser)).toBeTruthy();
	});
	
	it('Exercise participants filter', () => {
        subject.participants = [
			participantStub,
			{
				...participantStub,
				id: 2,
				displayName: 'Test 2'
			}
		];

        subject.searchInput = 'Test 1';

        const result = subject.filteredParticipants;

        expect(subject.participants.length).toBe(2);
        expect(result.length).toBe(1);
    });

    it('Exercise participants not found filter', () => {
        subject.participants = [
			participantStub,
			{
				...participantStub,
				id: 2,
				displayName: 'Test 2',
			}
		];

        subject.searchInput = 'Test 3';

        const result = subject.filteredParticipants;

        expect(subject.participants.length).toBe(2);
        expect(result.length).toBe(0);
	});

	it('On check friends list during options action should push selected user', () => {
        let mockedUser = new User();
        mockedUser.id = 999;
        
        subject.selectedUsersFromFriendsList = [];

        subject.onFriendsListCheckboxChange(mockedUser, true);

        expect(subject.selectedUsersFromFriendsList).not.toBeNull();
        expect(subject.selectedUsersFromFriendsList.length).toBe(1);
        expect(subject.selectedUsersFromFriendsList[0]).toBe(mockedUser);
        expect(subject.selectedUsersFromFriendsList[0].id).toBe(mockedUser.id);
    });
	
	it('On uncheck friends list during options action should remove selected user', () => {
        let mockedUser = new User();
        mockedUser.id = 999;
        
        subject.selectedUsersFromFriendsList = [mockedUser];

        subject.onFriendsListCheckboxChange(mockedUser, false);

        expect(subject.selectedUsersFromFriendsList).not.toBeNull();
        expect(subject.selectedUsersFromFriendsList.length).toBe(0);
    });
});
