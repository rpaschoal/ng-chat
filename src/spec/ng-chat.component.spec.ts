import { NgChat } from '../ng-chat/ng-chat.component';
import { User } from '../ng-chat/core/user';
import { Window } from '../ng-chat/core/window';
import { ChatAdapter } from '../ng-chat/core/chat-adapter';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { Message } from '../ng-chat/core/message';
import { EventEmitter } from '@angular/core';

class MockableAdapter extends ChatAdapter {
    public listFriends(): Observable<User[]> {
        throw new Error("Method not implemented.");
    }
    public getMessageHistory(userId: any): Observable<Message[]> {
        throw new Error("Method not implemented.");
    }
    public sendMessage(message: Message): void {
        throw new Error("Method not implemented.");
    }       
}

class MockableHTMLAudioElement {
    public play(): void {}
    public load(): void {}
}

describe('NgChat', () => {
    beforeEach(() => {
        this.subject = new NgChat();
        this.subject.userId = 123;
        this.subject.adapter = new MockableAdapter();
        this.subject.audioFile = new MockableHTMLAudioElement();
    });

    it('Should have default title', () => {
        expect(this.subject.title).toBe('Friends');
    });

    it('Should have default message placeholder', () => {
        expect(this.subject.messagePlaceholder).toBe('Type a message');
    });

    it('Should have default friends search placeholder', () => {
        expect(this.subject.searchPlaceholder).toBe('Search');
    });

    it('Should have default polling interval', () => {
        expect(this.subject.pollingInterval).toBe(5000);
    });

    it('Must have history enabled by default', () => {
        expect(this.subject.historyEnabled).not.toBeFalsy();
    });

    it('Must have emojis enabled by default', () => {
        expect(this.subject.emojisEnabled).not.toBeFalsy();
    });

    it('Audio notification must be enabled by default', () => {
        expect(this.subject.audioEnabled).not.toBeFalsy();
    });

    it('Audio notification must have a default source', () => {
        expect(this.subject.audioSource).not.toBeUndefined();
    });

    it('Persistent windows state must be enabled by default', () => {
        expect(this.subject.persistWindowsState).toBeTruthy();
    });

    it('Must use current user id as part of the localStorageKey identifier', () => {
        expect(this.subject.localStorageKey).toBe(`ng-chat-users-${this.subject.userId}`);
    });

    it('Browser notifications must be enabled by default', () => {
        expect(this.subject.browserNotificationsEnabled).not.toBeFalsy();
    });

    it('Browser notifications must have a default source', () => {
        expect(this.subject.browserNotificationIconSource).not.toBeUndefined();
    });

    it('Browser notifications must not be bootstrapped before initialization', () => {
        expect(this.subject.browserNotificationsBootstrapped).toBeFalsy();
    });

    it('onUserClicked must have a default event emitter', () => {
        expect(this.subject.onUserClicked).toBeDefined();
    });

    it('onUserChatOpened must have a default event emitter', () => {
        expect(this.subject.onUserChatOpened).toBeDefined();
    });

    it('onUserChatClosed must have a default event emitter', () => {
        expect(this.subject.onUserChatClosed).toBeDefined();
    });

    it('Exercise users filter', () => {
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

    it('Exercise user not found filter', () => {
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

    it('Must display max visible windows on viewport', () => {
        this.subject.viewPortTotalArea = 960; // Just enough for 2 windows based on the default window size of 320

        expect(this.subject.windows.length).toBe(0);

        this.subject.windows = [
            new Window(),
            new Window(),
            new Window()
        ];
        
        this.subject.NormalizeWindows();

        expect(this.subject.windows.length).toBe(2);
    });
    
    it('Must invoke adapter on fetchFriendsList', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(Observable.of([]));

        this.subject.fetchFriendsList(false);

        expect(MockableAdapter.prototype.listFriends).toHaveBeenCalledTimes(1);
    });

    it('Must invoke restore windows state on fetchFriendsList when bootstrapping', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(Observable.of([]));
        spyOn(this.subject, 'restoreWindowsState');

        this.subject.fetchFriendsList(true);

        expect(this.subject.restoreWindowsState).toHaveBeenCalledTimes(1);
    });

    it('Must not invoke restore windows state on fetchFriendsList when not bootstrapping', () => {
        spyOn(MockableAdapter.prototype, 'listFriends').and.returnValue(Observable.of([]));
        spyOn(this.subject, 'restoreWindowsState');

        this.subject.fetchFriendsList(false);

        expect(this.subject.restoreWindowsState).not.toHaveBeenCalled();
    });

    it('Must update users property when onFriendsListChanged is invoked', () => {
        expect(this.subject.users).toBeUndefined();
        
        this.subject.onFriendsListChanged([
            new User(),
            new User()
        ]);

        expect(this.subject.users.length).toBe(2);
    });

    it('Must return existing open chat window when requesting a chat window instance', () => {
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };
        
        this.subject.windows = [
            {
                chattingTo: user
            }
        ];
        
        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
    });

    it('Must open a new window on a openChatWindow request when it is not opened yet', () =>{
        this.subject.historyEnabled = false;
        
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
    });

    it('Must focus on the new window on a openChatWindow request when argument is supplied', () =>{
        this.subject.historyEnabled = false;
        
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(this.subject, 'focusOnWindow'); 

        let result = this.subject.openChatWindow(user, true);

        expect(result).not.toBeUndefined();
        expect(this.subject.focusOnWindow).toHaveBeenCalledTimes(1);
    });

    it('Must not focus on the new window on a openChatWindow request when argument is not supplied', () =>{
        this.subject.historyEnabled = false;
        
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(this.subject, 'focusOnWindow'); 

        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(this.subject.focusOnWindow).not.toHaveBeenCalled();
    });

    it('Must load history from ChatAdapter when opening a window that is not yet opened', () =>{
        let user: User = {
            id: 999,
            displayName: 'Test user',
            status: 1,
            avatar: ''
        };

        spyOn(MockableAdapter.prototype, 'getMessageHistory').and.returnValue(Observable.of([]));

        let result = this.subject.openChatWindow(user);

        expect(result).not.toBeUndefined();
        expect(result.length).toBe(2);
        expect(result[0]).not.toBeUndefined();
        expect(result[1]).not.toBeFalsy();
        expect(result[0].chattingTo.id).toEqual(user.id);
        expect(result[0].chattingTo.displayName).toEqual(user.displayName);
        expect(MockableAdapter.prototype.getMessageHistory).toHaveBeenCalledTimes(1);
    });

    it('Mark messages as seen exercise', () =>{
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

        this.subject.markMessagesAsRead(messages);

        expect(messages.length).toBe(2);
        expect(messages[0].seenOn).not.toBeUndefined();
        expect(messages[0].seenOn.getTime()).toBeGreaterThan(new Date().getTime() - 60000);
        expect(messages[1].seenOn).not.toBeUndefined();
        expect(messages[1].seenOn.getTime()).toBeGreaterThan(new Date().getTime() - 60000);
    });

    it('Should play HTMLAudioElement when emitting a message sound on an unfocused window', () => {
        let window = new Window();

        spyOn(MockableHTMLAudioElement.prototype, 'play'); 

        this.subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).toHaveBeenCalledTimes(1);
    });

    it('Should not play HTMLAudioElement when emitting a message sound on a focused window', () => {
        let window = new Window();

        window.hasFocus = true;

        spyOn(MockableHTMLAudioElement.prototype, 'play'); 

        this.subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).not.toHaveBeenCalled();
    });

    it('Should not play HTMLAudioElement when audio notification is disabled', () => {
        let window = new Window();

        this.subject.audioEnabled = false;

        spyOn(MockableHTMLAudioElement.prototype, 'play'); 

        this.subject.emitMessageSound(window);

        expect(MockableHTMLAudioElement.prototype.play).not.toHaveBeenCalled();
    });

    it('Must invoke message notification method on new messages', () => {
        let message = new Message();
        let user = new User();

        spyOn(this.subject, 'emitMessageSound'); 
        spyOn(this.subject, 'openChatWindow').and.returnValue([null, true]);
        spyOn(this.subject, 'scrollChatWindowToBottom'); // Masking this call as we're not testing this part on this spec

        this.subject.onMessageReceived(user, message);

        expect(this.subject.emitMessageSound).toHaveBeenCalledTimes(1);
    });

    it('Should not use local storage persistency if persistWindowsState is disabled', () => {
        let windows = [new Window()];

        this.subject.persistWindowsState = false;

        spyOn(localStorage, 'setItem'); 

        this.subject.updateWindowsState(windows);

        expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('Update windows state exercise', () => {
        let persistedValue = null;

        spyOn(localStorage, 'setItem').and.callFake((key, value) =>{
            persistedValue = value;
        });
        
        let firstUser = new User();
        let secondUser = new User();

        firstUser.id = 88;
        secondUser.id = 99;

        let firstWindow = new Window();
        let secondWindow = new Window();

        firstWindow.chattingTo = firstUser;
        secondWindow.chattingTo = secondUser;
        
        let windows = [firstWindow, secondWindow];

        this.subject.updateWindowsState(windows);

        expect(localStorage.setItem).toHaveBeenCalledTimes(1);
        expect(persistedValue).toBe(JSON.stringify([88, 99]));
    });

    it('Should not restore windows state from local storage if persistWindowsState is disabled', () => {
        this.subject.persistWindowsState = false;

        spyOn(this.subject, 'openChatWindow'); 

        this.subject.restoreWindowsState();

        expect(this.subject.openChatWindow).not.toHaveBeenCalled();
    });

    it('Restore windows state exercise', () => {
        let firstUser = new User();
        let secondUser = new User();

        firstUser.id = 88;
        secondUser.id = 99;

        localStorage.setItem(this.subject.localStorageKey, JSON.stringify([firstUser.id, secondUser.id]));

        this.subject.users = [firstUser, secondUser];
        let pushedUsers = [];

        spyOn(this.subject, 'openChatWindow').and.callFake((user) => {
            pushedUsers.push(user);
        });

        this.subject.restoreWindowsState();

        expect(this.subject.openChatWindow).toHaveBeenCalledTimes(2);
        expect(pushedUsers).not.toBeNull();
        expect(pushedUsers.length).toBe(2);
        expect(pushedUsers[0]).toBe(firstUser);
        expect(pushedUsers[1]).toBe(secondUser);
    });

    it('Must invoke window state update when closing a chat window', () => {
        this.subject.windows = [new Window()];

        spyOn(this.subject, 'updateWindowsState');
        
        let result = this.subject.onCloseChatWindow(this.subject.windows[0]);

        expect(this.subject.updateWindowsState).toHaveBeenCalledTimes(1);
    });

    it('Must send a new message when the ENTER key is pressed', () => {
        let currentWindow = new Window();
        let chattingToUser = new User();
        let sentMessage: Message = null;
        let event = {
            keyCode: 13 
        };

        chattingToUser.id = 99;
        currentWindow.newMessage = "Test";
        currentWindow.chattingTo = chattingToUser;

        spyOn(MockableAdapter.prototype, 'sendMessage').and.callFake((message: Message) => {
            sentMessage = message;
        });
        spyOn(this.subject, 'scrollChatWindowToBottom');

        this.subject.onChatInputTyped(event, currentWindow);

        expect(currentWindow.newMessage).toBe(""); // Should clean the message input after dispatching the message
        expect(MockableAdapter.prototype.sendMessage).toHaveBeenCalledTimes(1);
        expect(this.subject.scrollChatWindowToBottom).toHaveBeenCalledTimes(1);
        expect(sentMessage).not.toBeNull();
        expect(sentMessage.message).toBe("Test");
    });

    it('Must not send a new message when the ENTER key is pressed but the message input is empty', () => {
        let currentWindow = new Window();
        let chattingToUser = new User();
        let sentMessage: Message = null;
        let event = {
            keyCode: 13 
        };

        chattingToUser.id = 99;
        currentWindow.newMessage = "";
        currentWindow.chattingTo = chattingToUser;

        spyOn(MockableAdapter.prototype, 'sendMessage').and.callFake((message: Message) => {
            sentMessage = message;
        });
        spyOn(this.subject, 'scrollChatWindowToBottom');

        this.subject.onChatInputTyped(event, currentWindow);

        expect(MockableAdapter.prototype.sendMessage).not.toHaveBeenCalled();
        expect(this.subject.scrollChatWindowToBottom).not.toHaveBeenCalled();
        expect(sentMessage).toBeNull(); 
    });

    it('Must close the current window when the ESC key is pressed', () => {
        let currentWindow = new Window();
        let closedWindow: Window = null;
        let event = {
            keyCode: 27 
        };

        spyOn(this.subject, 'onCloseChatWindow').and.callFake((window: Window) => {
            closedWindow = window;
        });

        this.subject.onChatInputTyped(event, currentWindow);

        expect(this.subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(closedWindow).not.toBeNull();
        expect(closedWindow).toBe(currentWindow);
    });

    it('Must focus on closest window when the ESC key is pressed', () => {
        let currentWindow = new Window();
        let closestWindow = new Window();
        let closedWindow: Window = null;
        let event = {
            keyCode: 27 
        };

        spyOn(this.subject, 'onCloseChatWindow');

        spyOn(this.subject, 'getClosestWindow').and.returnValue(closestWindow);

        spyOn(this.subject, 'focusOnWindow').and.callFake((window: Window, callback: Function) => {
            callback(); // This should invoke onCloseChatWindow
        });;

        this.subject.onChatInputTyped(event, currentWindow);

        expect(this.subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(this.subject.getClosestWindow).toHaveBeenCalledTimes(1);
        expect(this.subject.focusOnWindow).toHaveBeenCalledTimes(1);
    });

    it('Must not focus on closest window when the ESC key is pressed and there is no other window opened', () => {
        let currentWindow = new Window();
        let closedWindow: Window = null;
        let event = {
            keyCode: 27 
        };

        spyOn(this.subject, 'onCloseChatWindow');
        spyOn(this.subject, 'getClosestWindow').and.returnValue(undefined);
        spyOn(this.subject, 'focusOnWindow');

        this.subject.onChatInputTyped(event, currentWindow);

        expect(this.subject.onCloseChatWindow).toHaveBeenCalledTimes(1);
        expect(this.subject.getClosestWindow).toHaveBeenCalledTimes(1);
        expect(this.subject.focusOnWindow).not.toHaveBeenCalled();
    });

    it('Must move to the next chat window when the TAB key is pressed', () => {
        this.subject.windows = [
            new Window(),
            new Window(),
            new Window()
        ];

        this.subject.chatWindowInputs = {
            toArray: () => {}
        };

        let fakeChatInputs = [
            {
                nativeElement:
                {
                    focus: () => {}
                }
            },
            {
                nativeElement:
                {
                    focus: () => {}
                }
            },
            {
                nativeElement:
                {
                    focus: () => {}
                }
            }
        ];

        let event = {
            keyCode: 9,
            preventDefault: () => {}
        };

        spyOn(fakeChatInputs[0].nativeElement, 'focus');
        spyOn(fakeChatInputs[1].nativeElement, 'focus');
        spyOn(fakeChatInputs[2].nativeElement, 'focus');
        spyOn(event, 'preventDefault');
        spyOn(this.subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);

        this.subject.onChatInputTyped(event, this.subject.windows[1]);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[0].nativeElement.focus).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[1].nativeElement.focus).not.toHaveBeenCalled();
        expect(fakeChatInputs[2].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('Must move to the previous chat window when SHIFT + TAB keys are pressed', () => {
        this.subject.windows = [
            new Window(),
            new Window(),
            new Window()
        ];

        this.subject.chatWindowInputs = {
            toArray: () => {}
        };

        let fakeChatInputs = [
            {
                nativeElement:
                {
                    focus: () => {}
                }
            },
            {
                nativeElement:
                {
                    focus: () => {}
                }
            },
            {
                nativeElement:
                {
                    focus: () => {}
                }
            }
        ];

        let event = {
            keyCode: 9,
            shiftKey: true,
            preventDefault: () => {}
        };

        spyOn(fakeChatInputs[0].nativeElement, 'focus');
        spyOn(fakeChatInputs[1].nativeElement, 'focus');
        spyOn(fakeChatInputs[2].nativeElement, 'focus');
        spyOn(event, 'preventDefault');
        spyOn(this.subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);

        this.subject.onChatInputTyped(event, this.subject.windows[1]);

        expect(event.preventDefault).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[2].nativeElement.focus).toHaveBeenCalledTimes(1);
        expect(fakeChatInputs[1].nativeElement.focus).not.toHaveBeenCalled();
        expect(fakeChatInputs[0].nativeElement.focus).not.toHaveBeenCalled();
    });

    it('Must copy default text when a localization object was not supplied while initializing default text', () => {
        expect(this.subject.localization).toBeUndefined();
        
        this.subject.initializeDefaultText();

        expect(this.subject.localization).not.toBeUndefined();
        expect(this.subject.localization.title).toBe(this.subject.title);
        expect(this.subject.localization.searchPlaceholder).toBe(this.subject.searchPlaceholder);
        expect(this.subject.localization.messagePlaceholder).toBe(this.subject.messagePlaceholder);
        expect(this.subject.localization.statusDescription).toBe(this.subject.statusDescription);
    });

    it('Must not copy default text when a localization object was supplied while initializing default text', () => {
        this.subject.localization = {
            title: 'test 01',
            searchPlaceholder: 'test 02',
            messagePlaceholder: 'test 03',
            statusDescription: {
              online: 'test 04',
              busy: 'test 05',
              away: 'test 06',
              offline: 'test 07'
            }
        };
        
        this.subject.initializeDefaultText();

        expect(this.subject.localization).not.toBeUndefined();
        expect(this.subject.localization.title).not.toBe(this.subject.title);
        expect(this.subject.localization.searchPlaceholder).not.toBe(this.subject.searchPlaceholder);
        expect(this.subject.localization.messagePlaceholder).not.toBe(this.subject.messagePlaceholder);
        expect(this.subject.localization.statusDescription).not.toBe(this.subject.statusDescription);
    });
});

it('FocusOnWindow exercise', () => {
    this.subject.windows = [
        new Window(),
        new Window(),
        new Window()
    ];

    this.subject.chatWindowInputs = {
        toArray: () => {}
    };

    let fakeChatInputs = [
        {
            nativeElement:
            {
                focus: () => {}
            }
        },
        {
            nativeElement:
            {
                focus: () => {}
            }
        },
        {
            nativeElement:
            {
                focus: () => {}
            }
        }
    ];

    spyOn(fakeChatInputs[1].nativeElement, 'focus');
    spyOn(this.subject.chatWindowInputs, 'toArray').and.returnValue(fakeChatInputs);
    
    spyOn(window, 'setTimeout').and.callFake((fn) => {
        fn();
    });

    this.subject.focusOnWindow(this.subject.windows[1]);

    expect(fakeChatInputs[1].nativeElement.focus).toHaveBeenCalledTimes(1);
});

it('Must not focus on native element if a window is not found to focus when focusOnWindow is invoked', () => {
    this.subject.windows = [];

    this.subject.chatWindowInputs = {
        toArray: () => {}
    };

    this.subject.focusOnWindow(new Window());
});

it('GetClosestWindow must return next relative right chat window', () => {
    this.subject.windows = [
        new Window(),
        new Window(),
        new Window()
    ];

    let result = this.subject.getClosestWindow(this.subject.windows[2]);

    expect(result).toBe(this.subject.windows[1]);
});

it('GetClosestWindow must return previous chat window on 0 based index', () => {
    this.subject.windows = [
        new Window(),
        new Window(),
        new Window()
    ];

    let result = this.subject.getClosestWindow(this.subject.windows[0]);

    expect(result).toBe(this.subject.windows[1]);
});

it('GetClosestWindow must return undefined when there is only one chat window opened on the chat', () => {
    this.subject.windows = [
        new Window()
    ];

    let result = this.subject.getClosestWindow(this.subject.windows[0]);

    expect(result).toBe(undefined);
});

it('GetClosestWindow must return undefined when there is no open chat window on the chat', () => {
    this.subject.windows = [];

    let result = this.subject.getClosestWindow(new Window());

    expect(result).toBe(undefined);
});

it('Must bootstrap browser notifications when user permission is granted', async () => {
    this.subject.browserNotificationsBootstrapped = false;
    spyOn(Notification, 'requestPermission').and.returnValue(true);

    await this.subject.initializeBrowserNotifications();

    expect(this.subject.browserNotificationsBootstrapped).toBeTruthy();
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
});

it('Must not bootstrap browser notifications when user permission is not granted', async () => {
    this.subject.browserNotificationsBootstrapped = false;
    spyOn(Notification, 'requestPermission').and.returnValue(false);

    await this.subject.initializeBrowserNotifications();

    expect(this.subject.browserNotificationsBootstrapped).toBeFalsy();
    expect(Notification.requestPermission).toHaveBeenCalledTimes(1);
});

it('Must invoke emitBrowserNotification on new messages', () => {
    let message = new Message();
    let user = new User();

    spyOn(this.subject, 'emitBrowserNotification'); 
    spyOn(this.subject, 'openChatWindow').and.returnValue([null, true]);
    spyOn(this.subject, 'scrollChatWindowToBottom'); // Masking this call as we're not testing this part on this spec
    spyOn(this.subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

    this.subject.onMessageReceived(user, message);

    expect(this.subject.emitBrowserNotification).toHaveBeenCalledTimes(1);
});

it('Must delegate message argument when invoking emitBrowserNotification on new messages', () => {
    let message = new Message();
    let argMessage = null;
    message.message = 'Test message';

    let user = new User();
    this.subject.historyEnabled = true;

    spyOn(this.subject, 'emitBrowserNotification').and.callFake((window, message) =>{
        argMessage = message;
    });

    spyOn(this.subject, 'openChatWindow').and.returnValue([null, true]);
    spyOn(this.subject, 'emitMessageSound');  // Masking this call as we're not testing this part on this spec

    this.subject.onMessageReceived(user, message);

    expect(this.subject.emitBrowserNotification).toHaveBeenCalledTimes(1);
    expect(argMessage).toBe(message);
});

it('Must invoke onUserChatOpened event when a chat window is open via user click', () => {
    this.subject.historyEnabled = false;
    this.subject.windows = [];
    
    spyOn(this.subject, 'updateWindowsState'); 
    spyOn(this.subject, 'focusOnWindow'); 

    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserChatOpened.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let user: User = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };
    
    this.subject.openChatWindow(user, false, true);

    expect(eventInvoked).toBeTruthy();
    expect(eventArgument).toBe(user);
});

it('Must not invoke onUserChatOpened event when a window is already open for the user', () => {
    this.subject.historyEnabled = false;
    
    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserChatOpened.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let user: User = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };

    this.subject.windows = [
        {
            chattingTo: user
        }
    ];
    
    this.subject.openChatWindow(user, true, true);

    expect(eventInvoked).toBeFalsy();
    expect(eventArgument).toBe(null);
});

it('Must invoke onUserChatClosed event when a window is closed', () => {
    
    let window = new Window();

    window.chattingTo = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };

    this.subject.windows = [window];

    spyOn(this.subject, 'updateWindowsState'); // Bypassing this

    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserChatClosed.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let result = this.subject.onCloseChatWindow(this.subject.windows[0]);

    expect(eventInvoked).toBeTruthy();
    expect(eventArgument).toBe(window.chattingTo);
});

it('Must not invoke onUserClicked event when a user is clicked on the friend list and the window is already open', () => {
    this.subject.historyEnabled = false;
    
    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserClicked.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let user: User = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };

    this.subject.windows = [
        {
            chattingTo: user
        }
    ];
    
    this.subject.openChatWindow(user, true, true);

    expect(eventInvoked).toBeFalsy();
    expect(eventArgument).toBe(null);
});

it('Must not invoke onUserClicked event when a window is open but not triggered directly via user click', () => {
    this.subject.historyEnabled = false;
    
    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserClicked.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let user: User = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };
    
    this.subject.openChatWindow(user, true, false);

    expect(eventInvoked).toBeFalsy();
    expect(eventArgument).toBe(null);
});


it('Must invoke onUserClicked event when a user is clicked on the friend list', () => {
    this.subject.historyEnabled = false;
    this.subject.windows = [];

    let eventInvoked = false;
    let eventArgument = null;

    this.subject.onUserClicked.subscribe(e => {
        eventInvoked = true;
        eventArgument = e;
    });
    
    let user: User = {
        id: 999,
        displayName: 'Test user',
        status: 1,
        avatar: ''
    };
    
    this.subject.openChatWindow(user, true, true);

    expect(eventInvoked).toBeTruthy();
    expect(eventArgument).toBe(user);
});
