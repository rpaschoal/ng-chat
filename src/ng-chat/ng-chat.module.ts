import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { NgChat } from './ng-chat.component';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [NgChat],
  exports: [NgChat]
})
export class NgChatModule {
}