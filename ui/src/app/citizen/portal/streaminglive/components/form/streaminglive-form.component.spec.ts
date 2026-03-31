import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StreamingLiveFormComponent } from './form.component';

describe('StreamingLiveFormComponent', () => {
  let component: StreamingLiveFormComponent;
  let fixture: ComponentFixture<StreamingLiveFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StreamingLiveFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StreamingLiveFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit submit event on onSubmit', () => {
    spyOn(component.submit, 'emit');
    component.onSubmit();
    expect(component.submit.emit).toHaveBeenCalled();
  });

  it('should emit reset event on onReset', () => {
    spyOn(component.reset, 'emit');
    component.onReset();
    expect(component.reset.emit).toHaveBeenCalled();
  });
});
