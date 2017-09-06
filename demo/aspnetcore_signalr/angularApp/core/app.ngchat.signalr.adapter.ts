import { ChatAdapter, User, Message, UserStatus } from 'ng-chat';
import { Observable } from 'rxjs/Observable';

export class SignalRAdapter implements ChatAdapter {
    constructor() {
        //initialize connection
        this.connection = $.connection;

        //to create proxy give your hub class name as parameter. IMPORTANT: notice that I followed camel casing in giving class name
        this.proxy = $.connection.hub.createHubProxy('chatHub');

        //define a callback method for proxy
        this.proxy.on('messageReceived', (latestMsg) => this.onMessageReceived(latestMsg));

        this.connection.hub.start();
    }

    //workaround to deal with jQuery
    window: any = (<any>window);

    //private onMessageReceived(latestMsg: string) {
    //    console.log('New message received: ' + latestMsg);
    //}

    ////method for sending message
    //broadcastMessage(msg: string) {
    //    //invoke method by its name using proxy 
    //    this.proxy.invoke('sendMessage', msg);
    //}

    //signalR connection reference
    private connection: SignalR;

    //signalR proxy reference
    private proxy: SignalR.Hub.Proxy;

    // Event handlers
    friendsListChangedHandlers: Array<(users: User[]) => void> = [];
    messageReceivedHandlers: Array<(user: User, message: Message) => void> = [];

    private mockedUsers: User[] = [{
        id: 1,
        displayName: "Rafael Carvalho",
        avatar: "https://avatars1.githubusercontent.com/u/12396249?v=4&amp;s=40",
        status: UserStatus.Online
    },
    {
        id: 2,
        displayName: "Scott Hanselman",
        avatar: "https://avatars1.githubusercontent.com/u/2892?v=4&s=40",
        status: UserStatus.Offline
    }];

    listFriends(): User[] {
        return this.mockedUsers;
    }

    getMessageHistory(): Observable<Message[]> {
        return Observable.from([]); // History not necessary for the demo adapter
    }

    sendMessage(message: Message): void {
        setTimeout(() => {
            this.messageReceivedHandlers.forEach(handler => {
                let replyMessage = new Message();

                replyMessage.fromId = message.toId;
                replyMessage.toId = message.fromId;
                replyMessage.message = "You have typed '" + message.message + "'";

                let user = this.mockedUsers.find(x => x.id == replyMessage.fromId);

                handler(user, replyMessage);
            });
        }, 1000);
    }

    onFriendsListChanged(handler: (users: User[]) => void): void {
        this.friendsListChangedHandlers.push(handler);
    }

    onMessageReceived(handler: (user: User, message: Message) => void): void {
        this.messageReceivedHandlers.push(handler);
    }
}
