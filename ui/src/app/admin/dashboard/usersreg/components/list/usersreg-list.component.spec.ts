import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UsersregListComponent } from './list.component';

describe('UsersregListComponent', () => {
  let component: UsersregListComponent;
  let fixture: ComponentFixture<UsersregListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersregListComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersregListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit edit event on onEdit', () => {
    spyOn(component.edit, 'emit');
    const item = { _id: '1', firstName: 'John' };
    component.onEdit(item);
    expect(component.edit.emit).toHaveBeenCalledWith(item);
  });

  it('should emit delete event on onDelete', () => {
    spyOn(component.delete, 'emit');
    component.onDelete('1');
    expect(component.delete.emit).toHaveBeenCalledWith('1');
  });
});
