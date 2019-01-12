import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NgChatOptionsComponent } from './ng-chat-options.component';

describe('NgChatOptionsComponent', () => {
  let component: NgChatOptionsComponent;
  let fixture: ComponentFixture<NgChatOptionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NgChatOptionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NgChatOptionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
