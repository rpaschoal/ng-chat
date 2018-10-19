import { Observable } from 'rxjs/Observable';

export interface IFileUploadAdapter
{
    uploadFile(file: File): Observable<Number>;
    
    onFileReceived(processedFileMetadata: any): void;
}
