import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgChat } from './ng-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';
import { SanitizePipe } from './pipes/sanitize.pipe';
import { GroupMessageDisplayNamePipe } from './pipes/group-message-display-name.pipe';
import { NgChatOptionsComponent } from './components/ng-chat-options/ng-chat-options.component';
import { NgChatFriendsListComponent } from './components/ng-chat-friends-list/ng-chat-friends-list.component';
import { NgChatWindowComponent } from './components/ng-chat-window/ng-chat-window.component';

@NgModule({
  imports: [CommonModule, FormsModule, HttpClientModule],
  declarations: [
    NgChat, 
    EmojifyPipe, 
    LinkfyPipe, 
    SanitizePipe, 
    GroupMessageDisplayNamePipe, 
    NgChatOptionsComponent, 
    NgChatFriendsListComponent, 
    NgChatWindowComponent
  ],
  exports: [NgChat]
})
export class NgChatModule {
}
