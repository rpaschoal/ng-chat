import { Observable } from 'rxjs';
import { Message } from "./message";
import { User } from "./user";
import { UserResponse } from "./user-response";

export abstract class ChatAdapter
{
    // ### Abstract adapter methods ###

    public abstract listFriends(): Observable<UserResponse[]>;
    
    public abstract getMessageHistory(userId: any): Observable<Message[]>;

    public abstract sendMessage(message: Message): void;

    // ### Adapter/Chat income/ingress events ###

    public onFriendsListChanged(usersResponse: UserResponse[]): void
    {
        this.friendsListChangedHandler(usersResponse);
    }

    public onMessageReceived(user: User, message: Message): void
    {
        this.messageReceivedHandler(user, message);
    }
    
    // Event handlers
    friendsListChangedHandler: (usersResponse: UserResponse[]) => void  = (usersResponse: UserResponse[]) => {};
    messageReceivedHandler: (user: User, message: Message) => void = (user: User, message: Message) => {};
}
