import { UserStatus } from "./user-status.enum";
import { ChatParticipantType } from "./chat-participant-type.enum";

export interface IChatParticipant {
    readonly participantType: ChatParticipantType;
    readonly id: any;
    readonly status: UserStatus;
    readonly avatar: string|null;
    readonly displayName: string;
}
