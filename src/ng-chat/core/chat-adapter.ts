import { Observable } from 'rxjs/Observable';
import { Message } from "./message";
import { User } from "./user";
import 'rxjs/add/observable/empty';

export abstract class ChatAdapter
{
    // ### Abstract adapter methods ###

    public abstract listFriends(): Observable<User[]>;
    
    public abstract getMessageHistory(userId: any): Observable<Message[]>;

    public abstract sendMessage(message: Message): void;

    // ### Adapter/Chat income/ingress events ###

    public onFriendsListChanged(users: User[]): void
    {
        this.friendsListChangedHandler(users);
    }

    public onMessageReceived(user: User, message: Message): void
    {
        this.messageReceivedHandler(user, message);
    }
    
    // Event handlers
    friendsListChangedHandler: (users: User[]) => void  = (users: User[]) => {};
    messageReceivedHandler: (user: User, message: Message) => void = (user: User, message: Message) => {};

    // method should be overridden and may be declared as abstract in further releases 
    public getMessageHistoryByPage(userId: any, size: number, page: number) : Observable<Message[]> {
        return Observable.empty<Message[]>();
    }
    
    public loadMessageHistory(userId: any, size: number, page: number) : Observable<Message[]> {
        if(size > 0 && page > 0) {
            return this.getMessageHistoryByPage(userId, size, page);
        } else {
            return this.getMessageHistory(userId);
        }
    }
}