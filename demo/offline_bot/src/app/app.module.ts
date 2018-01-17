import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { NgChatModule } from 'ng-chat';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgChatModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { } 
