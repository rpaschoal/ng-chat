import { Injectable } from '@angular/core';
import { ChatAdapter, User, Message, ChatParticipantStatus } from 'ng-chat';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/observable/from';
import { DataService } from './services/values-data.service';

@Injectable()
export class SignalRAdapter extends ChatAdapter {
    constructor(private _dataService: DataService) {
        super();

        // initializing the connection
        this.connection = $.connection;

        // Creates a proxy to the ChatHub
        this.proxy = $.connection.hub.createHubProxy('chatHub');

        this.bindSignalREvents();

        this.connection.hub.start(() => {
            // Connection has been stablished
            this.userId = this.proxy.connection.id;
        });
    }

    // The id generated to the user that has just connected
    public userId: any; 

    // signalR connection reference
    private connection: SignalR;

    // signalR proxy reference
    private proxy: SignalR.Hub.Proxy;

    listFriends(): Observable<User[]> {
        return this._dataService.ListFriends();
    }

    getMessageHistory(destinataryId: any): Observable<Message[]> {
        return Observable.of([]); // TODO: History not necessary for the demo adapter (Could call an API endpoint here)
    }

    sendMessage(message: Message): void {
        this.proxy.invoke("SendMessage", message);
    }

    private bindSignalREvents(): void
    {
        this.proxy.on("notifyOfMessage", (user: User, message: Message) => {
            this.onMessageReceived(user, message);    
        });
    }
}
