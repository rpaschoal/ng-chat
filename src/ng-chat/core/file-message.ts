import { Message } from './message';

export class FileMessage extends Message
{
    public mimeType: string;
    public fileSizeInBytes: number = 0;
}
