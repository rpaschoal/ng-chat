import { Component, Input, OnInit, ViewChildren } from '@angular/core';
import { ChatAdapter } from './core/chat-adapter';
import { DemoAdapter } from './core/demo-adapter';
import { User } from "./core/user";
import { Message } from "./core/message";
import { Window } from "./core/window";

@Component({
    selector: 'ng4-chat',
    templateUrl: 'ng4-chat.component.html',
    styleUrls: ['ng4-chat.component.css']
})

export class NgChat implements OnInit {
    constructor() { }

    @Input()
    public title: string = "Friends";

    @Input()
    public adapter: ChatAdapter = new DemoAdapter(); // TODO: Remove this, testing purposes only

    @Input()
    public userId: any = 123; // TODO: Remove this, testing purposes only

    public isCollapsed: boolean = false;

    private users: User[];

    private windows: Window[] = [];

    private currentChat: NgChat = this;

    @ViewChildren('chatMessages') chatMessageClusters;

    ngOnInit() { 
        this.bootstrapChat();
    }

    // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        if (this.adapter != null)
        {
            // Binding event listeners
            this.adapter.onMessageReceived((msg) => this.onMessageReceived(msg));

            // Loading current users list
            this.users = this.adapter.listFriends();
        }
    }

    // Monitors a click on the friends list and opens a new chat window
    private onUserClicked(clickedUser: User): void
    {
        if (this.windows.findIndex(x => x.chattingTo.id == clickedUser.id) < 0)
        {
            let history = this.adapter.getMessageHistory(); // TODO Should this be a promise?

            if (history == null)
                history = [];

            let newChatWindow: Window = {
                chattingTo: clickedUser,
                messages:  history
            };

            this.windows.push(newChatWindow);
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(message: Message)
    {
        let chatWindow = this.windows.find(x => x.chattingTo.id == message.fromId);

        if (chatWindow){
            chatWindow.messages.push(message);

            this.scrollChatWindowToBottom(chatWindow);
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