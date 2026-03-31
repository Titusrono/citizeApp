import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposalFormComponent } from './form.component';

describe('ProposalFormComponent', () => {
  let component: ProposalFormComponent;
  let fixture: ComponentFixture<ProposalFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalFormComponent);
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
