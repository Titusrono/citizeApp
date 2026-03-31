import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RealtimereportFormComponent } from './form.component';

describe('RealtimereportFormComponent', () => {
  let component: RealtimereportFormComponent;
  let fixture: ComponentFixture<RealtimereportFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimereportFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RealtimereportFormComponent);
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
