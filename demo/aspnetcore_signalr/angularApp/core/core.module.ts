import { DataService } from './services/values-data.service';
import { NgModule } from '@angular/core';
import { SignalRAdapter } from './app.ngchat.signalr.adapter';

@NgModule({

    imports: [

    ],

    declarations: [

    ],


    providers: [
        DataService,
        SignalRAdapter
    ]
})

export class CoreModule { }
