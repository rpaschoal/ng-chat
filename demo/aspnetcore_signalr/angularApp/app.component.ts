import { Component } from '@angular/core';
import { ChatAdapter } from 'ng-chat';

import { SignalRAdapter } from './core/app.ngchat.signalr.adapter';

@Component({
    moduleId: module.id,
    selector: 'my-app',
    templateUrl: './app.component.html'
})

export class AppComponent {
    constructor(private _signalRAdapter: SignalRAdapter)
    {

    }

    public adapter: ChatAdapter = this._signalRAdapter;
}
