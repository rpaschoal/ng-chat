import { Pipe, PipeTransform } from '@angular/core';

let emojiDictionary = [
    { patterns: [':)', ':-)', '=)'], unicode: '😃' },
    { patterns: [':D', ':-D', '=D'], unicode: '😀' },
    { patterns: [':(', ':-(', '=('], unicode: '🙁' },
    { patterns: [':|', ':-|', '=|'], unicode: '😐' },
    { patterns: [':*', ':-*', '=*'], unicode: '😙' },
    { patterns: ['T_T', 'T.T'], unicode: '😭' },
    { patterns: [':O', ':-O', '=O', ':o', ':-o', '=o'], unicode: '😮' },
    { patterns: [':P', ':-P', '=P', ':p', ':-p', '=p'], unicode: '😋' },
    { patterns: ['>.<'], unicode: '😣' },
    { patterns: ['@.@'], unicode: '😵' },
    { patterns: ['*.*'], unicode: '😍' },
    { patterns: ['<3'], unicode: '❤️' },
    { patterns: ['^.^'], unicode: '😊' },
    { patterns: [':+1'], unicode: '👍' },
    { patterns: [':-1'], unicode: '👎' }
];

/*
 * Transforms common emoji text to UTF encoded emojis
*/
@Pipe({name: 'emojify'})
export class EmojifyPipe implements PipeTransform {
    transform(message: string, pipeEnabled: boolean): string {
        if (pipeEnabled && message && message.length > 1) {  
            emojiDictionary.forEach(emoji => {
                emoji.patterns.forEach(pattern => {
                    message = message.replace(pattern, emoji.unicode);
                })
            });
        }

    return message;
  }
}
