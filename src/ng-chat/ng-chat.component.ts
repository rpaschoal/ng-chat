import { Component, Input, OnInit, ViewChildren, HostListener, Output, EventEmitter } from '@angular/core';
import { ChatAdapter } from './core/chat-adapter';
import { User } from "./core/user";
import { Message } from "./core/message";
import { Window } from "./core/window";
import { UserStatus } from "./core/user-status.enum";
import { Localization, StatusDescription } from './core/localization';
import 'rxjs/add/operator/map';

@Component({
    selector: 'ng-chat',
    templateUrl: 'ng-chat.component.html',
    styleUrls: [
        '/assets/icons.css',
        '/assets/ng-chat.component.default.css',
        '/assets/loading-spinner.css'
    ]
})

export class NgChat implements OnInit {
    constructor() { }

    // Exposes the enum for the template
    UserStatus = UserStatus;

    @Input()
    public adapter: ChatAdapter;

    @Input()
    public userId: any;

    @Input()
    public isCollapsed: boolean = false;

    @Input()    
    public pollFriendsList: boolean = false;

    @Input()
    public pollingInterval: number = 5000;

    @Input()    
    public historyEnabled: boolean = true;

    @Input()    
    public emojisEnabled: boolean = true;

    @Input()    
    public linkfyEnabled: boolean = true;

    @Input()
    public audioEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public audioSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';

    @Input()
    public persistWindowsState: boolean = true;

    @Input()
    public title: string = "Friends";

    @Input()
    public messagePlaceholder: string = "Type a message";

    @Input()
    public searchPlaceholder: string = "Search";

    @Input()
    public browserNotificationsEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public browserNotificationIconSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';

    @Input()
    public localization: Localization;

    @Output()
    public onUserClicked: EventEmitter<User> = new EventEmitter<User>();

    @Output()
    public onUserChatOpened: EventEmitter<User> = new EventEmitter<User>();

    @Output()
    public onUserChatClosed: EventEmitter<User> = new EventEmitter<User>();

    private browserNotificationsBootstrapped: boolean = false;

    // Don't want to add this as a setting to simplify usage. Previous placeholder and title settings available to be used, or use full Localization object.
    private statusDescription: StatusDescription = {
        online: 'Online',
        busy: 'Busy',
        away: 'Away',
        offline: 'Offline'
    };

    private audioFile: HTMLAudioElement;

    public searchInput: string = '';

    private users: User[];

    private get localStorageKey(): string 
    {
        return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.   
    }; 

    get filteredUsers(): User[]
    {
        if (this.searchInput.length > 0){
            // Searches in the friend list by the inputted search string
            return this.users.filter(x => x.displayName.toUpperCase().includes(this.searchInput.toUpperCase()));
        }

        return this.users;
    }

    // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
    private windowSizeFactor: number = 320;

    // Total width size of the friends list section
    private friendsListWidth: number = 262;

    // Available area to render the plugin
    private viewPortTotalArea: number;

    windows: Window[] = [];

    isBootstrapped: boolean = false;

    @ViewChildren('chatMessages') chatMessageClusters: any;

    @ViewChildren('chatWindowInput') chatWindowInputs: any;

    ngOnInit() { 
        this.bootstrapChat();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any){
       this.viewPortTotalArea = event.target.innerWidth;

       this.NormalizeWindows();
    }

    // Checks if there are more opened windows than the view port can display
    private NormalizeWindows(): void
    {
        let maxSupportedOpenedWindows = Math.floor(this.viewPortTotalArea / this.windowSizeFactor);
        let difference = this.windows.length - maxSupportedOpenedWindows;

        if (difference >= 0){
            this.windows.splice(this.windows.length - 1 - difference);
        }
    }

    // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        if (this.adapter != null && this.userId != null)
        {
            this.viewPortTotalArea = window.innerWidth;

            this.initializeDefaultText();
            this.initializeBrowserNotifications();

            // Binding event listeners
            this.adapter.messageReceivedHandler = (user, msg) => this.onMessageReceived(user, msg);
            this.adapter.friendsListChangedHandler = (users) => this.onFriendsListChanged(users);

            // Loading current users list
            if (this.pollFriendsList){
                // Setting a long poll interval to update the friends list
                this.fetchFriendsList(true);
                setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
            }
            else
            {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchFriendsList(true);
            }
            
            this.bufferAudioFile();
            
            this.isBootstrapped = true;
        }

        if (!this.isBootstrapped){
            console.error("ng-chat component couldn't be bootstrapped.");
            
            if (this.userId == null){
                console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
            }
            if (this.adapter == null){
                console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
            }
        }
    }

    // Initializes browser notifications
    private async initializeBrowserNotifications()
    {
        if (this.browserNotificationsEnabled && ("Notification" in window))
        {
            if (await Notification.requestPermission())
            {
                this.browserNotificationsBootstrapped = true;
            }
        }
    }

    // Initializes default text
    private initializeDefaultText() : void
    {
        if (!this.localization)
        {
            this.localization = {
                messagePlaceholder: this.messagePlaceholder,
                searchPlaceholder: this.searchPlaceholder, 
                title: this.title,
                statusDescription: this.statusDescription
            };
        }
    }

    // Sends a request to load the friends list
    private fetchFriendsList(isBootstrapping: boolean): void
    {
        this.adapter.listFriends()
        .map((users: User[]) => {
            this.users = users;
        }).subscribe(() => {
            if (isBootstrapping)
            {
                this.restoreWindowsState();
            }
        });
    }

    // Updates the friends list via the event handler
    private onFriendsListChanged(users: User[]): void
    {
        if (users) 
        {
            this.users = users;
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(user: User, message: Message)
    {
        if (user && message)
        {
            let chatWindow = this.openChatWindow(user);

            if (!chatWindow[1] || !this.historyEnabled){
                chatWindow[0].messages.push(message);

                this.scrollChatWindowToBottom(chatWindow[0]);
            }

            this.emitMessageSound(chatWindow[0]);
            // Some messages are not pushed because they are loaded by fetching the history hence why we supply the message here
            this.emitBrowserNotification(chatWindow[0], message);
        }
    }

    // Opens a new chat whindow. Takes care of available viewport
    // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
    private openChatWindow(user: User, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [Window, boolean]
    {
        // Is this window opened?
        let openedWindow = this.windows.find(x => x.chattingTo.id == user.id);

        if (!openedWindow)
        {
            if (invokedByUserClick) 
            {
                this.onUserClicked.emit(user);
            }

            let newChatWindow: Window = {
                chattingTo: user,
                messages:  [],
                isLoadingHistory: this.historyEnabled,
                hasFocus: false // This will be triggered when the 'newMessage' input gets the current focus
            };

            // Loads the chat history via an RxJs Observable
            if (this.historyEnabled)
            {
                this.adapter.getMessageHistory(newChatWindow.chattingTo.id)
                .map((result: Message[]) => {
                    //newChatWindow.messages.push.apply(newChatWindow.messages, result);
                    newChatWindow.messages = result.concat(newChatWindow.messages);
                    newChatWindow.isLoadingHistory = false;

                    setTimeout(() => { this.scrollChatWindowToBottom(newChatWindow)});
                }).subscribe();
            }

            this.windows.unshift(newChatWindow);

            // Is there enough space left in the view port ?
            if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - this.friendsListWidth)
            {                
                this.windows.pop();
            }

            this.updateWindowsState(this.windows);
            
            if (focusOnNewWindow) 
            {
                this.focusOnWindow(newChatWindow);
            }
            
            this.onUserChatOpened.emit(user);

            return [newChatWindow, true];
        }
        else
        {
            // Returns the existing chat window     
            return [openedWindow, false];       
        }
    }

    // Focus on the input element of the supplied window
    private focusOnWindow(window: Window, callback: Function = () => {}) : void
    {
        let windowIndex = this.windows.indexOf(window);

        if (windowIndex >= 0)
        {
            setTimeout(() => {
                let messageInputToFocus = this.chatWindowInputs.toArray()[windowIndex];
                
                messageInputToFocus.nativeElement.focus(); 

                callback(); 
            });
        } 
    }

    // Scrolls a chat window message flow to the bottom
    private scrollChatWindowToBottom(window: Window): void
    {
        if (!window.isCollapsed){
            let windowIndex = this.windows.indexOf(window);

            setTimeout(() => {
                if (this.chatMessageClusters)
                    this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollTop = this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollHeight;
            }); 
        }
    }

    // Marks all messages provided as read with the current time.
    private markMessagesAsRead(messages: Message[]): void
    {
        let currentDate = new Date();

        messages.forEach((msg)=>{
            msg.seenOn = currentDate;
        });
    }

    // Buffers audio file (For component's bootstrapping)
    private bufferAudioFile(): void {
        if (this.audioSource && this.audioSource.length > 0)
        {
            this.audioFile = new Audio();
            this.audioFile.src = this.audioSource;
            this.audioFile.load();
        }
    }

    // Emits a message notification audio if enabled after every message received
    private emitMessageSound(window: Window): void
    {
        if (this.audioEnabled && !window.hasFocus && this.audioFile) {
            this.audioFile.play();
        }
    }

    // Emits a browser notification
    private emitBrowserNotification(window: Window, message: Message): void
    {       
        if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
            let notification = new Notification(`New message from ${window.chattingTo.displayName}`, {
                'body': window.messages[window.messages.length - 1].message,
                'icon': this.browserNotificationIconSource
            });

            setTimeout(() => {
                notification.close();
            }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
        }
    }

    // Saves current windows state into local storage if persistence is enabled
    private updateWindowsState(windows: Window[]): void
    {
        if (this.persistWindowsState)
        {
            let usersIds = windows.map((w) => {
                return w.chattingTo.id;
            });

            localStorage.setItem(this.localStorageKey, JSON.stringify(usersIds));
        }
    }

    private restoreWindowsState(): void
    {
        try
        {
            if (this.persistWindowsState)
            {
                let stringfiedUserIds = localStorage.getItem(this.localStorageKey);

                if (stringfiedUserIds && stringfiedUserIds.length > 0)
                {
                    let userIds = <number[]>JSON.parse(stringfiedUserIds);

                    let usersToRestore = this.users.filter(u => userIds.indexOf(u.id) >= 0);

                    usersToRestore.forEach((user) => {
                        this.openChatWindow(user);
                    });
                }
            }
        }
        catch (ex)
        {
            console.log(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
        }
    }

    // Gets closest open window if any. Most recent opened has priority (Right)
    private getClosestWindow(window: Window): Window | undefined
    {   
        let index = this.windows.indexOf(window);

        if (index > 0)
        {
            return this.windows[index - 1];
        }
        else if (index == 0 && this.windows.length > 1)
        {   
            return this.windows[index + 1];
        }
    }

    // Returns the total unread messages from a chat window. TODO: Could use some Angular pipes in the future 
    unreadMessagesTotal(window: Window): string
    {
        if (window){
            if (window.hasFocus){
                this.markMessagesAsRead(window.messages);
            }
            else{
                let totalUnreadMessages = window.messages.filter(x => x.fromId != this.userId && !x.seenOn).length;
                
                if (totalUnreadMessages > 0){

                    if (totalUnreadMessages > 99) 
                        return  "99+";
                    else
                        return String(totalUnreadMessages); 
                }
            }
        }
            
        // Empty fallback.
        return "";
    }

    /*  Monitors pressed keys on a chat window
        - Dispatches a message when the ENTER key is pressed
        - Tabs between windows on TAB or SHIFT + TAB
        - Closes the current focused window on ESC
    */
    onChatInputTyped(event: any, window: Window): void
    {
        switch (event.keyCode)
        {
            case 13:
                if (window.newMessage && window.newMessage.trim() != "")
                {
                    let message = new Message();
             
                    message.fromId = this.userId;
                    message.toId = window.chattingTo.id;
                    message.message = window.newMessage;
        
                    window.messages.push(message);
        
                    this.adapter.sendMessage(message);
        
                    window.newMessage = ""; // Resets the new message input
        
                    this.scrollChatWindowToBottom(window);
                }
                break;
            case 9:
                event.preventDefault();
                
                let currentWindowIndex = this.windows.indexOf(window);
                let messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex + (event.shiftKey ? 1 : -1)]; // Goes back on shift + tab

                if (!messageInputToFocus)
                {
                    // Edge windows, go to start or end
                    messageInputToFocus = this.chatWindowInputs.toArray()[currentWindowIndex > 0 ? 0 : this.chatWindowInputs.length - 1]; 
                }

                messageInputToFocus.nativeElement.focus();

                break;
            case 27:
                let closestWindow = this.getClosestWindow(window);

                if (closestWindow)
                {
                    this.focusOnWindow(closestWindow, () => { this.onCloseChatWindow(window); });
                }
                else
                {
                    this.onCloseChatWindow(window);
                }
        }
    }

    // Closes a chat window via the close 'X' button
    onCloseChatWindow(window: Window): void 
    {
        let index = this.windows.indexOf(window);

        this.windows.splice(index, 1);

        this.updateWindowsState(this.windows);

        this.onUserChatClosed.emit(window.chattingTo);
    }

    // Toggle friends list visibility
    onChatTitleClicked(event: any): void
    {
        this.isCollapsed = !this.isCollapsed;
    }

    // Toggles a chat window visibility between maximized/minimized
    onChatWindowClicked(window: Window): void
    {
        window.isCollapsed = !window.isCollapsed;
        this.scrollChatWindowToBottom(window);
    }

    // Asserts if a user avatar is visible in a chat cluster
    isAvatarVisible(window: Window, message: Message, index: number): boolean
    {
        if (message.fromId != this.userId){
            if (index == 0){
                return true; // First message, good to show the thumbnail
            }
            else{
                // Check if the previous message belongs to the same user, if it belongs there is no need to show the avatar again to form the message cluster
                if (window.messages[index - 1].fromId != message.fromId){
                    return true;
                }
            }
        }

        return false;
    }

    // Toggles a window focus on the focus/blur of a 'newMessage' input
    toggleWindowFocus(window: Window): void
    {
        window.hasFocus = !window.hasFocus;
    }

    // [Localized] Returns the status descriptive title
    getStatusTitle(status: UserStatus) : any
    {
        let currentStatus = status.toString().toLowerCase();

        return this.localization.statusDescription[currentStatus];
    }
}
