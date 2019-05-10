import { NgChat } from '../ng-chat/ng-chat.component';
import { User } from '../ng-chat/core/user';
import { ParticipantResponse } from '../ng-chat/core/participant-response';
import { Window } from '../ng-chat/core/window';
import { ChatAdapter } from '../ng-chat/core/chat-adapter';
import { IChatGroupAdapter } from '../ng-chat/core/chat-group-adapter';
import { Observable, of } from 'rxjs';
import { Message } from '../ng-chat/core/message';
import { EventEmitter } from '@angular/core';
import { ScrollDirection } from '../ng-chat/core/scroll-direction.enum';
import { IFileUploadAdapter } from '../ng-chat/core/file-upload-adapter';
import { FileMessage } from '../ng-chat/core/file-message';
import { MessageType } from '../ng-chat/core/message-type.enum';
import { Theme } from '../ng-chat/core/theme.enum';
import { ChatParticipantType } from '../ng-chat/core/chat-participant-type.enum';
import { ChatParticipantStatus } from '../ng-chat/core/chat-participant-status.enum';
import { Group } from '../ng-chat/core/group';
import { IChatOption } from '../ng-chat/core/chat-option';

class MockableAdapter extends ChatAdapter {
    public listFriends(): Observable<ParticipantResponse[]> {
        throw new Error("Method not implemented.");
    }
    public getMessageHistory(destinataryId: any): Observable<Message[]> {
        throw new Error("Method not implemented.");
    }
    public sendMessage(message: Message): void {
        throw new Error("Method not implemented.");
    }
}

class MockableGroupAdapter implements IChatGroupAdapter {
    groupCreated(group: Group): void {
        throw new Error("Method not implemented.");
    }
}

class MockableFileUploadAdapter implements IFileUploadAdapter {
    uploadFile(file: File, userTo: User): Observable<Message> {
        throw new Error("Method not implemented.");
    }
}

class MockableHTMLAudioElement {
    public play(): void { }
    public load(): void { }
}

// As "any" we allow private methods to be stubbed. Another option would be => spyOn<any>()
let subject: any = null;

describe('NgChat', () => {
    beforeEach(() => {
        subject = new NgChat(null, null); // HttpClient related methods are tested elsewhere
        subject.userId = 123;
        subject.adapter = new MockableAdapter();
        subject.groupAdapter = new MockableGroupAdapter();
        subject.audioFile = new MockableHTMLAudioElement();
    });

    it('Should have default title', () => {
        expect(subject.title).toBe('Friends');
    });

    it('Should have default message placeholder', () => {
        expect(subject.messagePlaceholder).toBe('Type a message');
    });

    it('Should have default friends search placeholder', () => {
        expect(subject.searchPlaceholder).toBe('Search');
    });

    it('Should have default polling interval', () => {
        expect(subject.pollingInterval).toBe(5000);
    });

    it('Must have history enabled by default', () => {
        expect(subject.historyEnabled).not.toBeFalsy();
    });

    it('Must have emojis enabled by default', () => {
        expect(subject.emojisEnabled).not.toBeFalsy();
    });

    it('Audio notification must be enabled by default', () => {
        expect(subject.audioEnabled).not.toBeFalsy();
    });

    it('Audio notification must have a default source', () => {
        expect(subject.audioSource).not.toBeUndefined();
    });

    it('Friends list search must be enabled by default', () => {
        expect(subject.searchEnabled).not.toBeFalsy();
    });

    it('Persistent windows state must be enabled by default', () => {
        expect(subject.persistWindowsState).toBeTruthy();
    });

    it('isCollapsed must be disabled by default', () => {
        expect(subject.isCollapsed).toBeFalsy();
    });

    it('maximizeWindowOnNewMessage must be enabled by default', () => {
        expect(subject.maximizeWindowOnNewMessage).toBeTruthy();
    });

    it('Must use current user id as part of the localStorageKey identifier', () => {
        expect(subject.localStorageKey).toBe(`ng-chat-users-${subject.userId}`);
    });

    it('Browser notifications must be enabled by default', () => {
        expect(subject.browserNotificationsEnabled).not.toBeFalsy();
    });

    it('Browser notifications must have a default source', () => {
        expect(subject.browserNotificationIconSource).not.toBeUndefined();
    });

    it('Browser notifications must not be bootstrapped before initialization', () => {
        expect(subject.browserNotificationsBootstrapped).toBeFalsy();
    });

    it('Browser notifications must have a default title', () => {
        expect(subject.browserNotificationTitle).toBe('New message from');
    });

    it('onParticipantClicked must have a default event emitter', () => {
        expect(subject.onParticipantClicked).toBeDefined();
    });

    it('onParticipantChatClosed must have a default event emitter', () => {
        expect(subject.onParticipantChatClosed).toBeDefined();
    });

    it('onParticipantChatClosed must have a default event emitter', () => {
        expect(subject.onParticipantChatClosed).toBeDefined();
    });

    it('File upload url must be undefined by default', () => {
        expect(subject.fileUploadAdapter).toBeUndefined();
    });

    it('Default theme must be Light', () => {
        expect(subject.theme).toBe(Theme.Light);
    });

    it('Custom theme must be undefined by default', () => {
        expect(subject.customTheme).toBeUndefined();
    });

    it('Exercise participants filter', () => {
        subject.participants = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        subject.searchInput = 'Test 1';

        const result = subject.filteredParticipants;

        expect(subject.participants.length).toBe(2);
        expect(result.length).toBe(1);
    });

    it('Exercise participants not found filter', () => {
        subject.participants = [{
            id: 1,
            displayName: 'Test 1'
        },
        {
            id: 2,
            displayName: 'Test 2'
        }];

        subject.searchInput = 'Test 3';

        const result = subject.filteredParticipants;

        expect(subject.participants.length).toBe(2);
        expect(result.length).toBe(0);
    });

    it('Must display max visible windows on viewport', () => {
        subject.viewPortTotalArea = 960; // Just enough for 2 windows based on the default window size of 320

        expect(subject.windows.length).toBe(0);

        spyOn(subject, 'updateWindowsState');

        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.NormalizeWindows();

        expect(subject.windows.length).toBe(2);
        expect(subject.updateWindowsState).toHaveBeenCalledTimes(1);
        expect(subject.updateWindowsState).toHaveBeenCalledWith(subject.windows);
    });

    it('Must display max visible windows on viewport when "hideFriendsList" is enabled', () => {
        subject.viewPortTotalArea = 960;
        subject.hideFriendsList = true

        expect(subject.windows.length).toBe(0);

        spyOn(subject, 'updateWindowsState');

        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.NormalizeWindows();

        expect(subject.windows.length).toBe(3);
        expect(subject.updateWindowsState).toHaveBeenCalledTimes(1);
        expect(subject.updateWindowsState).toHaveBeenCalledWith(subject.windows);
    });

    it('Must hide friends list when there is not enough viewport to display at least one chat window ', () => {
        subject.viewPortTotalArea = 400;

        expect(subject.windows.length).toBe(0);

        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.NormalizeWindows();

        expect(subject.windows.length).toBe(0);
        expect(subject.unsupportedViewport).toBe(true);
    });

    it('Must invoke adapter on fetchFriendsList', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(of([]));

        subject.fetchFriendsList(false);

        expect(MockableAdapter.prototype.listFriends).toHaveBeenCalledTimes(1);
    });

    it('Must invoke restore windows state on fetchFriendsList when bootstrapping', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(of([]));
        spyOn(subject, 'restoreWindowsState');

        subject.fetchFriendsList(true);

        expect(subject.restoreWindowsState).toHaveBeenCalledTimes(1);
    });

    it('Must not invoke restore windows state on fetchFriendsList when not bootstrapping', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(of([]));
        spyOn(subject, 'restoreWindowsState');

        subject.fetchFriendsList(false);

        expect(subject.restoreWindowsState).not.toHaveBeenCalled();
    });

    it('Must update participants property when onFriendsListChanged is invoked', () => {
        expect(subject.participantsResponse).toBeUndefined();

        subject.participantsInteractedWith = [new User()];

        subject.onFriendsListChanged([
            new ParticipantResponse(),
            new ParticipantResponse()
        ]);

        expect(subject.participantsResponse.length).toBe(2);
        expect(subject.participants.length).toBe(2);
        expect(subject.participantsInteractedWith.length).toBe(0);
    });

    it('Must return existing open chat window when requesting a chat window instance', () => {
        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.windows = [
            {
                participant: user
            }
        ];

        let result = subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).toBeFalsy();
        expect(result[0].participant.id).toEqual(user.id);
        expect(result[0].participant.displayName).toEqual(user.displayName);
    });

    it('Must open a new window on a openChatWindow request when it is not opened yet', () => {
        subject.historyEnabled = false;

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let result = subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].participant.id).toEqual(user.id);
        expect(result[0].participant.displayName).toEqual(user.displayName);
    });

    it('Must focus on the new window on a openChatWindow request when argument is supplied', () => {
        subject.historyEnabled = false;

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(subject, 'focusOnWindow');

        let result = subject.openChatWindow(user, true);

        expect(result).not.toBeUndefined();
        expect(subject.focusOnWindow).toHaveBeenCalledTimes(1);
    });

    it('Must not focus on the new window on a openChatWindow request when argument is not supplied', () => {
        subject.historyEnabled = false;

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(subject, 'focusOnWindow');

        let result = subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(subject.focusOnWindow).not.toHaveBeenCalled();
    });

    it('Must load history from ChatAdapter when opening a window that is not yet opened', () => {
        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(MockableAdapter.prototype, 'getMessageHistory').and.returnValue(of([]));

        let result = subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].participant.id).toEqual(user.id);
        expect(result[0].participant.displayName).toEqual(user.displayName);
        expect(MockableAdapter.prototype.getMessageHistory).toHaveBeenCalledTimes(1);
    });

    it('Mark messages as seen exercise', () => {
        let messages: Message[] = [{
            fromId: 1,
            message: 'Test',
            toId: 2
        },
        {
            fromId: 1,
            message: 'Test 2',
            toId: 2
        }]

        subject.markMessagesAsRead(messages);

        expect(messages.length).toBe(2);
        expect(messages[0].dateSeen).not.toBeUndefined();
        expect(messages[0].dateSeen.getTime()).toBeGreaterThan(new Date().getTime() - 60000);
        expect(messages[1].dateSeen).not.toBeUndefined();
        expect(messages[1].dateSeen.getTime()).toBeGreaterThan(new Date().getTime() - 60000);
    });

    it('Should play HTMLAudioElement when emitting a message sound on an unfocused window', () => {
        let window = new Window(null, false, false);

        spyOn(MockableHTMLAudioElement.prototype, 'play');

        subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    it('Should not play HTMLAudioElement when emitting a message sound on a focused window', () => {
        let window = new Window(null, false, false);

        window.hasFocus = true;

        spyOn(MockableHTMLAudioElement.prototype, 'play');

        subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).not.toHaveBeenCalled();
    });

    it('Should not play HTMLAudioElement when audio notification is disabled', () => {
        let window = new Window(null, false, false);

        subject.audioEnabled = false;

        spyOn(MockableHTMLAudioElement.prototype, 'play');

        subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).not.toHaveBeenCalled();
    });

    it('Must invoke message notification method on new messages', () => {
        let message = new Message();
        let user = new User();

        spyOn(subject, 'emitMessageSound');
        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitMessageSound).toHaveBeenCalledTimes(1);
    });

    it('Must invoke message type assertion method on new messages', () => {
        let message = new Message();
        let user = new User();

        spyOn(subject, 'assertMessageType');

        // Masking these calls as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');
        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(subject, 'scrollChatWindow');

        subject.onMessageReceived(user, message);

        expect(subject.assertMessageType).toHaveBeenCalledTimes(1);
    });

    it('Must mark message as seen on new messages if the current window has focus', () => {
        let message = new Message();
        let user = new User();
        let window = new Window(null, false, false);

        window.hasFocus = true;

        let eventSpy = spyOn(subject.onMessagesSeen, 'emit');

        spyOn(subject, 'markMessagesAsRead');
        spyOn(subject, 'openChatWindow').and.returnValue([window, false]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound'); // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.markMessagesAsRead).toHaveBeenCalledTimes(1);
        expect(eventSpy).toHaveBeenCalled();
        expect(eventSpy).toHaveBeenCalledTimes(1);
        expect(eventSpy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must not mark message as seen on new messages if the current window does not have focus', () => {
        let message = new Message();
        let user = new User();
        let window = new Window(null, false, false);

        window.hasFocus = false;

        let eventSpy = spyOn(subject.onMessagesSeen, 'emit');

        spyOn(subject, 'markMessagesAsRead');
        spyOn(subject, 'openChatWindow').and.returnValue([window, false]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound'); // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.markMessagesAsRead).not.toHaveBeenCalled();
        expect(eventSpy).not.toHaveBeenCalled();
    });

    it('Should not use local storage persistency if persistWindowsState is disabled', () => {
        let windows = [new Window(null, false, false)];

        subject.persistWindowsState = false;

        spyOn(localStorage, 'setItem');

        subject.updateWindowsState(windows);

        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('Update windows state exercise', () => {
        let persistedValue = null;

        spyOn(localStorage, 'setItem').and.callFake((key, value) => {
            persistedValue = value;
        });

        let firstUser = new User();
        let secondUser = new User();

        firstUser.id = 88;
        secondUser.id = 99;

        let firstWindow = new Window(firstUser, false, false);
        let secondWindow = new Window(secondUser, false, false);

        let windows = [firstWindow, secondWindow];

        subject.updateWindowsState(windows);

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(persistedValue).toBe(JSON.stringify([88, 99]));
    });

    it('Should not restore windows state from local storage if persistWindowsState is disabled', () => {
        subject.persistWindowsState = false;

        spyOn(subject, 'openChatWindow');

        subject.restoreWindowsState();

        expect(subject.openChatWindow).not.toHaveBeenCalled();
    });

    it('Restore windows state exercise', () => {
        let firstUser = new User();
        let secondUser = new User();

        firstUser.id = 88;
        secondUser.id = 99;

        localStorage.setItem(subject.localStorageKey, JSON.stringify([firstUser.id, secondUser.id]));

        subject.participants = [firstUser, secondUser];
        let pushedParticipants = [];

        spyOn(subject, 'openChatWindow').and.callFake((participant) => {
            pushedParticipants.push(participant);
        });

        subject.restoreWindowsState();

        expect(subject.openChatWindow).toHaveBeenCalledTimes(2);
        expect(pushedParticipants).not.toBeNull();
        expect(pushedParticipants.length).toBe(2);
        expect(pushedParticipants[0]).toBe(firstUser);
        expect(pushedParticipants[1]).toBe(secondUser);
    });

    it('Must invoke window state update when closing a chat window', () => {
        subject.windows = [new Window(null, false, false)];

        spyOn(subject, 'updateWindowsState');

        let result = subject.onCloseChatWindow(subject.windows[0]);

        expect(subject.updateWindowsState).toHaveBeenCalledTimes(1);
    });

    it('Must send a new message when the ENTER key is pressed', () => {
        
        let chattingToUser = new User();
        let sentMessage: Message = null;
        let event = {
            keyCode: 13
        };

        chattingToUser.id = 99;

        let currentWindow = new Window(chattingToUser, false, false);

        currentWindow.newMessage = "Test";

        spyOn(MockableAdapter.prototype, 'sendMessage').and.callFake((message: Message) => {
            sentMessage = message;
        });
        let spy = spyOn(subject, 'scrollChatWindow');

        subject.onChatInputTyped(event, currentWindow);

        expect(currentWindow.newMessage).toBe(""); // Should clean the message input after dispatching the message
        expect(MockableAdapter.prototype.sendMessage).toHaveBeenCalledTimes(1);
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args[1]).toBe(ScrollDirection.Bottom);
        
        expect(sentMessage).not.toBeNull();
        expect(sentMessage.message).toBe("Test");
    });

    it('Must not send a new message when the ENTER key is pressed but the message input is empty', () => {
        let chattingToUser = new User();
        let sentMessage: Message = null;
        let event = {
            keyCode: 13
        };

        chattingToUser.id = 99;

        let currentWindow = new Window(chattingToUser, false, false);

        currentWindow.newMessage = "";

        spyOn(MockableAdapter.prototype, 'sendMessage').and.callFake((message: Message) => {
            sentMessage = message;
        });
        spyOn(subject, 'scrollChatWindow');

        subject.onChatInputTyped(event, currentWindow);

        expect(MockableAdapter.prototype.sendMessage).not.toHaveBeenCalled();
        expect(subject.scrollChatWindow).not.toHaveBeenCalled();
        expect(sentMessage).toBeNull();
    });

    it('Must close the current window when the ESC key is pressed', () => {
        let currentWindow = new Window(null, false, false);
        let closedWindow: Window = null;
        let event = {
            keyCode: 27
        };

        spyOn(subject, 'onCloseChatWindow').and.callFake((window: Window) => {
            closedWindow = window;
        });

        subject.onChatInputTyped(event, currentWindow);

        expect(subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(closedWindow).not.toBeNull();
        expect(closedWindow).toBe(currentWindow);
    });

    it('Must focus on closest window when the ESC key is pressed', () => {
        let currentWindow = new Window(null, false, false);
        let closestWindow = new Window(null, false, false);
        let closedWindow: Window = null;
        let event = {
            keyCode: 27
        };

        spyOn(subject, 'onCloseChatWindow');

        spyOn(subject, 'getClosestWindow').and.returnValue(closestWindow);

        spyOn(subject, 'focusOnWindow').and.callFake((window: Window, callback: Function) => {
            callback(); // This should invoke onCloseChatWindow
        });;

        subject.onChatInputTyped(event, currentWindow);

        expect(subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(subject.getClosestWindow).toHaveBeenCalledTimes(1);
        expect(subject.focusOnWindow).toHaveBeenCalledTimes(1);
    });

    it('Must not focus on closest window when the ESC key is pressed and there is no other window opened', () => {
        let currentWindow = new Window(null, false, false);
        let closedWindow: Window = null;
        let event = {
            keyCode: 27
        };

        spyOn(subject, 'onCloseChatWindow');
        spyOn(subject, 'getClosestWindow').and.returnValue(undefined);
        spyOn(subject, 'focusOnWindow');

        subject.onChatInputTyped(event, currentWindow);

        expect(subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(subject.getClosestWindow).toHaveBeenCalledTimes(1);
        expect(subject.focusOnWindow).not.toHaveBeenCalled();
    });

    it('Must move to the next chat window when the TAB key is pressed', () => {
        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.chatWindowInputs = {
            toArray: () => { }
        };

        let fakeChatInputs = [
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            }
        ];

        let event = {
            keyCode: 9,
            preventDefault: () => { }
        };

        spyOn(fakeChatInputs[0].nativeElement, 'focus');
        spyOn(fakeChatInputs[1].nativeElement, 'focus');
        spyOn(fakeChatInputs[2].nativeElement, 'focus');
        spyOn(event, 'preventDefault');
        spyOn(subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);

        subject.onChatInputTyped(event, subject.windows[1]);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[0].nativeElement.focus).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[1].nativeElement.focus).not.toHaveBeenCalled();
        expect(fakeChatInputs[2].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('Must move to the previous chat window when SHIFT + TAB keys are pressed', () => {
        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.chatWindowInputs = {
            toArray: () => { }
        };

        let fakeChatInputs = [
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            }
        ];

        let event = {
            keyCode: 9,
            shiftKey: true,
            preventDefault: () => { }
        };

        spyOn(fakeChatInputs[0].nativeElement, 'focus');
        spyOn(fakeChatInputs[1].nativeElement, 'focus');
        spyOn(fakeChatInputs[2].nativeElement, 'focus');
        spyOn(event, 'preventDefault');
        spyOn(subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);

        subject.onChatInputTyped(event, subject.windows[1]);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[2].nativeElement.focus).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[1].nativeElement.focus).not.toHaveBeenCalled();
        expect(fakeChatInputs[0].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('Must copy default text when a localization object was not supplied while initializing default text', () => {
        expect(subject.localization).toBeUndefined();

        subject.initializeDefaultText();

        expect(subject.localization).not.toBeUndefined();
        expect(subject.localization.title).toBe(subject.title);
        expect(subject.localization.searchPlaceholder).toBe(subject.searchPlaceholder);
        expect(subject.localization.messagePlaceholder).toBe(subject.messagePlaceholder);
        expect(subject.localization.statusDescription).toBe(subject.statusDescription);
        expect(subject.localization.browserNotificationTitle).toBe(subject.browserNotificationTitle);
    });

    it('Must not copy default text when a localization object was supplied while initializing default text', () => {
        subject.localization = {
            title: 'test 01',
            searchPlaceholder: 'test 02',
            messagePlaceholder: 'test 03',
            statusDescription: {
                online: 'test 04',
                busy: 'test 05',
                away: 'test 06',
                offline: 'test 07'
            },
            browserNotificationTitle: 'test 08',
            loadMessageHistoryPlaceholder: 'Load more messages'
        };

        subject.initializeDefaultText();

        expect(subject.localization).not.toBeUndefined();
        expect(subject.localization.title).not.toBe(subject.title);
        expect(subject.localization.searchPlaceholder).not.toBe(subject.searchPlaceholder);
        expect(subject.localization.messagePlaceholder).not.toBe(subject.messagePlaceholder);
        expect(subject.localization.statusDescription).not.toBe(subject.statusDescription);
        expect(subject.localization.browserNotificationTitle).not.toBe(subject.browserNotificationTitle);
        expect(subject.localization.loadMessageHistoryPlaceholder).not.toBe('Load older messages');
    });

    it('FocusOnWindow exercise', () => {
        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        subject.chatWindowInputs = {
            toArray: () => { }
        };

        let fakeChatInputs = [
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            },
            {
                nativeElement:
                    {
                        focus: () => { }
                    }
            }
        ];

        spyOn(fakeChatInputs[1].nativeElement, 'focus');
        spyOn(subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);

        spyOn(window, 'setTimeout').and.callFake((fn) => {
            fn();
        });

        subject.focusOnWindow(subject.windows[1]);

        expect(fakeChatInputs[1].nativeElement.focus).toHaveBeenCalledTimes(1);
    });

    it('Must not focus on native element if a window is not found to focus when focusOnWindow is invoked', () => {
        subject.windows = [];

        subject.chatWindowInputs = {
            toArray: () => { }
        };

        subject.focusOnWindow(new Window(null, false, false));
    });

    it('GetClosestWindow must return next relative right chat window', () => {
        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        let result = subject.getClosestWindow(subject.windows[2]);

        expect(result).toBe(subject.windows[1]);
    });

    it('GetClosestWindow must return previous chat window on 0 based index', () => {
        subject.windows = [
            new Window(null, false, false),
            new Window(null, false, false),
            new Window(null, false, false)
        ];

        let result = subject.getClosestWindow(subject.windows[0]);

        expect(result).toBe(subject.windows[1]);
    });

    it('GetClosestWindow must return undefined when there is only one chat window opened on the chat', () => {
        subject.windows = [
            new Window(null, false, false)
        ];

        let result = subject.getClosestWindow(subject.windows[0]);

        expect(result).toBe(undefined);
    });

    it('GetClosestWindow must return undefined when there is no open chat window on the chat', () => {
        subject.windows = [];

        let result = subject.getClosestWindow(new Window(null, false, false));

        expect(result).toBe(undefined);
    });

    it('Must bootstrap browser notifications when user permission is granted', async () => {
        subject.browserNotificationsBootstrapped = false;
        spyOn(Notification, 'requestPermission').and.returnValue(true);

        await subject.initializeBrowserNotifications();

        expect(subject.browserNotificationsBootstrapped).toBeTruthy();
        expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('Must not bootstrap browser notifications when user permission is not granted', async () => {
        subject.browserNotificationsBootstrapped = false;
        spyOn(Notification, 'requestPermission').and.returnValue(false);

        await subject.initializeBrowserNotifications();

        expect(subject.browserNotificationsBootstrapped).toBeFalsy();
        expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
    });

    it('Must invoke emitBrowserNotification on new messages', () => {
        let message = new Message();
        let user = new User();

        spyOn(subject, 'emitBrowserNotification');
        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).toHaveBeenCalledTimes(1);
    });

    it('Must delegate message argument when invoking emitBrowserNotification on new messages', () => {
        let message = new Message();
        let argMessage = null;
        message.message = 'Test message';

        let user = new User();
        subject.historyEnabled = true;

        spyOn(subject, 'emitBrowserNotification').and.callFake((window, message) => {
            argMessage = message;
        });

        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).toHaveBeenCalledTimes(1);
        expect(argMessage).toBe(message);
    });

    it('Must not invoke emitBrowserNotification when the maximizeWindowOnNewMessage setting is disabled', () => {
        let message = new Message();
        let user = new User();

        subject.maximizeWindowOnNewMessage = false;

        spyOn(subject, 'emitBrowserNotification');
        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).not.toHaveBeenCalled();
    });

    it('Must invoke emitBrowserNotification when the maximizeWindowOnNewMessage setting is disabled but the window is maximized', () => {
        let message = new Message();
        let user = new User();
        let window = new Window(null, false, false);

        subject.maximizeWindowOnNewMessage = false;

        spyOn(subject, 'emitBrowserNotification');
        spyOn(subject, 'openChatWindow').and.returnValue([window, false]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).toHaveBeenCalledTimes(1);
    });

    it('Must not invoke emitBrowserNotification when the maximizeWindowOnNewMessage setting is disabled and the window is collapsed', () => {
        let message = new Message();
        let user = new User();
        let window = new Window(null, false, true);

        subject.maximizeWindowOnNewMessage = false;

        spyOn(subject, 'emitBrowserNotification');
        spyOn(subject, 'openChatWindow').and.returnValue([window, false]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).not.toHaveBeenCalled();
    });

    it('Must not invoke emitBrowserNotification when the maximizeWindowOnNewMessage setting is disabled and the window was freshly opened', () => {
        let message = new Message();
        let user = new User();
        let window = new Window(null, false, false);

        subject.maximizeWindowOnNewMessage = false;

        spyOn(subject, 'emitBrowserNotification');
        spyOn(subject, 'openChatWindow').and.returnValue([window, true]);
        spyOn(subject, 'scrollChatWindow'); // Masking this call as we're not testing this part on this spec
        spyOn(subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

        subject.onMessageReceived(user, message);

        expect(subject.emitBrowserNotification).not.toHaveBeenCalled();
    });

    it('Must invoke onParticipantChatOpened event when a chat window is open via user click', () => {
        subject.historyEnabled = false;
        subject.windows = [];

        spyOn(subject, 'updateWindowsState');
        spyOn(subject, 'focusOnWindow');

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantChatOpened.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.openChatWindow(user, false, true);

        expect(eventInvoked).toBeTruthy();
        expect(eventArgument).toBe(user);
    });

    it('Must not invoke onParticipantChatOpened event when a window is already open for the user', () => {
        subject.historyEnabled = false;

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantChatOpened.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.windows = [
            {
                participant: user
            }
        ];

        subject.openChatWindow(user, true, true);

        expect(eventInvoked).toBeFalsy();
        expect(eventArgument).toBe(null);
    });

    it('Must pop existing window when viewport does not have enough space for another window', () => {
        const user: User = {
            participantType: ChatParticipantType.User,
            id: 777,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };
        
        const newUser: User = {
            participantType: ChatParticipantType.User,
            id: 888,
            displayName: 'Test user 2',
            status: 1,
            avatar: ''
        };

        const userToBeRemoved: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user 2',
            status: 1,
            avatar: ''
        };
        
        const remainingWindow = new Window(user, false, false);
        const windowToBeRemoved = new Window(userToBeRemoved, false, false);
        
        subject.viewPortTotalArea = 960;
        subject.historyEnabled = false;
        subject.windows = [
            remainingWindow,
            windowToBeRemoved
        ];

        spyOn(subject, 'updateWindowsState');
        spyOn(subject, 'focusOnWindow');
        spyOn(subject, 'onParticipantChatOpened');

        subject.openChatWindow(newUser, false, true);

        expect(subject.windows.length).toBe(2);
        expect(subject.windows[0].participant).toBe(newUser);
        expect(subject.windows[1].participant).toBe(user);
    });

    it('Must push to viewport when friends list is disabled exercise', () => {
        const user: User = {
            participantType: ChatParticipantType.User,
            id: 777,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };
        
        const newUser: User = {
            participantType: ChatParticipantType.User,
            id: 888,
            displayName: 'Test user 2',
            status: 1,
            avatar: ''
        };

        const userThatWouldBeRemoved: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user 2',
            status: 1,
            avatar: ''
        };
        
        const remainingWindow = new Window(user, false, false);
        const windowThatWouldBeRemoved = new Window(userThatWouldBeRemoved, false, false);
        
        subject.hideFriendsList = true;
        subject.viewPortTotalArea = 961; // Would be enough for only 2 if the friends list was enabled. 1px more than window factor * 3
        subject.historyEnabled = false;
        subject.windows = [
            remainingWindow,
            windowThatWouldBeRemoved
        ];

        spyOn(subject, 'updateWindowsState');
        spyOn(subject, 'focusOnWindow');
        spyOn(subject, 'onParticipantChatOpened');

        subject.openChatWindow(newUser, false, true);

        expect(subject.windows.length).toBe(3);
        expect(subject.windows[0].participant).toBe(newUser);
        expect(subject.windows[1].participant).toBe(user);
        expect(subject.windows[2].participant).toBe(userThatWouldBeRemoved);
    });
    
    it('Must invoke onParticipantChatClosed event when a window is closed', () => {

        let window = new Window({
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        }, false, false);

        subject.windows = [window];

        spyOn(subject, 'updateWindowsState'); // Bypassing this

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantChatClosed.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let result = subject.onCloseChatWindow(subject.windows[0]);

        expect(eventInvoked).toBeTruthy();
        expect(eventArgument).toBe(window.participant);
    });

    it('Must not invoke onParticipantClicked event when a user is clicked on the friend list and the window is already open', () => {
        subject.historyEnabled = false;

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantClicked.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.windows = [
            {
                participant: user
            }
        ];

        subject.openChatWindow(user, true, true);

        expect(eventInvoked).toBeFalsy();
        expect(eventArgument).toBe(null);
    });

    it('Must not invoke onParticipantClicked event when a window is open but not triggered directly via user click', () => {
        subject.historyEnabled = false;

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantClicked.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.openChatWindow(user, true, false);

        expect(eventInvoked).toBeFalsy();
        expect(eventArgument).toBe(null);
    });

    it('Must invoke onParticipantClicked event when a user is clicked on the friend list', () => {
        subject.historyEnabled = false;
        subject.windows = [];

        let eventInvoked = false;
        let eventArgument = null;

        subject.onParticipantClicked.subscribe(e => {
            eventInvoked = true;
            eventArgument = e;
        });

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.openChatWindow(user, true, true);

        expect(eventInvoked).toBeTruthy();
        expect(eventArgument).toBe(user);
    });
    
    it('Must invoke onMessagesSeen event when a user window gets focus', () => {
        let spy = spyOn(subject.onMessagesSeen, 'emit');
        
        subject.windows = [];
        
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
                toId: 123,
                message:'Hi',
                dateSeen: new Date()
            },
            {
                fromId: 999,
                toId: 123,
                message:'Hi'
            }
        ];
        
        let window: Window = new Window(user, false, false);
        window.messages = messages;
        
        subject.windows.push(window);
        
        subject.toggleWindowFocus(window);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must invoke onMessagesSeen event when a chat group window gets focus', () => {
        let spy = spyOn(subject.onMessagesSeen, 'emit');
        
        subject.windows = [];
        
        let user: User = {
            participantType: ChatParticipantType.Group,
            id: 888,
            displayName: 'Test user group',
            status: 1,
            avatar: ''
        };
        
        let messages: Message[] = [
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
        
        let window: Window = new Window(user, false, false);
        window.messages = messages;
        
        subject.windows.push(window);
        
        subject.toggleWindowFocus(window);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must not invoke onMessagesSeen event when a window gets focus but there are no new messages', () => {
        spyOn(subject.onMessagesSeen, 'emit');
        spyOn(subject, 'markMessagesAsRead');
        
        subject.windows = [];
        
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
        
        subject.windows.push(window);
        
        subject.toggleWindowFocus(window);

        expect(subject.onMessagesSeen.emit).not.toHaveBeenCalled();
        expect(subject.markMessagesAsRead).not.toHaveBeenCalled();
    });

    it('Must invoke openChatWindow when triggerOpenChatWindow is invoked', () => {
        let spy = spyOn(subject, 'openChatWindow');

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        subject.triggerOpenChatWindow(user);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must not invoke openChatWindow when triggerOpenChatWindow is invoked but user is undefined', () => {
        let spy = spyOn(subject, 'openChatWindow');

        subject.triggerOpenChatWindow(null);

        expect(spy).not.toHaveBeenCalled();
    });

    it('Must invoke onCloseChatWindow when triggerCloseChatWindow is invoked', () => {
        let spy = spyOn(subject, 'onCloseChatWindow');

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let window: Window = new Window(user, false, false);
        
        subject.windows.push(window);

        subject.triggerCloseChatWindow(user.id);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must not invoke onCloseChatWindow when triggerCloseChatWindow is invoked but user is not found', () => {
        let spy = spyOn(subject, 'onCloseChatWindow');

        subject.windows = [];

        subject.triggerCloseChatWindow(1);

        expect(spy).not.toHaveBeenCalled();
    });

    it('Must invoke onChatWindowClicked when triggerToggleChatWindowVisibility is invoked', () => {
        let spy = spyOn(subject, 'onChatWindowClicked');

        let user: User = {
            participantType: ChatParticipantType.User,
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let window: Window = new Window(user, false, false);
        
        subject.windows.push(window);

        subject.triggerToggleChatWindowVisibility(user.id);

        expect(spy).toHaveBeenCalled();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(spy.calls.mostRecent().args.length).toBe(1);
    });

    it('Must not invoke onChatWindowClicked when triggerToggleChatWindowVisibility is invoked but user is not found', () => {
        let spy = spyOn(subject, 'onChatWindowClicked');

        subject.windows = [];

        subject.triggerToggleChatWindowVisibility(1);

        expect(spy).not.toHaveBeenCalled();
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

        spyOn(MockableAdapter.prototype, 'sendMessage');
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

        subject.nativeFileInputs = [anotherFakeFileElement, fakeFileElement];
        subject.fileUploadAdapter = new MockableFileUploadAdapter();

        subject.onFileChosen(chatWindow);

        expect(MockableFileUploadAdapter.prototype.uploadFile).toHaveBeenCalledTimes(1);
        expect(MockableFileUploadAdapter.prototype.uploadFile).toHaveBeenCalledWith(fakeFile, chatWindow.participant.id);
        expect(MockableAdapter.prototype.sendMessage).toHaveBeenCalledTimes(1);
        expect(MockableAdapter.prototype.sendMessage).toHaveBeenCalledWith(mockedFileMessageServerResponse);
        expect(mockedFileMessageServerResponse.fromId).toBe(subject.userId);
        expect(scrollSpy).toHaveBeenCalledTimes(1);
        expect(scrollSpy.calls.mostRecent().args[1]).toBe(ScrollDirection.Bottom);
        expect(fakeFileElement.nativeElement.value).toBe('');
        expect(anotherFakeFileElement.nativeElement.value).toBe('test');
        expect(subject.isUploadingFile(chatWindow)).toBeFalsy();
    });

    it('Assert message type must default to text when no message type is defined in a message instance', () => {
        let nullMessageType = new Message();
        nullMessageType.type = null; // Overriding the default value

        let undefinedMessageType: Message = {
            fromId: 1,
            toId: 2,
            message: 'test'
        };

        let fileMessageType = new Message();
        fileMessageType.type = MessageType.File; // This must remain as it is

        subject.assertMessageType(nullMessageType);
        subject.assertMessageType(undefinedMessageType);
        subject.assertMessageType(fileMessageType);

        expect(nullMessageType.type).toBe(MessageType.Text);
        expect(undefinedMessageType.type).toBe(MessageType.Text);
        expect(fileMessageType.type).toBe(MessageType.File);
    });

    it('Must set theme to "Custom" if a custom theme URL is set', () => {
        subject.customTheme = "https://sample.test/custom-theme.css";

        subject.initializeTheme();

        expect(subject.theme).toBe(Theme.Custom);
    });

    it('Must throw Error on theme initialization if a unknown theme schema is set', () => {
        subject.theme = "invalid-theme";

        expect(() => subject.initializeTheme()).toThrow(new Error(`Invalid theme configuration for ng-chat. "${subject.theme}" is not a valid theme value.`));
    });

    it('Must return default chat options exercise', () => {
        let chattingTo = new User();
        let currentWindow = new Window(chattingTo, false, false);

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

        let result = subject.defaultWindowOptions(currentWindow);

        expect(result).not.toBeNull();
        expect(result.length).toBe(0);
    });

    it('Must return empty chat options when group adapter is not supplied', () => {
        let chattingTo = new User();
        let currentWindow = new Window(chattingTo, false, false);

        subject.groupAdapter = null;

        let result = subject.defaultWindowOptions(currentWindow);

        expect(result).not.toBeNull();
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

    it('onFriendsListActionCancelClicked invoked should clear selection state', () => {
        let mockedUser = new User();
        mockedUser.id = 999;
        
        let mockedOption = {
            isActive: false,
            displayLabel: 'Test',
            action: null,
            validateContext: null
        } as IChatOption;

        subject.currentActiveOption = mockedOption;
        
        subject.selectedUsersFromFriendsList = [mockedUser];

        subject.onFriendsListActionCancelClicked();

        expect(subject.currentActiveOption).toBeNull();
        expect(mockedOption.isActive).toBeFalsy();
        expect(subject.selectedUsersFromFriendsList).not.toBeNull();
        expect(subject.selectedUsersFromFriendsList.length).toBe(0);
    });

    it('onFriendsListActionConfirmClicked invoked exercise', () => {
        let mockedFirstUser = new User();
        let mockedSecondUser = new User();
        let createdGroup: Group = null;

        mockedFirstUser.id = 888;
        mockedSecondUser.id = 999;

        // To test sorting of the name
        mockedFirstUser.displayName = "ZZZ";
        mockedSecondUser.displayName = "AAA";

        subject.selectedUsersFromFriendsList = [mockedFirstUser, mockedSecondUser];

        spyOn(MockableGroupAdapter.prototype, 'groupCreated').and.callFake((group: Group) => {
            createdGroup = group;
        });

        spyOn(subject, 'openChatWindow').and.returnValue([null, true]);

        subject.onFriendsListActionConfirmClicked();

        expect(createdGroup).not.toBeNull();
        expect(createdGroup.chattingTo).not.toBeNull();
        expect(createdGroup.chattingTo.length).toBe(2);
        expect(createdGroup.chattingTo[0]).toBe(mockedFirstUser);
        expect(createdGroup.chattingTo[1]).toBe(mockedSecondUser);
        expect(createdGroup.displayName).toBe("AAA, ZZZ");
        expect(MockableGroupAdapter.prototype.groupCreated).toHaveBeenCalledTimes(1);
        expect(subject.openChatWindow).toHaveBeenCalledTimes(1);
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
});
