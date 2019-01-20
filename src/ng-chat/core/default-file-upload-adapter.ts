import { IFileUploadAdapter } from './file-upload-adapter';
import { HttpClient, HttpRequest, HttpEventType, HttpResponse, HttpHeaders } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { User } from './user';
import { Message } from './message';

export class DefaultFileUploadAdapter implements IFileUploadAdapter
{
    /**
     * @summary Basic file upload adapter implementation for HTTP request form file consumption
     * @param _serverEndpointUrl The API endpoint full qualified address that will receive a form file to process and return the metadata.
     */
    constructor(private _serverEndpointUrl: string, private _http: HttpClient) {
    }

    uploadFile(file: File, participantId: any): Observable<Message> {
        const formData: FormData = new FormData();

        //formData.append('ng-chat-sender-userid', currentUserId);
        formData.append('ng-chat-participant-id', participantId);
        formData.append('file', file, file.name);

        return this._http.post<Message>(this._serverEndpointUrl, formData);

        // TODO: Leaving this if we want to track upload progress in detail in the future. Might need a different Subject generic type wrapper
        // const fileRequest = new HttpRequest('POST', this._serverEndpointUrl, formData, {
        //     reportProgress: true
        // });

        // const uploadProgress = new Subject<number>();
        // const uploadStatus = uploadProgress.asObservable();

        //const responsePromise = new Subject<Message>();

        // this._http
        //     .request(fileRequest)
        //     .subscribe(event => {
        //         // if (event.type == HttpEventType.UploadProgress)
        //         // {
        //         //     const percentDone = Math.round(100 * event.loaded / event.total);

        //         //     uploadProgress.next(percentDone);
        //         // }
        //         // else if (event instanceof HttpResponse)
        //         // {
                    
        //         //     uploadProgress.complete();
        //         // }
        //     });
    }
}
