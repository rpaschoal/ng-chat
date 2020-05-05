import { Window } from '../core/window';
import { IChatParticipant } from '../core/chat-participant';

export interface IChatOption
{
    isActive: boolean;
    displayLabel: string;
    chattingTo: Window;
    action?: (chattingTo: Window) => void;
    validateContext: (participant: IChatParticipant) => boolean;
}
