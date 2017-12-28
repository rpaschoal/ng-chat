import { EmojifyPipe } from '../ng-chat/pipes/emojify.pipe';

describe('EmojifyPipe', () => {
    beforeEach(() => {
        this.subject = new EmojifyPipe();
    });

    it('Must work on empty messages', () => {       
        let result = this.subject.transform('');

        expect(result).toBe('');
    });

    it('Must not replace the message text when no emoji is found', () => {
        let message = 'Test message';
        
        let result = this.subject.transform(message);

        expect(result).toBe(message);
    });

    it('Must replace message text with emoji unicode 😃', () => {
        let result = this.subject.transform(':)');

        expect(result).toBe('😃');
    });

    it('Must replace message text with emoji unicode 👍', () => {
        let result = this.subject.transform(':+1');

        expect(result).toBe('👍');
    });
});
