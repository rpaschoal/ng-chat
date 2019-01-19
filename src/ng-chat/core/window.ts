import { Message } from "./message";
import { User } from "./user";
import { WindowChatType } from "./window-chat-type-enum";
import { UserStatus } from "./user-status.enum";
import { Group } from "./group";

export class Window
{
    constructor(chattingToUserOrGroup: User | Group, isLoadingHistory: boolean, isCollapsed: boolean)
    {
        // Hacky but will do for now
        if ((chattingToUserOrGroup as User).avatar !== undefined)
        {
            this.chatType = WindowChatType.User;
            this.chattingToUser = chattingToUserOrGroup as User;
        }
        else
        {
            this.chatType = WindowChatType.Group;
            this.chattingToGroup = chattingToUserOrGroup as Group;
        }
        
        this.messages =  [];
        this.isLoadingHistory = isLoadingHistory;
        this.hasFocus = false; // This will be triggered when the 'newMessage' input gets the current focus
        this.isCollapsed = isCollapsed;
        this.hasMoreMessages = false;
        this.historyPage = 0;
    }

    public chatType: WindowChatType;

    private chattingToUser: User;
    private chattingToGroup: Group;
    
    public messages: Message[] = [];
    public newMessage?: string = "";

    public get id(): any
    {
        // TODO: Implement group
        return this.chattingToUser.id;
    }

    public get status(): UserStatus
    {
        // TODO: Implement group
        return this.chattingToUser.status;
    }

    public get avatar(): string
    {
        // TODO: Implement group
        return this.chattingToUser.avatar;
    }

    public get displayName(): string
    {
        // TODO: Implement group
        return this.chattingToUser.displayName;
    }

    // UI Behavior properties
    public isCollapsed?: boolean = false; 
    public isLoadingHistory: boolean = false;
    public hasFocus: boolean = false;
    public hasMoreMessages: boolean = true;
    public historyPage: number = 0;
}
