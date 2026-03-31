import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProposalListComponent } from './list.component';

describe('ProposalListComponent', () => {
  let component: ProposalListComponent;
  let fixture: ComponentFixture<ProposalListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProposalListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ProposalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event on onEdit', () => {
    spyOn(component.edit, 'emit');
    const item = { _id: '1', title: 'Test' };
    component.onEdit(item);
    expect(component.edit.emit).toHaveBeenCalledWith(item);
  });

  it('should emit delete event on onDelete', () => {
    spyOn(component.delete, 'emit');
    component.onDelete('1');
    expect(component.delete.emit).toHaveBeenCalledWith('1');
  });
});
