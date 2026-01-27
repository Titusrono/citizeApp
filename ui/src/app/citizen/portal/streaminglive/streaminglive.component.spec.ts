import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StreamingliveComponent } from './streaminglive.component';

describe('StreamingliveComponent', () => {
  let component: StreamingliveComponent;
  let fixture: ComponentFixture<StreamingliveComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingliveComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StreamingliveComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
