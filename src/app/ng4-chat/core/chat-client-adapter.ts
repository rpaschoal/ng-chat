import { Message } from "./message";
import { User } from "./user";

export interface ChatClientAdapter
{
    onFriendsListChanged(handler:(user: User[]) => void): void;
    
    onMessageReceived(handler:(message: Message) => void): void;
}