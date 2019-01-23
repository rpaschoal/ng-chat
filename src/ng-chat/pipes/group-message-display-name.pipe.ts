import { Pipe, PipeTransform } from '@angular/core';
import { Group } from "../core/group";
import { ChatParticipantType } from "../core/chat-participant-type.enum";
import { IChatParticipant } from "../core/chat-participant";
import { Message } from "../core/message";

/*
 * Renders the display name of a participant in a group based on who's sent the message
*/
@Pipe({name: 'groupMessageDisplayName'})
export class GroupMessageDisplayNamePipe implements PipeTransform {
    transform(participant: IChatParticipant, message: Message): string {
        if (participant && participant.participantType == ChatParticipantType.Group)
        {
            let group = participant as Group;
            let userIndex = group.chattingTo.findIndex(x => x.id == message.fromId);

            return group.chattingTo[userIndex >= 0 ? userIndex : 0].displayName;
        }
        else
            return "";
    } 
}
