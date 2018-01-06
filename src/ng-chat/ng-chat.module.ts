import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgChat } from './ng-chat.component';
import { EmojifyPipe } from './pipes/emojify.pipe';
import { LinkfyPipe } from './pipes/linkfy.pipe';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [NgChat, EmojifyPipe, LinkfyPipe],
  exports: [NgChat]
})
export class NgChatModule {
}
