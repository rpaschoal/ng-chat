import { Component, Input, OnInit } from '@angular/core';
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

    ngOnInit() { 
        this.bootstrapChat();
    }

    // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        if (this.adapter != null)
        {
            // Binding event listeners
            this.adapter.onMessageReceived(this.onMessageReceived);

            // Loading current users list
            this.users = this.adapter.listFriends();
        }
    }

    // Monitors a click on the friends list and opens a new chat window
    private onUserClicked(clickedUser: User): void
    {
        if (this.windows.findIndex(x => x.chattingTo.id == clickedUser.id) < 0)
        {
            let newChatWindow: Window = {
                chattingTo: clickedUser,
                messages: this.adapter.getMessageHistory() // TODO Should this be a promise?
            };

            this.windows.push(newChatWindow);
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(message: Message)
    {
        console.log(message);
    }

    // Monitors pressed keys on a chat window and dispatch a message when the enter key is typed
    protected onChatInputTyped(event: any): void
    {
        if (event.keyCode == 13)
        {
            let message = new Message();
            
            message.message = 'test';

            this.adapter.sendMessage(message);
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
}