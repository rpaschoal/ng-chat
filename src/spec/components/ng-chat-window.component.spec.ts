
import { IChatParticipant } from './../../ng-chat/core/chat-participant';
import { LinkfyPipe } from './../../ng-chat/pipes/linkfy.pipe';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NgChatWindowComponent } from '../../ng-chat/components/ng-chat-window/ng-chat-window.component';
import { User } from '../../ng-chat/core/user';
import { Window } from '../../ng-chat/core/window';
import { Observable, of } from 'rxjs';
import { Message } from '../../ng-chat/core/message';
import { ScrollDirection } from '../../ng-chat/core/scroll-direction.enum';
import { IFileUploadAdapter } from '../../ng-chat/core/file-upload-adapter';
import { FileMessage } from '../../ng-chat/core/file-message';
import { ChatParticipantType } from '../../ng-chat/core/chat-participant-type.enum';
import { Group } from '../../ng-chat/core/group';
import { By } from '@angular/platform-browser';
import { EmojifyPipe } from '../../ng-chat/pipes/emojify.pipe';
import { ChatParticipantStatus } from '../../ng-chat/core/chat-participant-status.enum';
import { Localization, StatusDescription } from './../../ng-chat/core/localization';

class MockableFileUploadAdapter implements IFileUploadAdapter {
    uploadFile(file: File, userTo: User): Observable<Message> {
        throw new Error("Method not implemented.");
    }
}

describe('NgChatWindowComponent', () => {
	let subject: NgChatWindowComponent;
	let fixture: ComponentFixture<NgChatWindowComponent>;

	beforeEach(waitForAsync(() => {
		TestBed.configureTestingModule({
      declarations: [ LinkfyPipe, EmojifyPipe, NgChatWindowComponent ]
		})
		.compileComponents();
	}));

	beforeEach(() => {
		fixture = TestBed.createComponent(NgChatWindowComponent);
		subject = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('Must invoke onMessagesSeen event when a chat group window gets focus', () => {
        const spy = spyOn(subject.onMessagesSeen, 'emit');

        const user: User = {
            participantType: ChatParticipantType.Group,
            id: 888,
            displayName: 'Test user group',
            status: 1,
            avatar: ''
        };

        const messages: Message[] = [
            {
                fromId: 1,
                toId: 888,
                message:'Hi',
                dateSeen: new Date()
            },
            {
                fromId: 1,
                toId: 888,
                message:'Hi'
            }
        ];

        const window: Window = new Window(user, false, false);
        window.messages = messages;

        subject.toggleWindowFocus(window);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
	});

	it('Must invoke onMessagesSeen event when a user window gets focus', () => {
		const currentUserId = 123;
		subject.userId = currentUserId;

        let spy = spyOn(subject.onMessagesSeen, 'emit');

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let messages: Message[] = [
            {
                fromId: 999,
                toId: currentUserId,
                message:'Hi',
                dateSeen: new Date()
            },
            {
                fromId: 999,
                toId: currentUserId,
                message:'Hi'
            }
        ];

        let window: Window = new Window(user, false, false);
        window.messages = messages;

        subject.toggleWindowFocus(window);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

	it('Must send a new message when the ENTER key is pressed', () => {
        const chattingToUser = new User();
        const event = {
            keyCode: 13
        };

        chattingToUser.id = 99;

        const currentWindow = new Window(chattingToUser, false, false);

        currentWindow.newMessage = "Test";

		const scrollSpy = spyOn(subject, 'scrollChatWindow');
		const messageSentSpy = spyOn(subject.onMessageSent, 'emit');

        subject.onChatInputTyped(event, currentWindow);

        expect(currentWindow.newMessage).toBe(""); // Should clean the message input after dispatching the message
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy.calls.mostRecent().args[1]).toBe(ScrollDirection.Bottom);

		expect(messageSentSpy).toHaveBeenCalledTimes(1);
        expect(messageSentSpy.calls.mostRecent().args[0].message).toBe("Test");
    });

	it('Must not send a new message when the ENTER key is pressed but the message input is empty', () => {
        let chattingToUser = new User();
        let event = {
            keyCode: 13
        };

        chattingToUser.id = 99;

        let currentWindow = new Window(chattingToUser, false, false);

        currentWindow.newMessage = "";

		spyOn(subject, 'scrollChatWindow');
		const messageSentSpy = spyOn(subject.onMessageSent, 'emit');

        subject.onChatInputTyped(event, currentWindow);

        expect(messageSentSpy).not.toHaveBeenCalled();
        expect(subject.scrollChatWindow).not.toHaveBeenCalled();
    });

	it('Must close the current window when the ESC key is pressed', () => {
        const currentWindow = new Window(null, false, false);
        const event = {
            keyCode: 27
        };

        const chatWindowClosedSpy = spyOn(subject.onChatWindowClosed, 'emit');

        subject.onChatInputTyped(event, currentWindow);

        expect(chatWindowClosedSpy).toHaveBeenCalledTimes(1);
        expect(chatWindowClosedSpy.calls.mostRecent().args[0]).not.toBeNull();
        expect(chatWindowClosedSpy.calls.mostRecent().args[0].closedWindow).toBe(currentWindow);
	});

	it('Must not invoke onMessagesSeen event when a window gets focus but there are no new messages', () => {
        spyOn(subject.onMessagesSeen, 'emit');

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        // Both messages have "dateSeen" dates
        let messages: Message[] = [
            {
                fromId: 999,
                toId: 123,
                message:'Hi',
                dateSeen: new Date()
            },
            {
                fromId: 999,
                toId: 123,
                message:'Hi',
                dateSeen: new Date()
            }
        ];

        let window: Window = new Window(user, false, false);
        window.messages = messages;

        subject.toggleWindowFocus(window);

        expect(subject.onMessagesSeen.emit).not.toHaveBeenCalled();
	});

	it('Should filter by file instance id and upload file when a file upload "onFileChosen" event is triggered', () => {
        const mockedFileMessageServerResponse = new FileMessage();

        const chattingTo = new User();
        chattingTo.id = 88;

        const chatWindow = new Window(chattingTo, false, false);

        spyOn(MockableFileUploadAdapter.prototype, 'uploadFile').and.callFake(() => {
            // At this stage the 'isUploadingFile' should be true
            expect(subject.isUploadingFile(chatWindow)).toBeTruthy();

            return of(mockedFileMessageServerResponse);
        });

		const messageSentSpy = spyOn(subject.onMessageSent, 'emit');
        const scrollSpy = spyOn(subject, 'scrollChatWindow');

        const fakeFile = new File([''], 'filename', { type: 'text/html' });

        const fakeFileElement = {
            nativeElement:
            {
                id: `ng-chat-file-upload-${chattingTo.id}`,
                value: 'test',
                files: [fakeFile]
            }
        }

        // Should be filtered and ignored
        const anotherFakeFileElement = {
            nativeElement:
            {
                id: `ng-chat-file-upload-${123}`,
                value: 'test',
                files: []
            }
        }

        subject.nativeFileInput = fakeFileElement;
        subject.fileUploadAdapter = new MockableFileUploadAdapter();

        subject.onFileChosen(chatWindow);

        expect(MockableFileUploadAdapter.prototype.uploadFile).toHaveBeenCalledTimes(1);
        expect(MockableFileUploadAdapter.prototype.uploadFile).toHaveBeenCalledWith(fakeFile, chatWindow.participant.id);

		expect(messageSentSpy).toHaveBeenCalledTimes(1);
        expect(messageSentSpy.calls.mostRecent().args[0]).toBe(mockedFileMessageServerResponse);

        expect(mockedFileMessageServerResponse.fromId).toBe(subject.userId);
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy.calls.mostRecent().args[1]).toBe(ScrollDirection.Bottom);
        expect(fakeFileElement.nativeElement.value).toBe('');
        expect(anotherFakeFileElement.nativeElement.value).toBe('test');
        expect(subject.isUploadingFile(chatWindow)).toBeFalsy();
    });

    it('Must return default chat options exercise', () => {
        let chattingTo = new User();
        let currentWindow = new Window(chattingTo, false, false);

        subject.showOptions = true;

        let result = subject.defaultWindowOptions(currentWindow);

        expect(result).not.toBeNull();
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0].displayLabel).toBe("Add People");
        expect(result[0].action).not.toBeNull();
        expect(result[0].validateContext).not.toBeNull();

        expect(result[0].validateContext(chattingTo)).toBeTruthy();
        expect(result[0].validateContext(new Group([]))).toBeFalsy();
    });

    it('Must return empty chat options when participant is not an user', () => {
        let chattingTo = new Group([]);
        let currentWindow = new Window(chattingTo, false, false);

        subject.showOptions = true;

        let result = subject.defaultWindowOptions(currentWindow);

        expect(result).not.toBeNull();
        expect(result.length).toBe(0);
    });

    it('Must return empty chat options when showOptions is set to false', () => {
        let chattingTo = new User();
        let currentWindow = new Window(chattingTo, false, false);

        subject.showOptions = false;

        let result = subject.defaultWindowOptions(currentWindow);

        expect(result).not.toBeNull();
        expect(result.length).toBe(0);
    });

    it('Must emit onLoadHistoryTriggered when fetchMessageHistory is invoked', () => {
        const spy = spyOn(subject.onLoadHistoryTriggered, 'emit');

        const user: User = {
            participantType: ChatParticipantType.Group,
            id: 888,
            displayName: 'Test user group',
            status: 1,
            avatar: ''
        };

        const window: Window = new Window(user, false, false);

        subject.fetchMessageHistory(window);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
        expect(spy.calls.mostRecent().args[0]).toBe(window);
    });

    it('Avatar should not be displayed for messages sent by the current user', () => {
        subject.userId = 1;

        const user: User = {
            participantType: ChatParticipantType.User,
            id: subject.userId,
            displayName: 'Test User',
            status: 1,
            avatar: ''
        };

        const window: Window = new Window(user, false, false);

        const message: Message = {
            fromId: user.id,
            toId: 123,
            message: 'Test'
        };

        const isVisible = subject.isAvatarVisible(window, message, 0);

        expect(isVisible).toBeFalse();
    });

    it('Avatar should be displayed for first messages sent by another user', () => {
        subject.userId = 1;

        const user: User = {
            participantType: ChatParticipantType.User,
            id: 123,
            displayName: 'Test User',
            status: 1,
            avatar: ''
        };

        const window: Window = new Window(user, false, false);

        const message: Message = {
            fromId: user.id,
            toId: 123,
            message: 'Test'
        };

        const isVisible = subject.isAvatarVisible(window, message, 0);

        expect(isVisible).toBeTrue();
    });

    it('Avatar should be displayed for messages sent by another user if previous message wasnt from him', () => {
        subject.userId = 1;

        const user: User = {
            participantType: ChatParticipantType.User,
            id: 123,
            displayName: 'Test User',
            status: 1,
            avatar: ''
        };

        const previousMessage: Message = {
            fromId: subject.userId,
            toId: user.id,
            message: 'Test'
        };

        const message: Message = {
            fromId: user.id,
            toId: subject.userId,
            message: 'Test'
        };

        const window: Window = new Window(user, false, false);

        window.messages.push(previousMessage)

        const isVisible = subject.isAvatarVisible(window, message, 1);

        expect(isVisible).toBeTrue();
    });

    it('Avatar should not be displayed for messages sent by another user if they are stacked', () => {
        subject.userId = 1;

        const user: User = {
            participantType: ChatParticipantType.User,
            id: 123,
            displayName: 'Test User',
            status: 1,
            avatar: ''
        };

        const previousMessage: Message = {
            fromId: user.id,
            toId: subject.userId,
            message: 'Test'
        };

        const message: Message = {
            fromId: user.id,
            toId: subject.userId,
            message: 'Test'
        };

        const window: Window = new Window(user, false, false);

        window.messages.push(previousMessage)

        const isVisible = subject.isAvatarVisible(window, message, 1);

        expect(isVisible).toBeFalse();
    });

    it('getChatWindowAvatar must return a users avatar when requested', () => {
        subject.userId = 1;
        const testAvatar = 'test';

        const user: User = {
            participantType: ChatParticipantType.User,
            id: 123,
            displayName: 'Test User',
            status: 1,
            avatar: testAvatar
        };

        const message: Message = {
            fromId: user.id,
            toId: subject.userId,
            message: 'Test'
        };

        const returnedAvatar = subject.getChatWindowAvatar(user, message);

        expect(returnedAvatar).toBe(testAvatar);
    });

    it('getChatWindowAvatar must return a users avatar from a group when requested', () => {
        subject.userId = 1;
        const testAvatar = 'test';

        const user: User = {
            participantType: ChatParticipantType.User,
            id: 123,
            displayName: 'Test User',
            status: 1,
            avatar: testAvatar
        };

        const group: Group = {
            participantType: ChatParticipantType.Group,
            chattingTo: [user],
            displayName: 'Test User Group',
            status: 1,
            id: '1',
            avatar: ''
        };

        const message: Message = {
            fromId: user.id,
            toId: subject.userId,
            message: 'Test'
        };

        const returnedAvatar = subject.getChatWindowAvatar(group, message);

        expect(returnedAvatar).toBe(testAvatar);
    });

    it('An image message must be rendered ', () => {
        const statusDescriptionTestValues: StatusDescription = {
            online: 'Online',
            busy: 'Busy',
            away: 'Away',
            offline: 'Offline'
        };
    
        const localizationStub: Localization = {
            statusDescription: statusDescriptionTestValues,
            title: 'title',
            messagePlaceholder: 'messagePlaceholder',
            searchPlaceholder: 'searchPlaceholder',
            browserNotificationTitle: 'browserNotificationTitle',
            loadMessageHistoryPlaceholder: 'loadMessageHistoryPlaceholder'
        };
        const chatParticipantStatusDescriptor = (status: ChatParticipantStatus) => {
            const currentStatus = ChatParticipantStatus[status].toString().toLowerCase();
            return localizationStub.statusDescription[currentStatus];
        };

        const chattingToUser: IChatParticipant = {
            participantType: ChatParticipantType.User,
            id: '1',
            status: ChatParticipantStatus.Online,
            avatar: null,
            displayName: 'name'
        };
        const imgUrl = 'https://66.media.tumblr.com/avatar_9dd9bb497b75_128.pnj';
        let message: Message = {
            fromId: 1,
            toId: 99,
            message:  imgUrl,
            type: 3
        }
        const currentWindow = new Window(chattingToUser, false, false);

        subject.chatParticipantStatusDescriptor = chatParticipantStatusDescriptor
        subject.localization = localizationStub;

        subject.window = currentWindow
        currentWindow.messages.push(message);

        fixture.detectChanges();
        let img = fixture.debugElement.query(By.css('.image-message'));
        expect(img.attributes['src']).toBe(imgUrl);
    });
});
