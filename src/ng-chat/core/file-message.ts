import { Message } from './message';
import { MessageType } from './message-type.enum';

export class FileMessage extends Message
{
    constructor() {
        super();
        
        this.type = MessageType.File;
    }

    public downloadUrl: string;
    public mimeType: string;
    public fileSizeInBytes: number = 0;
}
