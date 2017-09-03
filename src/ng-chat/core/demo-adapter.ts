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
    messageReceivedHandlers: Array<(user:User, message: Message) => void> = [];

    private mockedUsers: User[] = [{
        id: 1,
        displayName: "Rafael Carvalho",
        avatar: "https://avatars1.githubusercontent.com/u/12396249?v=4&amp;s=40",
        status: UserStatus.Online
    },
    {
        id: 2,
        displayName: "Scott Hanselman",
        avatar: "https://avatars1.githubusercontent.com/u/2892?v=4&s=40",
        status: UserStatus.Offline
    }];

    listFriends(): User[] {
        return this.mockedUsers;
    }

    getMessageHistory(): Message[] {
        return null; // History not necessary for the demo adapter
    }
    
    sendMessage(message: Message): void {
        setTimeout(() => {
            this.messageReceivedHandlers.forEach(handler => {
                let replyMessage = new Message();

                replyMessage.fromId = message.toId;
                replyMessage.toId = message.fromId;
                replyMessage.message = "You have typed '" + message.message + "'";
                
                let user = this.mockedUsers.find(x => x.id == replyMessage.fromId);

                handler(user, replyMessage);
            });
        }, 1000);
    }
    
    onFriendsListChanged(handler: (users: User[]) => void): void {
        this.friendsListChangedHandlers.push(handler);
    }

    onMessageReceived(handler: (user: User, message: Message) => void): void {
        this.messageReceivedHandlers.push(handler);
    }
}