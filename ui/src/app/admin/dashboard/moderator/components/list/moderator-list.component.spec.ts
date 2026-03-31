import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModeratorListComponent } from './list.component';

describe('ModeratorListComponent', () => {
  let component: ModeratorListComponent;
  let fixture: ComponentFixture<ModeratorListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModeratorListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ModeratorListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event on onEdit', () => {
    spyOn(component.edit, 'emit');
    const item = { _id: '1', username: 'John' };
    component.onEdit(item);
    expect(component.edit.emit).toHaveBeenCalledWith(item);
  });

  it('should emit delete event on onDelete', () => {
    spyOn(component.delete, 'emit');
    component.onDelete('1');
    expect(component.delete.emit).toHaveBeenCalledWith('1');
  });
});
