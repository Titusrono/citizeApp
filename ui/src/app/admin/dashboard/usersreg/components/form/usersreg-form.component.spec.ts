import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersregFormComponent } from './form.component';

describe('UsersregFormComponent', () => {
  let component: UsersregFormComponent;
  let fixture: ComponentFixture<UsersregFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersregFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersregFormComponent);
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
