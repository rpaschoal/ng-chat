import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

import { NgChat } from './ng4-chat/ng4-chat.component';

@NgModule({
  declarations: [
    AppComponent,
    NgChat
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
