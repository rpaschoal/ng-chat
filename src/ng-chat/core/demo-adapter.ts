import { ChatAdapter } from './chat-adapter';
import { User } from './user';
import { Message } from './message';
import { UserStatus } from './user-status.enum';
import { Observable } from "rxjs/Rx";

export class DemoAdapter extends ChatAdapter
{
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

    listFriends(): Observable<User[]> {
        return Observable.of(this.mockedUsers);
    }

    getMessageHistory(userId: any): Observable<Message[]> {
        let mockedHistory: Array<Message>;

        mockedHistory = [
            {
                fromId: 1,
                toId: 999,
                message: "Hi there, just type any message bellow to test this module."
            }
        ];

        return Observable.of(mockedHistory);
    }
    
    sendMessage(message: Message): void {
        setTimeout(() => {
            let replyMessage = new Message();
            
            replyMessage.fromId = message.toId;
            replyMessage.toId = message.fromId;
            replyMessage.message = "You have typed '" + message.message + "'";
            
            let user = this.mockedUsers.find(x => x.id == replyMessage.fromId);

            this.onMessageReceived(user, replyMessage);
        }, 1000);
    }
}