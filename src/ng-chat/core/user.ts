import { UserStatus } from "./user-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";

export class User implements IChatParticipant
{
    public readonly participantType: ChatParticipantType = ChatParticipantType.User;
    public id: any;
    public displayName: string;
    public status: UserStatus;
    public avatar: string;
}
