import { TestBed, getTestBed, inject, waitForAsync } from '@angular/core/testing';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { DefaultFileUploadAdapter } from '../ng-chat/core/default-file-upload-adapter';

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

    it('File upload test bed exercise', waitForAsync(inject([HttpClient, HttpTestingController],  
        (http: HttpClient, backend: HttpTestingController) => {
                let subject = new DefaultFileUploadAdapter(uploadUlrMock, http);
                
                let fakeFile = new File([""], "filename", { type: 'text/html' });
                const chattingToId = 88;

                subject.uploadFile(fakeFile, chattingToId).subscribe();

                const req = backend.expectOne({
                    url: uploadUlrMock,
                    method: 'POST'
                });
            })
        )
    );

    it('Must send participant id as part of the request when uploading a file', () => {
        let mockHttp = new MockableHttpClient(null);
        let fakeFile = new File([""], "filename", { type: 'text/html' });
        const chattingToId = 88;

        spyOn(MockableHttpClient.prototype, 'post').and.callFake((postUrl, sentFormData: any) => {
            expect(sentFormData.get('ng-chat-participant-id')).toBe(String(chattingToId));
            expect(postUrl).toBe(uploadUlrMock);

            return of(null);
        });

        let subject = new DefaultFileUploadAdapter(uploadUlrMock, mockHttp);
                
        subject.uploadFile(fakeFile, chattingToId).subscribe();

        expect(MockableHttpClient.prototype.post).toHaveBeenCalledTimes(1);
    });
});
