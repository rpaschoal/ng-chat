import { Component, OnInit } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'about',
    templateUrl: './about.component.html'
})

export class AboutComponent implements OnInit {

    public message: string;

    constructor() {
        this.message = 'Hello from About';
    }

    ngOnInit() {

    }

    public MyCanDeactivate(): boolean {
        return true;
    }
}
