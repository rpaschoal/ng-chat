import { ChatAdapter } from './chat-adapter';
import { User } from './user';
import { Message } from './message';
import { UserStatus } from './user-status.enum';

export class DemoAdapter implements ChatAdapter
{
    constructor()
    {
        
    }

    // Event handlers
    friendsListChangedHandlers: Array<(users: User[]) => void> = [];
    messageReceivedHandlers: Array<(message: Message) => void> = [];

    private mockedUsers: User[] = [{
        id: 1,
        displayName: "Rafael Carvalho",
        avatar: "https://avatars1.githubusercontent.com/u/12396249?v=4&amp;s=40",
        status: UserStatus.Online
    }];

    listFriends(): User[] {
        return this.mockedUsers;
    }

    getMessageHistory(): Message[] {
        return null; // No history necessary for the demo
    }
    
    sendMessage(message: Message): void {
        setTimeout(() => {
            this.messageReceivedHandlers.forEach(handler => {
                let replyMessage = new Message();

                replyMessage.fromId = message.toId;
                replyMessage.toId = message.fromId;
                replyMessage.message = "You have typed => " + message.message;
                
                handler(replyMessage);
            });
        }, 1000);
    }
    
    onFriendsListChanged(handler: (users: User[]) => void): void {
        this.friendsListChangedHandlers.push(handler);
    }

    onMessageReceived(handler: (message: Message) => void): void {
        this.messageReceivedHandlers.push(handler);
    }
}