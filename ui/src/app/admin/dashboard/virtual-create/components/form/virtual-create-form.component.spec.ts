import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VirtualFormComponent } from './form.component';

describe('VirtualFormComponent', () => {
  let component: VirtualFormComponent;
  let fixture: ComponentFixture<VirtualFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualFormComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(VirtualFormComponent);
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
