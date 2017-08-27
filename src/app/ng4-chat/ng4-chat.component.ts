import { Component, Input, OnInit } from '@angular/core';
import { ChatAdapter } from './core/chat-adapter';
import { DemoAdapter } from './core/demo-adapter';
import { User } from "./core/user";
import { Message } from "./core/message";

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

    public isCollapsed: boolean = true;

    private users: User[];

    ngOnInit() { 
        this.bootstrapChat();
    }

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

    private onMessageReceived(message: Message)
    {
        console.log(message);
    }

    protected onChatInputTyped(event: any): void
    {
        if (event.keyCode == 13)
        {
            let message = new Message();
            
            message.message = 'test';

            this.adapter.sendMessage(message);
        }
    }

    // Toggle friends list visibility
    protected onChatTitleClicked(event: any): void
    {
        this.isCollapsed = !this.isCollapsed;
    }
}