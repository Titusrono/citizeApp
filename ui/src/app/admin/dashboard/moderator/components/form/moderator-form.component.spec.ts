import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeratorFormComponent } from './form.component';

describe('ModeratorFormComponent', () => {
  let component: ModeratorFormComponent;
  let fixture: ComponentFixture<ModeratorFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeratorFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorFormComponent);
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
