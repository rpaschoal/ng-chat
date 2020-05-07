import { Component, Input, Output, EventEmitter } from '@angular/core';
import { IChatOption } from '../../core/chat-option';

@Component({
    selector: 'ng-chat-options',
    templateUrl: './ng-chat-options.component.html',
    styleUrls: ['./ng-chat-options.component.css']
})
export class NgChatOptionsComponent {

	constructor() { }

	@Input()
	public options: IChatOption[];

	@Input()
	public activeOptionTracker: IChatOption;

	@Output()
	public activeOptionTrackerChange: EventEmitter<IChatOption> = new EventEmitter<IChatOption>();

	onOptionClicked(option: IChatOption): void
	{
		option.isActive = true;

		if (option.action) {    
			option.action(option.chattingTo);   
		}

		this.activeOptionTrackerChange.emit(option);
	}
}
