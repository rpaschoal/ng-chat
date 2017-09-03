# ng-chat

Note: This plugin is under development.

A simple facebook/linkedin lookalike chat plugin for Angular applications.

https://www.npmjs.com/package/ng-chat

### Demo

TODO: Add a link to the offline bot demo.

## Getting started
### Installation

```
npm install ng-chat
```

### Setup
#### Import the NgChatModule on your AppModule (EG: app.module.ts):

```
...
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
```
#### Add the component directive in your AppComponent template:

```
<ng-chat [adapter]="adapter" [userId]="userId"></ng-chat>
```

#### And in your app.component.ts:

```
import { Component } from '@angular/core';
import  { ChatAdapter } from 'ng-chat';
import { MyAdapter } from 'my-adapter';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  userId = 999;

  public adapter: ChatAdapter = new MyAdapter();
}
```

* [adapter]: This will point to your adapter implementation ('MyAdapter' in the example above).
* [userId]: The unique id of the user that will be using the chat instance.

## Development Notes
### NPM Deployment

* Open a terminal
* Navigate to the SRC folder
* Run "npm install"
* Run "npm run build"
* Open the dist folder that was generated
* Run "npm publish"

### Development environment setup

* Open a terminal
* Navigate to the SRC folder
* Run "npm link"
* Go back to the demo folder
* Run "npm link ng-chat"
* To unlink just run "npm unlink ng-chat"

(Make sure there is no 'node_modules' folder in 'src' while developing.
