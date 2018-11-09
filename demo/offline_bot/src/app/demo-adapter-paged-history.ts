import { ChatAdapter, User, Message, UserStatus, PagedHistoryChatAdapter } from 'ng-chat';
import { Observable, of } from 'rxjs';
import { DemoAdapter } from './demo-adapter';
import { delay } from "rxjs/operators";

export class DemoAdapterPagedHistory extends PagedHistoryChatAdapter
{   
    private historyMessages: Message[] = [];
    
    constructor() {
        super();
        for(let i: number = 0; i < 20; i++) {
            let msg = {
                fromId: 1,
                toId: 999,
                message: `${20-i}. Hi there, just type any message bellow to test this Angular module.`,
                seenOn: new Date()
            };
            
            this.historyMessages.push(msg);
        }
    }

    listFriends(): Observable<User[]> {
        return of(DemoAdapter.mockedUsers);
    }

    getMessageHistory(userId: any): Observable<Message[]> {
       let mockedHistory: Array<Message>;
       mockedHistory = [
            {
                fromId: 1,
                toId: 999,
                message: "Hi there, just type any message bellow to test this Angular module.",
                seenOn: new Date()
            }
       ];

       return of(mockedHistory);
    }
    
    public getMessageHistoryByPage(userId: any, size: number, page: number) : Observable<Message[]> {
       let startPosition: number = (page - 1) * size;
       let endPosition: number = page * size;
       let mockedHistory: Array<Message> = this.historyMessages.slice(startPosition, endPosition);
       return of(mockedHistory.reverse()).pipe(delay(5000));
    }
    
    
    sendMessage(message: Message): void {
        setTimeout(() => {
            let replyMessage = new Message();
            
            replyMessage.fromId = message.toId;
            replyMessage.toId = message.fromId;
            replyMessage.message = "You have typed '" + message.message + "'";
            
            let user = DemoAdapter.mockedUsers.find(x => x.id == replyMessage.fromId);

            this.onMessageReceived(user, replyMessage);
        }, 1000);
    }
}
