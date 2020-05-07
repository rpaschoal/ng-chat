import { chatParticipantStatusDescriptor } from '../../ng-chat/core/chat-participant-status-descriptor';
import { ChatParticipantStatus } from '../../ng-chat/core/chat-participant-status.enum';
import { StatusDescription, Localization } from '../../ng-chat/core/localization';

describe('chatParticipantStatusDescriptor', () => {
    const statusDescriptionTestValues: StatusDescription = {
        online: 'Online',
        busy: 'Busy',
        away: 'Away',
        offline: 'Offline'
    };

    const localizationStub = {
        statusDescription: statusDescriptionTestValues
    } as Localization;


    it('Should return localized status for Online value', () => {    
        const result = chatParticipantStatusDescriptor(ChatParticipantStatus.Online, localizationStub);

        expect(result).toBe('Online');
    });

    it('Should return localized status for Busy value', () => {    
        const result = chatParticipantStatusDescriptor(ChatParticipantStatus.Busy, localizationStub);

        expect(result).toBe('Busy');
    });

    it('Should return localized status for Away value', () => {    
        const result = chatParticipantStatusDescriptor(ChatParticipantStatus.Away, localizationStub);

        expect(result).toBe('Away');
    });

    it('Should return localized status for Offline value', () => {    
        const result = chatParticipantStatusDescriptor(ChatParticipantStatus.Offline, localizationStub);

        expect(result).toBe('Offline');
    });
});
