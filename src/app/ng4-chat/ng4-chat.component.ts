import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'ng4-chat',
    templateUrl: 'ng4-chat.component.html',
    styleUrls: ['ng4-chat.component.css']
})

export class NgChat implements OnInit {
    constructor() { }

    @Input()
    public Title: string = "Friends";

    ngOnInit() { }
}