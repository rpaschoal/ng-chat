import { LinkfyPipe } from '../ng-chat/pipes/linkfy.pipe';

describe('LinkfyPipe', () => {
    beforeEach(() => {
        this.subject = new LinkfyPipe();
    });

    it('Must work on empty messages', () => {       
        let result = this.subject.transform('', true);

        expect(result).toBe('');
    });

    it('Must not replace with link when piple is disabled', () => {       
        let result = this.subject.transform('www.github.com/rpaschoal/ng-chat', false);

        expect(result).toBe('www.github.com/rpaschoal/ng-chat');
    });

    it('Must not replace with HTTP link when piple is disabled', () => {       
        let result = this.subject.transform('http://github.com/rpaschoal/ng-chat', false);

        expect(result).toBe('http://github.com/rpaschoal/ng-chat');
    });

    it('Must not replace with HTTPs link when piple is disabled', () => {       
        let result = this.subject.transform('https://github.com/rpaschoal/ng-chat', false);

        expect(result).toBe('https://github.com/rpaschoal/ng-chat');
    });

    it('Must not replace with FTP link when piple is disabled', () => {       
        let result = this.subject.transform('ftp://127.0.0.1', false);

        expect(result).toBe('ftp://127.0.0.1');
    });

    it('Must not replace e-mail with mailto link when piple is disabled', () => {       
        let result = this.subject.transform('test@email.com', false);

        expect(result).toBe('test@email.com');
    });

    it('Must replace www.{0} text with link', () => {       
        let result = this.subject.transform('www.github.com/rpaschoal/ng-chat', true);

        expect(result).toBe('<a href="http://www.github.com/rpaschoal/ng-chat" target="_blank">www.github.com/rpaschoal/ng-chat</a>');
    });

    it('Must replace http://{0} text with link', () => {       
        let result = this.subject.transform('http://github.com/rpaschoal/ng-chat', true);

        expect(result).toBe('<a href="http://github.com/rpaschoal/ng-chat" target="_blank">http://github.com/rpaschoal/ng-chat</a>');
    });

    it('Must replace https://{0} text with link', () => {       
        let result = this.subject.transform('https://github.com/rpaschoal/ng-chat', true);

        expect(result).toBe('<a href="https://github.com/rpaschoal/ng-chat" target="_blank">https://github.com/rpaschoal/ng-chat</a>');
    });

    it('Must replace ftp://{0} text with link', () => {       
        let result = this.subject.transform('ftp://127.0.0.1', true);

        expect(result).toBe('<a href="ftp://127.0.0.1" target="_blank">ftp://127.0.0.1</a>');
    });

    it('Must replace e-mail with mailto link', () => {       
        let result = this.subject.transform('test@email.com', true);

        expect(result).toBe('<a href="mailto:test@email.com">test@email.com</a>');
    });
});
