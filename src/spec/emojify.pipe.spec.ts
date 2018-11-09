import { EmojifyPipe } from '../ng-chat/pipes/emojify.pipe';

let subject: EmojifyPipe = null;

describe('EmojifyPipe', () => {
    beforeEach(() => {
        subject = new EmojifyPipe();
    });

    it('Must work on empty messages', () => {       
        let result = subject.transform('', true);

        expect(result).toBe('');
    });

    it('Must not replace with emoji when piple is disabled', () => {       
        let result = subject.transform(':)', false);

        expect(result).toBe(':)');
    });

    it('Must not replace the message text when no emoji is found', () => {
        let message = 'Test message';
        
        let result = subject.transform(message, true);

        expect(result).toBe(message);
    });

    it('Must replace message text with emoji unicode 😃', () => {
        let result = subject.transform(':)', true);

        expect(result).toBe('😃');
    });

    it('Must replace message text with emoji unicode 👍', () => {
        let result = subject.transform(':+1', true);

        expect(result).toBe('👍');
    });
});
