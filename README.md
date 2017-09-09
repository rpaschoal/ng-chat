# ng-chat

A simple facebook/linkedin lookalike chat module for Angular applications.

https://www.npmjs.com/package/ng-chat

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
import { ChatAdapter } from 'ng-chat';
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

__Required Settings__
* [adapter]{string}: This will point to your adapter implementation ('MyAdapter' in the example above).
* [userId]{any}: The unique id of the user that will be using the chat instance.

__Additional Settings__
* [title]{string}: The title to be displayed on the friends list. Default is "Friends".
* [messagePlaceholder]{string}: The placeholder that is displayed in the text input on each chat window. Default is "Type a message".
* [isCollapsed]{boolean}: If set to true the friends list will be rendered as collapsed by default. Default is false.
* [pollFriendsList]{boolean}: If set to true the module will do a long poll on the "adapter.listFriends" method to keep the friends list updated. Default is false.
* [pollingInterval]{number}: Configures the long poll interval in milliseconds. Default is 5000.

# Troubleshooting

Please follow this guidelines when reporting bugs and feature requests:

1. Use [GitHub Issues](https://github.com/rpaschoal/ng-chat/issues) board to report bugs and feature requests.
2. Please **always** write the steps to reproduce the error. This will make it easier to reproduce, identify and fix bugs.

Thanks for understanding!

### License

The MIT License (see the [LICENSE](https://github.com/rpaschoal/ng-chat/blob/master/LICENSE) file for the full text)

## Module Development Notes
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

__Make sure there is no 'node_modules' folder in 'src' while developing and testing with the 'demo/offline_bot' project.__
