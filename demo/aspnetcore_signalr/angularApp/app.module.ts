import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { ToasterModule } from 'angular2-toaster';
import { LoadingBarModule } from 'ng2-loading-bar';

import { AboutModule } from './about/about.module';
import { AppComponent } from './app.component';
import { AppRouting } from './app.routes';
import { CoreModule } from './core/core.module';
import { HomeModule } from './home/home.module';
import { SharedModule } from './shared/shared.module';

import { NgChatModule } from 'ng-chat';

@NgModule({
    imports: [
        BrowserModule,
        AppRouting,
        HttpModule,
        ToasterModule,
        LoadingBarModule,

        SharedModule,
        AboutModule,
        HomeModule,
        CoreModule,

        NgChatModule
    ],

    declarations: [
        AppComponent,
    ],

    bootstrap: [AppComponent]
})

export class AppModule { }
