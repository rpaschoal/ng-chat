import { TestBed, getTestBed, async, inject } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import { DefaultFileUploadAdapter } from '../ng-chat/core/default-file-upload-adapter';
import { User } from '../ng-chat/core/user';

describe('DefaultFileUploadAdapter', () => {
    let uploadUlrMock: string = 'http://localhost/fileUpload';
    
    class MockableHttpClient extends HttpClient {
    }

    beforeEach(() => {
      TestBed.configureTestingModule({
        imports: [HttpClientModule, HttpClientTestingModule],
        providers: []
      });
    });

    it('File upload test bed exercise', async(inject([HttpClient, HttpTestingController],  
        (http: HttpClient, backend: HttpTestingController) => {
                let subject = new DefaultFileUploadAdapter(uploadUlrMock, http);
                
                let fakeFile = new File([""], "filename", { type: 'text/html' });
                let chattingTo = new User();
                chattingTo.id = 88;

                subject.uploadFile(fakeFile, chattingTo).subscribe();

                const req = backend.expectOne({
                    url: uploadUlrMock,
                    method: 'POST'
                });
            })
        )
    );

    it('Must send destinatary id as part of the request when uploading a file', () => {
        let mockHttp = new MockableHttpClient(null);
        let fakeFile = new File([""], "filename", { type: 'text/html' });
        let chattingTo = new User();
        chattingTo.id = 88;

        spyOn(MockableHttpClient.prototype, 'post').and.callFake((postUrl, sentFormData: any) => {
            expect(sentFormData.get('ng-chat-destinatary-userid')).toBe(String(chattingTo.id));
            expect(postUrl).toBe(uploadUlrMock);

            return Observable.of(null);
        });

        let subject = new DefaultFileUploadAdapter(uploadUlrMock, mockHttp);
                
        subject.uploadFile(fakeFile, chattingTo).subscribe();

        expect(MockableHttpClient.prototype.post).toHaveBeenCalledTimes(1);
    });
});
