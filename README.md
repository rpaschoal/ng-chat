# ng-chat

[![npm](https://img.shields.io/npm/v/ng-chat.svg)](https://www.npmjs.com/package/ng-chat)
[![npm downloads](https://img.shields.io/npm/dm/ng-chat.svg)](https://npmjs.org/ng-chat)
[![Build Status](https://travis-ci.org/rpaschoal/ng-chat.svg?branch=development)](https://travis-ci.org/rpaschoal/ng-chat)
[![codecov](https://codecov.io/gh/rpaschoal/ng-chat/branch/master/graph/badge.svg)](https://codecov.io/gh/rpaschoal/ng-chat)

A simple facebook/linkedin lookalike chat module for Angular applications.

* [Online demo](https://ng-chat.azurewebsites.net)
* [Node.js sample application](https://github.com/rpaschoal/ng-chat-nodejs)

<a href="https://www.buymeacoffee.com/ixJwWB5bD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

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
* [isCollapsed]{boolean}: If set to true the friends list will be rendered as collapsed by default. Default is false.
* [maximizeWindowOnNewMessage]{boolean}: If set to false new chat windows will render as collapsed when receiving new messages. Default is true.
* [pollFriendsList]{boolean}: If set to true the module will do a long poll on the "adapter.listFriends" method to keep the friends list updated. Default is false.
* [pollingInterval]{number}: Configures the long poll interval in milliseconds. Default is 5000.
* [historyEnabled]{boolean}: Defines whether the component should call the "getMessageHistory" from the chat-adapter. Default is true.
* [emojisEnabled]{boolean}: Enables emoji parsing on the messages. Default is true.
* [linkfyEnabled]{boolean}: Transforms links within the messages to valid HTML links. Default is true.
* [audioEnabled]{boolean}: Enables audio notifications on received messages. Default is true.
* [audioSource]{string}: WAV source of the audio notification. Default is a RAW github WAV content from ng-chat repository.
* [persistWindowsState]{boolean}: Saves the state of current open windows on the local storage. Default is true.
* [browserNotificationsEnabled]{boolean}: Enables browser notifications on received messages. Default is true.
* [browserNotificationIconSource]{string}: Source URL of the icon displayed on the browser notification. Default is a RAW github PNG content from ng-chat repository.

__Localization__
* [messagePlaceholder]{string}: The placeholder that is displayed in the text input on each chat window. Default is "Type a message".
* [searchPlaceholder]{string}: The placeholder that is displayed in the search input on the friends list. Default is "Search".
* [localization]{Localization}: Contract defining all text that is rendered by this component. Supply your own object for full text localization/customization. Supplying this setting will override all  other localization settings.

__Events__
* (onUserClicked){User}: Event emitted every time a user is clicked on the chat window and a new chat window is opened.
* (onUserChatOpened){User}: Event emitted every time a chat window is opened, regardless if it was due to a user click on the friends list or via new message received.
* (onUserChatClosed){User}: Event emitted every time a chat window is closed.

#### Implement your ChatAdapter:

In order to instruct this module in how to send and receive messages within your software, you will have to implement your own ChatAdapter. The class that you will be implementing is the one that you must provide as an instance to the [adapter] setting of the module discussed above.

This package exposes a ChatAdapter abstract class which you can import on your new class file definition:

```
import { ChatAdapter } from 'ng-chat';
```

After importing it to your custom adapter implementation (EG: MyAdapter.ts), you must implement at least 3 methods which are abstract in the ChatAdapter base class which are:

```
public abstract listFriends(): Observable<User[]>;
    
public abstract getMessageHistory(userId: any): Observable<Message[]>;

public abstract sendMessage(message: Message): void;
```
These methods will be performed via the client integration. Apart from the client integration and actions, you must also instruct the adapter in how to receive push notifications from the server using the following methods:

```
public onMessageReceived(user: User, message: Message): void
public onFriendsListChanged(users: User[]): void
```

__Please note there is no need to override the 2 methods above. You must call them within your adapter implementation just to notify the module that a message was received or that the friends list was updated. The second one could be ignored if you decide to use the "pollFriendsList" feature.__

If in doubt, I've provided 2 adapter implementations in this repo that can be found in the following links:

* [Offline Bot Adapter](https://github.com/rpaschoal/ng-chat/blob/master/demo/offline_bot/src/app/demo-adapter.ts)
* [SignalR Adapter](https://github.com/rpaschoal/ng-chat/blob/master/demo/aspnetcore_signalr/angularApp/core/app.ngchat.signalr.adapter.ts)

# Troubleshooting

Please follow this guideline when reporting bugs and feature requests:

1. Use [GitHub Issues](https://github.com/rpaschoal/ng-chat/issues) board to report bugs and feature requests.
2. Please **always** write the steps to reproduce the error. This will make it easier to reproduce, identify and fix bugs.

Thanks for understanding!

### License

The MIT License (see the [LICENSE](https://github.com/rpaschoal/ng-chat/blob/master/LICENSE) file for the full text)
