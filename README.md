# ng-chat

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
