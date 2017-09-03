import { Message } from "./message";
import { User } from "./user";

export interface ChatAdapter
{
    listFriends(): User[];
    
    getMessageHistory(): Message[];

    sendMessage(message: Message): void;

    onFriendsListChanged(handler:(users: User[]) => void): void;
    
    onMessageReceived(handler:(user: User, message: Message) => void): void;
}