import { Guid } from "./guid";
import { User } from "./user";
import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { IChatParticipant } from "./chat-participant";
import { ChatParticipantType } from "./chat-participant-type.enum";

export class Group implements IChatParticipant
{
    constructor(participants: User[])
    {
        this.chattingTo = participants;
    }

    public id: string = Guid.newGuid();
    public chattingTo: User[];

    public readonly participantType: ChatParticipantType = ChatParticipantType.Group;

    public status: ChatParticipantStatus;
    public avatar: string | null;
    public displayName: string;
}
