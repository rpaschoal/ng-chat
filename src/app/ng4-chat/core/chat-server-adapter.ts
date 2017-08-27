import { Message } from "./message";
import { User } from "./user";

export interface ChatServerAdapter
{
    listFriends(): User[];
    
    getMessageHistory(): Message[];

    sendMessage(message: Message): void;
}