import { ChatParticipantStatus } from './chat-participant-status.enum';
import { Localization } from './localization'
 
export function chatParticipantStatusDescriptor(status: ChatParticipantStatus, localization: Localization) {
    const currentStatus = ChatParticipantStatus[status].toString().toLowerCase();
    
    return localization.statusDescription[currentStatus];
}