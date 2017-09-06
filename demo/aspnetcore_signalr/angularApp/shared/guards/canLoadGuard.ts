import { Injectable } from '@angular/core';
import { CanLoad, Route } from '@angular/router';

@Injectable()
export class CanLoadGuard implements CanLoad {

    constructor() { }

    canLoad(route: Route): boolean {
        // return if criteial is fulfilled
        console.log('In Canload');
        return true;
    }
}
