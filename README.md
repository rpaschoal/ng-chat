# ng-chat

[![npm](https://img.shields.io/npm/v/ng-chat.svg)](https://www.npmjs.com/package/ng-chat)
[![npm downloads](https://img.shields.io/npm/dm/ng-chat.svg)](https://npmjs.org/ng-chat)
[![Build Status](https://travis-ci.org/rpaschoal/ng-chat.svg?branch=development)](https://travis-ci.org/rpaschoal/ng-chat)
[![codecov](https://codecov.io/gh/rpaschoal/ng-chat/branch/master/graph/badge.svg)](https://codecov.io/gh/rpaschoal/ng-chat)

A simple facebook/linkedin lookalike chat module for Angular applications.

* [Online demo](https://ng-chat.azurewebsites.net)
* [Online demo source code (ASP.NET core and Azure SignalR)](https://github.com/rpaschoal/ng-chat-netcoreapp)
* [Node.js example](https://github.com/rpaschoal/ng-chat-nodejs)

<a href="https://www.buymeacoffee.com/ixJwWB5bD" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: 41px !important;width: 174px !important;box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;-webkit-box-shadow: 0px 3px 2px 0px rgba(190, 190, 190, 0.5) !important;" ></a>

## Getting started
### Installation

```
npm install ng-chat
```

### Setup
#### Import NgChatModule on your AppModule (EG: app.module.ts):

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
    HttpClientModule,
    NgChatModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
```
#### Add the component to your AppComponent template:

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
* [adapter]{object}: This will point to your adapter implementation ('MyAdapter' in the example above).
* [userId]{any}: The unique id of the user that will be using the chat instance.

__Additional Settings__
* [title]{string}: The title to be displayed on the friends list. Default is "Friends".
* [isDisabled]{boolean}: Indicates if ng-chat should be hidden. This stops poll requests to the friends list. Default is false.
* [isCollapsed]{boolean}: If set to true the friends list will be rendered as collapsed by default. Default is false.
* [pollFriendsList]{boolean}: If set to true the module will do a long poll on the "adapter.listFriends" method to keep the friends list updated. Default is false.
* [pollingInterval]{number}: Configures the long poll interval in milliseconds. Default is 5000.
* [searchEnabled]{boolean}: Enables the search bar on the friends list. Default is true.
* [historyEnabled]{boolean}: Defines whether the component should call the "getMessageHistory" from the chat-adapter. Default is true.
* [historyPageSize]{number}: Set the page size for each request if you are using the paged history chat adapter (Beta). Default is 10.
* [emojisEnabled]{boolean}: Enables emoji parsing on the messages. Default is true.
* [linkfyEnabled]{boolean}: Transforms links within the messages to valid HTML links. Default is true.
* [audioEnabled]{boolean}: Enables audio notifications on received messages. Default is true.
* [audioSource]{string}: WAV source of the audio notification. Default is a RAW github WAV content from ng-chat repository.
* [persistWindowsState]{boolean}: Saves the state of current open windows on the local storage. Default is true.
* [browserNotificationsEnabled]{boolean}: Enables browser notifications on received messages. Default is true.
* [browserNotificationIconSource]{string}: Source URL of the icon displayed on the browser notification. Default is a RAW github PNG content from ng-chat repository.
* [maximizeWindowOnNewMessage]{boolean}: If set to false new chat windows will render as collapsed when receiving new messages. Default is true.
* [hideFriendsList]{boolean}: Hides the friends list. Chat windows can still be opened, closed and toggled by using `IChatController`. Default is false.
* [hideFriendsListOnUnsupportedViewport]{boolean}: Hides the friends list if there isn't enough space for at least one chat window on the current viewport. Default is true.
* [fileUploadAdapter]{IFileUploadAdapter}: Your custom implementation of IFileUploadAdapter for file uploads.
* [fileUploadUrl]{string}: Defines a valid CORS enabled URL that can process a request form file and return a `FileMessage` for the destinatary user.
* [theme]{ng-chat/core/theme.enum:Theme}: Defines the styling theme. There is a light (default) and a dark theme available. You can also supply this as a string.
* [customTheme]{string}: Source URL of the stylesheet asset to use for custom CSS styles. Works with assets relative to the project using ng-chat.
* [showMessageDate]{boolean}: Shows the date in which a message was sent. Default is true.
* [messageDatePipeFormat]{string}: The format for the pipe that is used when rendering the date in which a message was sent. Default is "short".
* [groupAdapter]{IChatGroupAdapter}: A group adapter implementation to enable group chat.
* [isViewportOnMobileEnabled]{boolean}: Allow ng-chat to render and be displayed on mobile devices. Default is false.

__Localization__
* [messagePlaceholder]{string}: The placeholder that is displayed in the text input on each chat window. Default is "Type a message".
* [searchPlaceholder]{string}: The placeholder that is displayed in the search input on the friends list. Default is "Search".
* [localization]{Localization}: Contract defining all text that is rendered by this component. Supply your own object for full text localization/customization. Supplying this setting will override all  other localization settings.

__Events__
* (onParticipantClicked){IChatParticipant}: Event emitted every time a user/group is clicked on the chat window and a new chat window is opened.
* (onParticipantChatOpened){IChatParticipant}: Event emitted every time a chat window is opened, regardless if it was due to a user/group click on the friends list or via new message received.
* (onParticipantChatClosed){IChatParticipant}: Event emitted every time a chat window is closed.
* (onMessagesSeen){Message[]}: Event emitted every time a chunk of unread messages are seen by a user.

#### Implement your ChatAdapter:

In order to instruct this module on how to send and receive messages within your software, you will have to implement your own ChatAdapter. The class that you will be implementing is the one that you must provide as an instance to the [adapter] setting of the module discussed above.

This package exposes a ChatAdapter abstract class which you can import on your new class file definition:

```
import { ChatAdapter } from 'ng-chat';
```

After importing it to your custom adapter implementation (EG: MyAdapter.ts), you must implement at least 3 methods which are abstract in the ChatAdapter base class which are:

```
public abstract listFriends(): Observable<ParticipantResponse[]>;
    
public abstract getMessageHistory(destinataryId: any): Observable<Message[]>;

public abstract sendMessage(message: Message): void;
```
These methods will be performed via the client integration. Apart from the client integration and actions, you must also instruct the adapter on how to receive push notifications from the server using the following methods:

```
public onMessageReceived(participant: IChatParticipant, message: Message): void
public onFriendsListChanged(participantsResponse: ParticipantResponse[]): void
```

__Please note there is no need to override the 2 methods above. You must call them within your adapter implementation just to notify the module that a message was received or that the friends list was updated. The second one could be ignored if you decide to use the "pollFriendsList" feature.__

If in doubt, here are 2 adapter example implementations:

* [Offline Bot Adapter](https://github.com/rpaschoal/ng-chat-netcoreapp/blob/master/NgChatClient/ClientApp/src/app/demo-adapter.ts)
* [SignalR Adapter](https://github.com/rpaschoal/ng-chat-netcoreapp/blob/master/NgChatClient/ClientApp/src/app/signalr-adapter.ts)

#### Add support for group chat:

An `IChatParticipant` can be a User or a Group but in order to enable group chat you must implement and supply to ng-chat an instance of `IChatGroupAdapter`. You will have to implement the following contract:

```
groupCreated(group: Group): void;
```

ng-chat generates a guid every time a new group is created and invokes the method above so you can handle it on your application to persist the newly generated Group (Id, Participants, etc).

Once you have an implementation of `IChatGroupAdapter`, just supply it to your ng-chat instance:

```
<ng-chat [groupAdapter]="myGroupAdapterInstance" ... ></ng-chat>
```

#### File Upload:

ng-chat supports attachment of any type of files. To do so you need to implement an API endpoint on your application that can receive a POST with a form file.

On your ng-chat instance make sure you provide a valid URI for the `fileUploadUrl` parameter. This will enable the default file upload adapter and each chat window will render at the bottom right an attachment action which will trigger an input of type=file.

Along with a request form file ng-chat will also send a field named as `ng-chat-destinatary-userid` containing the id of the user in which the file will be sent to. Make sure you use this value to compose a response message as your API endpoint will have to return a `FileMessage`. This `FileMessage` instance will be sent to the destinatary user automatically by ng-chat as soon as the file upload ends successfully.

You can check some backend file upload implementation examples here:
* [ng-chat-netcoreapp](https://github.com/rpaschoal/ng-chat-netcoreapp/blob/master/NgChatSignalR/Controllers/HomeController.cs)
* [ng-chat-nodejs](https://github.com/rpaschoal/ng-chat-nodejs/blob/master/server.js) 

#### Triggering ng-chat actions from elsewhere:

Certain ng-chat actions can be triggered from your application by using the exported [IChatController](https://github.com/rpaschoal/ng-chat/blob/master/src/ng-chat/core/chat-controller.ts) interface.

Assuming you have a ng-chat instance declared on your template file, add an Angular unique identifier to it:

```
<ng-chat #ngChatInstance ... />
```

Then on your component's code, declare a `ViewChild` property in order to bind your ng-chat instance:

```
@ViewChild('ngChatInstance')
protected ngChatInstance: IChatController;
```

You can now trigger some ng-chat actions such as opening a chat window from elsewhere using the following code:

```
this.ngChatInstance.triggerOpenChatWindow(user);
```

#### Paged History Chat Adapter:

This adapter is similar to `ChatAdapter` but provides a pagination button to load older messages from your message history. You have to implement one additional method: `getMessageHistoryByPage`. You can check a sample implementation for this under the demo project with the `DemoAdapterPagedHistory` class.

If you like this feature and believe it should be the default behavior and implementation for ng-chat, please open an issue and vote for it here so we can potentially introduce it as the default chat adapter on subsequent versions of ng-chat.

#### Showing an image as a message:

If you'd like to display an image thumbnail on a chat window message just set the message type to `Image`. The content of the message should point to a valid image URL:

```
const imageMessage: Message = {
    fromId: 1,
    toId: 999,
    type: MessageType.Image,
    message: "https://valid.url/image.jpg",
    dateSent: new Date()
};
```

# Troubleshooting

Please follow this guideline when reporting bugs and feature requests:

1. Use [GitHub Issues](https://github.com/rpaschoal/ng-chat/issues) board to report bugs and feature requests.
2. Please **always** write the steps to reproduce the error. This will make it easier to reproduce, identify and fix bugs.

Thanks for understanding!

### License

The MIT License (see the [LICENSE](https://github.com/rpaschoal/ng-chat/blob/master/LICENSE) file for the full text)
