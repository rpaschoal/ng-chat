import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

import { ChatAdapter } from '../../core/chat-adapter';
import { IChatGroupAdapter } from '../../core/chat-group-adapter';
import { Localization, StatusDescription } from '../../core/localization';
import { IChatOption } from '../../core/chat-option';
import { ChatParticipantStatus } from "../../core/chat-participant-status.enum";
import { IChatParticipant } from "../../core/chat-participant";
import { User } from "../../core/user";
import { Group } from "../../core/group";
import { Window } from "../../core/window";
import { ParticipantResponse } from "../../core/participant-response";

import { map } from 'rxjs/operators';

@Component({
    selector: 'ng-chat-friends-list',
    templateUrl: './ng-chat-friends-list.component.html',
    styleUrls: ['./ng-chat-friends-list.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class NgChatFriendsList implements OnInit {
    constructor() { }

    @Input()
    public adapter: ChatAdapter;

    @Input()
    public groupAdapter: IChatGroupAdapter;

    @Input()
    protected participants: IChatParticipant[];

    @Input()
    protected participantsResponse: ParticipantResponse[];

    @Input()
    protected windows: Window[];

    @Input()
    public userId: any;

    @Input()
    public localization: Localization;

    @Input()
    public shouldDisplay: boolean;

    @Input()
    public isCollapsed: boolean;

    @Input()
    public searchEnabled: boolean;

    @Input()
    public persistWindowsState: boolean;

    @Output()
    public onParticipantOpen: EventEmitter<{participant: IChatParticipant, shouldFocus: boolean, invokedByUserClick: boolean}> = new EventEmitter();

    @Output()
    public onGroupCreated: EventEmitter<Group> = new EventEmitter();

    private participantsInteractedWith: IChatParticipant[] = [];

    @Input()
    protected selectedUsersFromFriendsList: User[] = [];

    @Input()
    public currentActiveOption: IChatOption | null;

    public searchInput: string = '';

    ngOnInit() {
        //this.restoreWindowsState();
    }

    // Exposes enums for the ng-template
    public ChatParticipantStatus = ChatParticipantStatus;

    get filteredParticipants(): IChatParticipant[]
    {
        if (this.searchInput.length > 0){
            // Searches in the friend list by the inputted search string
            return this.participants.filter(x => x.displayName.toUpperCase().includes(this.searchInput.toUpperCase()));
        }

        return this.participants;
    }

    isUserSelectedFromFriendsList(user: User) : boolean
    {
        return (this.selectedUsersFromFriendsList.filter(item => item.id == user.id)).length > 0
    }

    // [Localized] Returns the status descriptive title
    // TODO: this is duplicated, find a way to reuse it
    getStatusTitle(status: ChatParticipantStatus) : any
    {
        let currentStatus = status.toString().toLowerCase();

        return this.localization.statusDescription[currentStatus];
    }

    // TODO: this is duplicated, find a way to reuse it
    private formatUnreadMessagesTotal(totalUnreadMessages: number): string
    {
        if (totalUnreadMessages > 0){

            if (totalUnreadMessages > 99) 
                return  "99+";
            else
                return String(totalUnreadMessages); 
        }

        // Empty fallback.
        return "";
    }

    // TODO: this is duplicated, find a way to reuse it
    // Returns the total unread messages from a chat window. TODO: Could use some Angular pipes in the future 
    unreadMessagesTotal(window: Window): string
    {
        let totalUnreadMessages = 0;

        if (window){
            totalUnreadMessages = window.messages.filter(x => x.fromId != this.userId && !x.dateSeen).length;
        }
            
        return this.formatUnreadMessagesTotal(totalUnreadMessages);
    }

    unreadMessagesTotalByParticipant(participant: IChatParticipant): string
    {
        let openedWindow = this.windows.find(x => x.participant.id == participant.id);

        if (openedWindow){
            return this.unreadMessagesTotal(openedWindow);
        }
        else
        {
            let totalUnreadMessages = this.participantsResponse
                .filter(x => x.participant.id == participant.id && !this.participantsInteractedWith.find(u => u.id == participant.id) && x.metadata && x.metadata.totalUnreadMessages > 0)
                .map((participantResponse) => {
                    return participantResponse.metadata.totalUnreadMessages
                })[0];

            return this.formatUnreadMessagesTotal(totalUnreadMessages);
        }
    }

    onUserClick(clickedUser: User): void
    {
        this.onParticipantOpen.emit({ participant: clickedUser, shouldFocus: true, invokedByUserClick: true });
    }

    // Toggle friends list visibility
    onChatTitleClicked(event: any): void
    {
        this.isCollapsed = !this.isCollapsed;
    }

    onFriendsListActionCancelClicked(): void
    {
        if (this.currentActiveOption)
        {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
            this.selectedUsersFromFriendsList = [];
        }
    }

    onFriendsListActionConfirmClicked() : void
    {
        let newGroup = new Group(this.selectedUsersFromFriendsList);

        this.onGroupCreated.emit(newGroup);
        //this.openChatWindow(newGroup);
        this.onParticipantOpen.emit({participant: newGroup, shouldFocus: false ,invokedByUserClick: false});

        if (this.groupAdapter)
        {
            this.groupAdapter.groupCreated(newGroup);
        }

        // Canceling current state
        this.onFriendsListActionCancelClicked();
    }

    onFriendsListCheckboxChange(selectedUser: User, isChecked: boolean): void
    {
        if(isChecked) {
            this.selectedUsersFromFriendsList.push(selectedUser);
        } 
        else 
        {
            this.selectedUsersFromFriendsList.splice(this.selectedUsersFromFriendsList.indexOf(selectedUser), 1);
        }
    }
}
