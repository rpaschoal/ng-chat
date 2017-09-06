import { Component } from '@angular/core';
import { ChatAdapter, DemoAdapter } from 'ng-chat';

import { SignalRAdapter } from './core/app.ngchat.signalr.adapter';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: './app.component.html'
})

export class AppComponent {
    userId = 999;

    public adapter: ChatAdapter = new SignalRAdapter();

}
