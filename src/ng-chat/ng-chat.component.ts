import { Component, Input, OnInit, ViewChildren, QueryList, HostListener, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { ChatAdapter } from './core/chat-adapter';
import { IChatGroupAdapter } from './core/chat-group-adapter';
import { User } from "./core/user";
import { ParticipantResponse } from "./core/participant-response";
import { Message } from "./core/message";
import { MessageType } from "./core/message-type.enum";
import { Window } from "./core/window";
import { ChatParticipantStatus } from "./core/chat-participant-status.enum";
import { ScrollDirection } from "./core/scroll-direction.enum";
import { Localization, StatusDescription } from './core/localization';
import { IChatController } from './core/chat-controller';
import { PagedHistoryChatAdapter } from './core/paged-history-chat-adapter';
import { IFileUploadAdapter } from './core/file-upload-adapter';
import { DefaultFileUploadAdapter } from './core/default-file-upload-adapter';
import { Theme } from './core/theme.enum';
import { IChatOption } from './core/chat-option';
import { Group } from "./core/group";
import { ChatParticipantType } from "./core/chat-participant-type.enum";
import { IChatParticipant } from "./core/chat-participant";

import { map } from 'rxjs/operators';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';

@Component({
    selector: 'ng-chat',
    templateUrl: 'ng-chat.component.html',
    styleUrls: [
        'assets/icons.css',
        'assets/loading-spinner.css',
        'assets/ng-chat.component.default.css',
        'assets/themes/ng-chat.theme.default.scss',
        'assets/themes/ng-chat.theme.dark.scss'
    ],
    encapsulation: ViewEncapsulation.None
})

export class NgChat implements OnInit, IChatController {
    constructor(private _httpClient: HttpClient) { }

    // Exposes enums for the ng-template
    public ChatParticipantType = ChatParticipantType;
    public ChatParticipantStatus = ChatParticipantStatus;
    public MessageType = MessageType;

    private _isDisabled: boolean = false;

    get isDisabled(): boolean {
        return this._isDisabled;
    }

    @Input()
    set isDisabled(value: boolean) {
        this._isDisabled = value;

        if (value)
        {
            // To address issue https://github.com/rpaschoal/ng-chat/issues/120
            window.clearInterval(this.pollingIntervalWindowInstance)
        }
        else
        {
            this.activateFriendListFetch();
        }
    }

    @Input()
    public adapter: ChatAdapter;

    @Input()
    public groupAdapter: IChatGroupAdapter;

    @Input()
    public userId: any;

    @Input()
    public isCollapsed: boolean = false;

    @Input()
    public maximizeWindowOnNewMessage: boolean = true;

    @Input()
    public pollFriendsList: boolean = false;

    @Input()
    public pollingInterval: number = 5000;

    @Input()
    public historyEnabled: boolean = true;

    @Input()
    public emojisEnabled: boolean = true;

    @Input()
    public linkfyEnabled: boolean = true;

    @Input()
    public audioEnabled: boolean = true;

    @Input()
    public searchEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public audioSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.wav';

    @Input()
    public persistWindowsState: boolean = true;

    @Input()
    public title: string = "Friends";

    @Input()
    public messagePlaceholder: string = "Type a message";

    @Input()
    public searchPlaceholder: string = "Search";

    @Input()
    public browserNotificationsEnabled: boolean = true;

    @Input() // TODO: This might need a better content strategy
    public browserNotificationIconSource: string = 'https://raw.githubusercontent.com/rpaschoal/ng-chat/master/src/ng-chat/assets/notification.png';

    @Input()
    public browserNotificationTitle: string = "New message from";

    @Input()
    public historyPageSize: number = 10;

    @Input()
    public localization: Localization;

    @Input()
    public hideFriendsList: boolean = false;

    @Input()
    public hideFriendsListOnUnsupportedViewport: boolean = true;

    @Input()
    public fileUploadUrl: string;

    @Input()
    public theme: Theme = Theme.Light;

    @Input()
    public customTheme: string;

    @Input()
    public messageDatePipeFormat: string = "short";

    @Input()
    public showMessageDate: boolean = true;

    @Input()
    public isViewportOnMobileEnabled: boolean = false;

    @Input()
    public fileUploadAdapter: IFileUploadAdapter;

    @Output()
    public onParticipantClicked: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatOpened: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onParticipantChatClosed: EventEmitter<IChatParticipant> = new EventEmitter<IChatParticipant>();

    @Output()
    public onMessagesSeen: EventEmitter<Message[]> = new EventEmitter<Message[]>();

    private browserNotificationsBootstrapped: boolean = false;

    public hasPagedHistory: boolean = false;

    // Don't want to add this as a setting to simplify usage. Previous placeholder and title settings available to be used, or use full Localization object.
    private statusDescription: StatusDescription = {
        online: 'Online',
        busy: 'Busy',
        away: 'Away',
        offline: 'Offline'
    };

    private audioFile: HTMLAudioElement;

    public participants: IChatParticipant[];

    public participantsResponse: ParticipantResponse[];

    public participantsInteractedWith: IChatParticipant[] = [];

    public currentActiveOption: IChatOption | null;

    private pollingIntervalWindowInstance: number;

    private get localStorageKey(): string
    {
        return `ng-chat-users-${this.userId}`; // Appending the user id so the state is unique per user in a computer.
    };

    // Defines the size of each opened window to calculate how many windows can be opened on the viewport at the same time.
    public windowSizeFactor: number = 320;

    // Total width size of the friends list section
    public friendsListWidth: number = 262;

    // Available area to render the plugin
    private viewPortTotalArea: number;

    // Set to true if there is no space to display at least one chat window and 'hideFriendsListOnUnsupportedViewport' is true
    public unsupportedViewport: boolean = false;

    windows: Window[] = [];
    isBootstrapped: boolean = false;

    @ViewChildren('chatWindow') chatWindows: QueryList<NgChatWindowComponent>;

    ngOnInit() {
        this.bootstrapChat();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any){
       this.viewPortTotalArea = event.target.innerWidth;

       this.NormalizeWindows();
    }

    // Checks if there are more opened windows than the view port can display
    private NormalizeWindows(): void
    {
        const maxSupportedOpenedWindows = Math.floor((this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) / this.windowSizeFactor);
        const difference = this.windows.length - maxSupportedOpenedWindows;

        if (difference >= 0)
        {
            this.windows.splice(this.windows.length - difference);
        }

        this.updateWindowsState(this.windows);

        // Viewport should have space for at least one chat window but should show in mobile if option is enabled.
        this.unsupportedViewport = this.isViewportOnMobileEnabled? false : this.hideFriendsListOnUnsupportedViewport && maxSupportedOpenedWindows < 1;
    }

    // Initializes the chat plugin and the messaging adapter
    private bootstrapChat(): void
    {
        let initializationException = null;

        if (this.adapter != null && this.userId != null)
        {
            try
            {
                this.viewPortTotalArea = window.innerWidth;

                this.initializeTheme();
                this.initializeDefaultText();
                this.initializeBrowserNotifications();

                // Binding event listeners
                this.adapter.messageReceivedHandler = (participant, msg) => this.onMessageReceived(participant, msg);
                this.adapter.friendsListChangedHandler = (participantsResponse) => this.onFriendsListChanged(participantsResponse);

                this.activateFriendListFetch();

                this.bufferAudioFile();

                this.hasPagedHistory = this.adapter instanceof PagedHistoryChatAdapter;

                if (this.fileUploadUrl && this.fileUploadUrl !== "")
                {
                    this.fileUploadAdapter = new DefaultFileUploadAdapter(this.fileUploadUrl, this._httpClient);
                }

                this.NormalizeWindows();

                this.isBootstrapped = true;
            }
            catch(ex)
            {
                initializationException = ex;
            }
        }

        if (!this.isBootstrapped){
            console.error("ng-chat component couldn't be bootstrapped.");

            if (this.userId == null){
                console.error("ng-chat can't be initialized without an user id. Please make sure you've provided an userId as a parameter of the ng-chat component.");
            }
            if (this.adapter == null){
                console.error("ng-chat can't be bootstrapped without a ChatAdapter. Please make sure you've provided a ChatAdapter implementation as a parameter of the ng-chat component.");
            }
            if (initializationException)
            {
                console.error(`An exception has occurred while initializing ng-chat. Details: ${initializationException.message}`);
                console.error(initializationException);
            }
        }
    }

    private activateFriendListFetch(): void {
        if (this.adapter)
        {
            // Loading current users list
            if (this.pollFriendsList){
                // Setting a long poll interval to update the friends list
                this.fetchFriendsList(true);
                this.pollingIntervalWindowInstance = window.setInterval(() => this.fetchFriendsList(false), this.pollingInterval);
            }
            else
            {
                // Since polling was disabled, a friends list update mechanism will have to be implemented in the ChatAdapter.
                this.fetchFriendsList(true);
            }
        }
    }

    // Initializes browser notifications
    private async initializeBrowserNotifications()
    {
        if (this.browserNotificationsEnabled && ("Notification" in window))
        {
            if (await Notification.requestPermission() === "granted")
            {
                this.browserNotificationsBootstrapped = true;
            }
        }
    }

    // Initializes default text
    private initializeDefaultText() : void
    {
        if (!this.localization)
        {
            this.localization = {
                messagePlaceholder: this.messagePlaceholder,
                searchPlaceholder: this.searchPlaceholder,
                title: this.title,
                statusDescription: this.statusDescription,
                browserNotificationTitle: this.browserNotificationTitle,
                loadMessageHistoryPlaceholder: "Load older messages"
            };
        }
    }

    private initializeTheme(): void
    {
        if (this.customTheme)
        {
            this.theme = Theme.Custom;
        }
        else if (this.theme != Theme.Light && this.theme != Theme.Dark)
        {
            // TODO: Use es2017 in future with Object.values(Theme).includes(this.theme) to do this check
            throw new Error(`Invalid theme configuration for ng-chat. "${this.theme}" is not a valid theme value.`);
        }
    }

    // Sends a request to load the friends list
    private fetchFriendsList(isBootstrapping: boolean): void
    {
        this.adapter.listFriends()
        .pipe(
            map((participantsResponse: ParticipantResponse[]) => {
                this.participantsResponse = participantsResponse;

                this.participants = participantsResponse.map((response: ParticipantResponse) => {
                    return response.participant;
                });
            })
        ).subscribe(() => {
            if (isBootstrapping)
            {
                this.restoreWindowsState();
            }
        });
    }

    fetchMessageHistory(window: Window) {
        // Not ideal but will keep this until we decide if we are shipping pagination with the default adapter
        if (this.adapter instanceof PagedHistoryChatAdapter)
        {
            window.isLoadingHistory = true;

            this.adapter.getMessageHistoryByPage(window.participant.id, this.historyPageSize, ++window.historyPage)
            .pipe(
                map((result: Message[]) => {
                    result.forEach((message) => this.assertMessageType(message));

                    window.messages = result.concat(window.messages);
                    window.isLoadingHistory = false;

                    const direction: ScrollDirection = (window.historyPage == 1) ? ScrollDirection.Bottom : ScrollDirection.Top;
                    window.hasMoreMessages = result.length == this.historyPageSize;

                    setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, direction, true));
                })
            ).subscribe();
        }
        else
        {
            this.adapter.getMessageHistory(window.participant.id)
            .pipe(
                map((result: Message[]) => {
                    result.forEach((message) => this.assertMessageType(message));

                    window.messages = result.concat(window.messages);
                    window.isLoadingHistory = false;

                    setTimeout(() => this.onFetchMessageHistoryLoaded(result, window, ScrollDirection.Bottom));
                })
            ).subscribe();
        }
    }

    private onFetchMessageHistoryLoaded(messages: Message[], window: Window, direction: ScrollDirection, forceMarkMessagesAsSeen: boolean = false): void
    {
        this.scrollChatWindow(window, direction)

        if (window.hasFocus || forceMarkMessagesAsSeen)
        {
            const unseenMessages = messages.filter(m => !m.dateSeen);

            this.markMessagesAsRead(unseenMessages);
        }
    }

    // Updates the friends list via the event handler
    private onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
    {
        if (participantsResponse)
        {
            this.participantsResponse = participantsResponse;

            this.participants = participantsResponse.map((response: ParticipantResponse) => {
                return response.participant;
            });

            this.participantsInteractedWith = [];
        }
    }

    // Handles received messages by the adapter
    private onMessageReceived(participant: IChatParticipant, message: Message)
    {
        if (participant && message)
        {
            const chatWindow = this.openChatWindow(participant);

            this.assertMessageType(message);

            if (!chatWindow[1] || !this.historyEnabled){
                chatWindow[0].messages.push(message);

                this.scrollChatWindow(chatWindow[0], ScrollDirection.Bottom);

                if (chatWindow[0].hasFocus)
                {
                    this.markMessagesAsRead([message]);
                }
            }

            this.emitMessageSound(chatWindow[0]);

            // Github issue #58
            // Do not push browser notifications with message content for privacy purposes if the 'maximizeWindowOnNewMessage' setting is off and this is a new chat window.
            if (this.maximizeWindowOnNewMessage || (!chatWindow[1] && !chatWindow[0].isCollapsed))
            {
                // Some messages are not pushed because they are loaded by fetching the history hence why we supply the message here
                this.emitBrowserNotification(chatWindow[0], message);
            }
        }
    }

    onParticipantClickedFromFriendsList(participant: IChatParticipant): void {
        this.openChatWindow(participant, true, true);
    }

    private cancelOptionPrompt(): void {
        if (this.currentActiveOption)
        {
            this.currentActiveOption.isActive = false;
            this.currentActiveOption = null;
        }
    }

    onOptionPromptCanceled(): void {
        this.cancelOptionPrompt();
    }

    onOptionPromptConfirmed(event: any): void {
        // For now this is fine as there is only one option available. Introduce option types and type checking if a new option is added.
        this.confirmNewGroup(event);

        // Canceling current state
        this.cancelOptionPrompt();
    }

    private confirmNewGroup(users: User[]): void {
        const newGroup = new Group(users);

        this.openChatWindow(newGroup);

        if (this.groupAdapter)
        {
            this.groupAdapter.groupCreated(newGroup);
        }
    }

    // Opens a new chat whindow. Takes care of available viewport
    // Works for opening a chat window for an user or for a group
    // Returns => [Window: Window object reference, boolean: Indicates if this window is a new chat window]
    private openChatWindow(participant: IChatParticipant, focusOnNewWindow: boolean = false, invokedByUserClick: boolean = false): [Window, boolean]
    {
        // Is this window opened?
        const openedWindow = this.windows.find(x => x.participant.id == participant.id);

        if (!openedWindow)
        {
            if (invokedByUserClick)
            {
                this.onParticipantClicked.emit(participant);
            }

            // Refer to issue #58 on Github
            const collapseWindow = invokedByUserClick ? false : !this.maximizeWindowOnNewMessage;

            const newChatWindow: Window = new Window(participant, this.historyEnabled, collapseWindow);

            // Loads the chat history via an RxJs Observable
            if (this.historyEnabled)
            {
                this.fetchMessageHistory(newChatWindow);
            }

            this.windows.unshift(newChatWindow);

            // Is there enough space left in the view port ? but should be displayed in mobile if option is enabled
            if (!this.isViewportOnMobileEnabled) {
                if (this.windows.length * this.windowSizeFactor >= this.viewPortTotalArea - (!this.hideFriendsList ? this.friendsListWidth : 0)) {
                    this.windows.pop();
                }
            }

            this.updateWindowsState(this.windows);

            if (focusOnNewWindow && !collapseWindow)
            {
                this.focusOnWindow(newChatWindow);
            }

            this.participantsInteractedWith.push(participant);
            this.onParticipantChatOpened.emit(participant);

            return [newChatWindow, true];
        }
        else
        {
            // Returns the existing chat window
            return [openedWindow, false];
        }
    }

    // Focus on the input element of the supplied window
    private focusOnWindow(window: Window, callback: Function = () => {}) : void
    {
        const windowIndex = this.windows.indexOf(window);
        if (windowIndex >= 0)
        {
            setTimeout(() => {
                if (this.chatWindows)
                {
                    const chatWindowToFocus = this.chatWindows.toArray()[windowIndex];

                    chatWindowToFocus.chatWindowInput.nativeElement.focus();
                }

                callback();
            });
        }
    }

    private assertMessageType(message: Message): void {
        // Always fallback to "Text" messages to avoid rendenring issues
        if (!message.type)
        {
            message.type = MessageType.Text;
        }
    }

    // Marks all messages provided as read with the current time.
    markMessagesAsRead(messages: Message[]): void
    {
        const currentDate = new Date();

        messages.forEach((msg)=>{
            msg.dateSeen = currentDate;
        });

        this.onMessagesSeen.emit(messages);
    }

    // Buffers audio file (For component's bootstrapping)
    private bufferAudioFile(): void {
        if (this.audioSource && this.audioSource.length > 0)
        {
            this.audioFile = new Audio();
            this.audioFile.src = this.audioSource;
            this.audioFile.load();
        }
    }

    // Emits a message notification audio if enabled after every message received
    private emitMessageSound(window: Window): void
    {
        if (this.audioEnabled && !window.hasFocus && this.audioFile) {
            this.audioFile.play();
        }
    }

    // Emits a browser notification
    private emitBrowserNotification(window: Window, message: Message): void
    {
        if (this.browserNotificationsBootstrapped && !window.hasFocus && message) {
            const notification = new Notification(`${this.localization.browserNotificationTitle} ${window.participant.displayName}`, {
                'body': message.message,
                'icon': this.browserNotificationIconSource
            });

            setTimeout(() => {
                notification.close();
            }, message.message.length <= 50 ? 5000 : 7000); // More time to read longer messages
        }
    }

    // Saves current windows state into local storage if persistence is enabled
    private updateWindowsState(windows: Window[]): void
    {
        if (this.persistWindowsState)
        {
            const participantIds = windows.map((w) => {
                return w.participant.id;
            });

            localStorage.setItem(this.localStorageKey, JSON.stringify(participantIds));
        }
    }

    private restoreWindowsState(): void
    {
        try
        {
            if (this.persistWindowsState)
            {
                const stringfiedParticipantIds = localStorage.getItem(this.localStorageKey);

                if (stringfiedParticipantIds && stringfiedParticipantIds.length > 0)
                {
                    const participantIds = <number[]>JSON.parse(stringfiedParticipantIds);

                    const participantsToRestore = this.participants.filter(u => participantIds.indexOf(u.id) >= 0);

                    participantsToRestore.forEach((participant) => {
                        this.openChatWindow(participant);
                    });
                }
            }
        }
        catch (ex)
        {
            console.error(`An error occurred while restoring ng-chat windows state. Details: ${ex}`);
        }
    }

    // Gets closest open window if any. Most recent opened has priority (Right)
    private getClosestWindow(window: Window): Window | undefined
    {
        const index = this.windows.indexOf(window);

        if (index > 0)
        {
            return this.windows[index - 1];
        }
        else if (index == 0 && this.windows.length > 1)
        {
            return this.windows[index + 1];
        }
    }

    private closeWindow(window: Window): void
    {
        const index = this.windows.indexOf(window);

        this.windows.splice(index, 1);

        this.updateWindowsState(this.windows);

        this.onParticipantChatClosed.emit(window.participant);
    }

    private getChatWindowComponentInstance(targetWindow: Window): NgChatWindowComponent | null {
        const windowIndex = this.windows.indexOf(targetWindow);

        if (this.chatWindows){
            let targetWindow = this.chatWindows.toArray()[windowIndex];

            return targetWindow;
        }

        return null;
    }

    // Scrolls a chat window message flow to the bottom
    private scrollChatWindow(window: Window, direction: ScrollDirection): void
    {
        const chatWindow = this.getChatWindowComponentInstance(window);

        if (chatWindow){
            chatWindow.scrollChatWindow(window, direction);
        }
    }

    onWindowMessagesSeen(messagesSeen: Message[]): void {
        this.markMessagesAsRead(messagesSeen);
    }

    onWindowChatClosed(payload: { closedWindow: Window, closedViaEscapeKey: boolean }): void {
        const { closedWindow, closedViaEscapeKey } = payload;

        if (closedViaEscapeKey) {
            let closestWindow = this.getClosestWindow(closedWindow);

            if (closestWindow)
            {
                this.focusOnWindow(closestWindow, () => { this.closeWindow(closedWindow); });
            }
            else
            {
                this.closeWindow(closedWindow);
            }
        }
        else {
            this.closeWindow(closedWindow);
        }
    }

    onWindowTabTriggered(payload: { triggeringWindow: Window, shiftKeyPressed: boolean }): void {
        const { triggeringWindow, shiftKeyPressed } = payload;

        const currentWindowIndex = this.windows.indexOf(triggeringWindow);
        let windowToFocus = this.windows[currentWindowIndex + (shiftKeyPressed ? 1 : -1)]; // Goes back on shift + tab

        if (!windowToFocus)
        {
            // Edge windows, go to start or end
            windowToFocus = this.windows[currentWindowIndex > 0 ? 0 : this.chatWindows.length - 1];
        }

        this.focusOnWindow(windowToFocus);
    }

    onWindowMessageSent(messageSent: Message): void {
        this.adapter.sendMessage(messageSent);
    }

    onWindowOptionTriggered(option: IChatOption): void {
        this.currentActiveOption = option;
    }

    triggerOpenChatWindow(user: User): void {
        if (user)
        {
            this.openChatWindow(user);
        }
    }

    triggerCloseChatWindow(userId: any): void {
        const openedWindow = this.windows.find(x => x.participant.id == userId);

        if (openedWindow)
        {
            this.closeWindow(openedWindow);
        }
    }

    triggerToggleChatWindowVisibility(userId: any): void {
        const openedWindow = this.windows.find(x => x.participant.id == userId);

        if (openedWindow)
        {
            const chatWindow = this.getChatWindowComponentInstance(openedWindow);

            if (chatWindow){
                chatWindow.onChatWindowClicked(openedWindow);
            }
        }
    }
}
