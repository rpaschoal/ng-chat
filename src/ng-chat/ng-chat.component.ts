import { Component, Input, OnInit, ViewChildren, HostListener } from '@angular/core';
import { ChatAdapter } from './core/chat-adapter';
import { User } from "./core/user";
import { Message } from "./core/message";
import { Window } from "./core/window";
import { UserStatus } from "./core/user-status.enum";
import 'rxjs/add/operator/map';

@Component({
    selector: 'ng-chat',
    templateUrl: 'ng-chat.component.html',
    styleUrls: ['/themes/ng-chat.component.default.css']
})

export class NgChat implements OnInit {
    constructor() { }

    // Exposes the enum for the template
    UserStatus = UserStatus;

    @Input()
    public title: string = "Friends";

    @Input()
    public adapter: ChatAdapter;

    @Input()
    public userId: any;

    @Input()
    public messagePlaceholder: string = "Type a message";

    @Input()
    public isCollapsed: boolean = false;

    @Input()    
    public pollFriendsList: boolean = false;

    @Input()
    public pollingInterval: number = 5000;

    public searchInput: string = "";

    private users: User[];

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

    private isBootsrapped: boolean = false;

    @ViewChildren('chatMessages') chatMessageClusters: any;

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

            // Binding event listeners
            this.adapter.messageReceivedHandler = (user, msg) => this.onMessageReceived(user, msg);
            this.adapter.friendsListChangedHandler = (users) => this.onFriendsListChanged(users);

            // Loading current users list
            if (this.pollFriendsList){
                // Setting a long poll interval to update the friends list
                this.fetchFriendsList();
                setInterval(() => this.fetchFriendsList(), this.pollingInterval);
            }
            else
            {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchFriendsList();
            }
            
            this.isBootsrapped = true;
        }

        if (!this.isBootsrapped){
            console.error("ng-chat component couldn't be bootstrapped.");
            
            if (this.userId == null){
                console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
            }
            if (this.adapter == null){
                console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
            }
        }
    }

    // Sends a request to load the friends list
    private fetchFriendsList(): void
    {
        this.adapter.listFriends()
        .map((users: User[]) => {
            this.users = users;
        }).subscribe();
    }

    // Updates the friends list via the event handler
    private onFriendsListChanged(users: User[]): void
    {
        if (users){
            this.users = users;
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(user: User, message: Message)
    {
        if (user && message)
        {
            let chatWindow = this.openChatWindow(user);

            if (chatWindow){
                chatWindow.messages.push(message);

                this.scrollChatWindowToBottom(chatWindow);
            }
        }
    }

    // Opens a new chat whindow. Takes care of available viewport
    private openChatWindow(user: User): Window
    {
        // Is this window opened?
        let openedWindow = this.windows.find(x => x.chattingTo.id == user.id);

        if (!openedWindow)
        {
            let newChatWindow: Window = {
                chattingTo: user,
                messages:  [],
                isLoadingHistory: true,
                hasFocus: false // This will be triggered when the 'newMessage' input gets the current focus
            };

            // Loads the chat history via an RxJs Observable
            this.adapter.getMessageHistory(newChatWindow.chattingTo.id)
            .map((result: Message[]) => {
                //newChatWindow.messages.push.apply(newChatWindow.messages, result);
                newChatWindow.messages = result.concat(newChatWindow.messages);
                newChatWindow.isLoadingHistory = false;

                setTimeout(() => { this.scrollChatWindowToBottom(newChatWindow)});
            }).subscribe();

            this.windows.unshift(newChatWindow);

            // Is there enough space left in the view port ?
            if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - this.friendsListWidth){                
                this.windows.pop();
            }

            return newChatWindow;
        }
        else
        {
            // Returns the existing chat window     
            return openedWindow;       
        }
    }

    // Scrolls a chat window message flow to the bottom
    private scrollChatWindowToBottom(window: Window): void
    {
        if (!window.isCollapsed){
            let windowIndex = this.windows.indexOf(window);

            setTimeout(() => {
                this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollTop = this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollHeight;
            }); 
        }
    }

    // Marks all messages provided as read with the current time.
    private markMessagesAsRead(user: User, messages: Message[]): void
    {
        let currentDate = new Date();

        messages.forEach((msg)=>{
            msg.seenOn = currentDate;
        });
    }

    // Returns the total unread messages from a chat window. TODO: Could use some Angular pipes in the future 
    unreadMessagesTotal(window: Window): string
    {
        if (window){
            if (window.hasFocus){
                this.markMessagesAsRead(window.chattingTo, window.messages);
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

    // Monitors pressed keys on a chat window and dispatch a message when the enter key is typed
    onChatInputTyped(event: any, window: Window): void
    {
        if (event.keyCode == 13 && window.newMessage && window.newMessage.trim() != "")
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
    }

    // Closes a chat window via the close 'X' button
    onCloseChatWindow(window: Window): void 
    {
        let index = this.windows.indexOf(window);

        this.windows.splice(index, 1);
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
}