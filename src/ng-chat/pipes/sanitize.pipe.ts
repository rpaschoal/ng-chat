import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl  } from '@angular/platform-browser';

/*
 * Sanitizes an URL resource
*/
@Pipe({name: 'sanitize'})
export class SanitizePipe implements PipeTransform {
    constructor(protected sanitizer: DomSanitizer) {}

    transform(url: string): SafeResourceUrl {
        return this.sanitizer.bypassSecurityTrustResourceUrl(url);
    }
}
