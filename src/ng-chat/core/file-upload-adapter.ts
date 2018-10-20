import { Observable } from 'rxjs/Observable';
import { User } from './user';

export interface IFileUploadAdapter
{
    uploadFile(file: File, userTo: User): Observable<Number>;
    
    onFileReceived(processedFileMetadata: any): void;
}
