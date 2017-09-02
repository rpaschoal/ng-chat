import { Component } from '@angular/core';
import { SignalRAdapter } from '../chat/app.ngchat.signalr.adapter';
import { ChatAdapter} from 'ng-chat';

@Component({
    selector: 'app',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent { 
    public adapter: ChatAdapter = new SignalRAdapter();
}
