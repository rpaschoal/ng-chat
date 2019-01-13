import { Window } from '../core/window';

export interface IChatOption
{
    displayLabel: string
    action: (chattingTo: Window) => void;
}
