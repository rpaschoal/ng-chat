import { User } from "./user";
import { ParticipantMetadata } from "./participant-metadata";
import { IChatParticipant } from "./chat-participant";

export class ParticipantResponse
{
    public participant: IChatParticipant;
    public metadata: ParticipantMetadata;
}
