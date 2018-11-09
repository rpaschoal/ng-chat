import { Component } from '@angular/core';
import { ChatAdapter } from 'ng-chat';
import { DemoAdapter } from './demo-adapter';
import { DemoAdapterPagedHistory } from './demo-adapter-paged-history';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';

  public adapter: ChatAdapter = new DemoAdapter();

  //public adapter: ChatAdapter = new DemoAdapterPagedHistory();

  public messageSeen(event: any)
  {
    console.log(event);
  }
}
