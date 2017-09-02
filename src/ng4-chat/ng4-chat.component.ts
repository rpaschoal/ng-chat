import { Component, Input, OnInit, ViewChildren, HostListener } from '@angular/core';
import { ChatAdapter } from './core/chat-adapter';
import { DemoAdapter } from './core/demo-adapter';
import { User } from "./core/user";
import { Message } from "./core/message";
import { Window } from "./core/window";
import { UserStatus } from "./core/user-status.enum";

@Component({
    selector: 'ng4-chat',
    // TODO: Investigate how to load these relative URLs via Webpack after plugin is published
    //templateUrl:'ng4-chat.component.html',
    //styleUrls:['ng4-chat.component.css']
    template: `
        <div id="ng4-chat">
            <div id="ng4-chat-people" [ngClass]="{'ng4-chat-people-collapsed':isCollapsed}">
                <a href="javascript:void(0);" class="ng4-chat-title shadowed" (click)="onChatTitleClicked($event)">
                    <span>
                        {{title}}
                    </span>
                </a>
                <input id="ng4-chat-search_friend" type="search" placeholder="Search" [(ngModel)]="searchInput"/>
                <ul id="ng4-chat-users" *ngIf="!isCollapsed">
                    <li *ngFor="let user of filteredUsers" (click)="openChatWindow(user)">
                        <img alt="" class="avatar" height="30" width="30"  src="{{user.avatar}}"/>
                        <strong>{{user.displayName}}</strong>
                        <span [ngClass]="{'ng4-chat-user-status': true, 'online': user.status == UserStatus.Online, 'busy': user.status == UserStatus.Busy, 'away': user.status == UserStatus.Away, 'offline': user.status == UserStatus.Offline}"></span>
                    </li>
                </ul>
            </div>
            <div *ngFor="let window of windows; let i = index" [ngClass]="{'ng4-chat-window': true, 'ng4-chat-window-collapsed': window.isCollapsed}" [ngStyle]="{'right': friendsListWidth + 20 + windowSizeFactor * i + 'px'}">
                <ng-container *ngIf="window.isCollapsed">
                    <div class="ng4-chat-title" (click)="onChatWindowClicked(window)">
                        <strong>
                            {{window.chattingTo.displayName}}
                        </strong>
                        <a href="javascript:void(0);" class="ng4-chat-close" (click)="onCloseChatWindow(window)">X</a>
                    </div>
                </ng-container>
                <ng-container *ngIf="!window.isCollapsed">
                    <div class="ng4-chat-title" (click)="onChatWindowClicked(window)">
                        <strong>
                            {{window.chattingTo.displayName}}
                        </strong>
                        <a href="javascript:void(0);" class="ng4-chat-close" (click)="onCloseChatWindow(window)">X</a>
                    </div>
                    <div #chatMessages class="ng4-chat-messages">
                        <div *ngFor="let message of window.messages; let i = index" [ngClass]="{'ng4-chat-message': true, 'ng4-chat-message-received': message.fromId != userId}">
                            <img *ngIf="isAvatarVisible(window, message, i)" alt="@rpaschoal" class="avatar" height="30" width="30" [src]="window.chattingTo.avatar" />
                            <span>
                                {{message.message}}
                            </span>
                        </div>
                    </div>
                    <input [(ngModel)]="window.newMessage" type="text" (keypress)="onChatInputTyped($event, window)" [placeholder]="messagePlaceholder"/>            
                </ng-container>
            </div>
        </div>
    `
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

    public isCollapsed: boolean = false;

    private searchInput: string = "";

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

    private windows: Window[] = [];

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
            this.adapter.onMessageReceived((user, msg) => this.onMessageReceived(user, msg));

            // Loading current users list
            this.users = this.adapter.listFriends();

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
            let history = this.adapter.getMessageHistory(); // TODO Should this be a promise?

            if (history == null)
                history = [];

            let newChatWindow: Window = {
                chattingTo: user,
                messages:  history
            };

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

    // Monitors pressed keys on a chat window and dispatch a message when the enter key is typed
    protected onChatInputTyped(event: any, window: Window): void
    {
        if (event.keyCode == 13)
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
    protected onCloseChatWindow(window: Window): void 
    {
        let index = this.windows.indexOf(window);

        this.windows.splice(index, 1);
    }

    // Toggle friends list visibility
    protected onChatTitleClicked(event: any): void
    {
        this.isCollapsed = !this.isCollapsed;
    }

    // Toggles a chat window visibility between maximized/minimized
    protected onChatWindowClicked(window: Window): void
    {
        window.isCollapsed = !window.isCollapsed;
    }

    // Asserts if a user avatar is visible in a chat cluster
    protected isAvatarVisible(window: Window, message: Message, index: number): boolean
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

    // Scrolls a chat window message flow to the bottom
    private scrollChatWindowToBottom(window: Window): void
    {
        let windowIndex = this.windows.indexOf(window);

        setTimeout(() => {
            this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollTop = this.chatMessageClusters.toArray()[windowIndex].nativeElement.scrollHeight;
        }); 
    }
}