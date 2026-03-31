import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminPetitionFormComponent } from './form.component';

describe('AdminPetitionFormComponent', () => {
  let component: AdminPetitionFormComponent;
  let fixture: ComponentFixture<AdminPetitionFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminPetitionFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminPetitionFormComponent);
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
