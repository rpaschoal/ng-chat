import { Component } from '@angular/core';
import { ChatAdapter } from 'ng-chat';
import { DemoAdapter } from './demo-adapter'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public adapter: ChatAdapter = new DemoAdapter();
}
