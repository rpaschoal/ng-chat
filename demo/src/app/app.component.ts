import { Component } from '@angular/core';
import  { ChatAdapter, DemoAdapter } from 'ng-chat';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public adapter: ChatAdapter = new DemoAdapter();
}
