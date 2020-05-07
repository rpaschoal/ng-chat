import { MessageCounter } from '../../ng-chat/core/message-counter';
import { Window } from '../../ng-chat/core/window';
import { Message } from '../../ng-chat/core/message';
import { User } from '../../ng-chat/core/user';

describe('MessageCounter', () => {
    it('Should get total unread messages from window', () => {    
        const currentUserId = 1;
        const user = new User();
        const message = new Message();

        const chatWindow = new Window(user, false, false);

        chatWindow.messages.push(message);
        chatWindow.messages.push(message);

        // This should be ignored on the count as it was sent by the current user
        chatWindow.messages.push({
            ...message,
            fromId: currentUserId
        });
        
        const result = MessageCounter.unreadMessagesTotal(chatWindow, currentUserId);

        expect(result).toBe('2');
    });

    it('Should return empty if supplied window is null when getting unread messages total', () => {    
        const currentUserId = 1;       
        const result = MessageCounter.unreadMessagesTotal(null, currentUserId);

        expect(result).toBe('');
    });

    it('Should get formatted messages total', () => {           
        const result = MessageCounter.formatUnreadMessagesTotal(20);

        expect(result).toBe('20');
    });

    it('Should get exceeding formatted messages total', () => {           
        const result = MessageCounter.formatUnreadMessagesTotal(100);

        expect(result).toBe('99+');
    });

    it('Should get empty when there are no unread messages', () => {           
        const result = MessageCounter.formatUnreadMessagesTotal(0);

        expect(result).toBe('');
    });
});
