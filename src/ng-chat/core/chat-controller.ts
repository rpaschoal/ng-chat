import { User } from './user';

export interface IChatController
{
    triggerOpenChatWindow(user: User): void;

    triggerCloseChatWindow(userId: any): void;

    triggerToggleChatWindowVisibility(userId: any): void;
}
