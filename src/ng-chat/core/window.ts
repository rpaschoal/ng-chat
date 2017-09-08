import { Message } from "./message";
import { User } from "./user";

export class Window
{
    public chattingTo: User;
    public messages: Message[] = [];
    public newMessage?: string = "";
    public isCollapsed?: boolean = false;
    public isLoadingHistory?: boolean = false;
}