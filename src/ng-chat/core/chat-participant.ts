import { ChatParticipantStatus } from "./chat-participant-status.enum";
import { ChatParticipantType } from "./chat-participant-type.enum";

export interface IChatParticipant {
    readonly participantType: ChatParticipantType;
    readonly id: any;
    readonly status: ChatParticipantStatus;
    readonly avatar: string|null;
    readonly displayName: string;
}
