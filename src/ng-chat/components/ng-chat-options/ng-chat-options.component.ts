import { Component, OnInit, Input } from '@angular/core';
import { Window } from '../../core/window';
import { IChatOption } from '../../core/chat-option';

@Component({
    selector: 'ng-chat-options',
    templateUrl: './ng-chat-options.component.html',
    styleUrls: ['./ng-chat-options.component.css']
})
export class NgChatOptionsComponent implements OnInit {

  constructor() { }

  @Input()
  public options: IChatOption[];

  @Input()
  public chattingTo: Window;

  ngOnInit() {
  }

  onOptionClicked(option: IChatOption): void
  {
      if (option.action)
      {
          option.action(this.chattingTo);
      }
  }
}
