import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminpetitionComponent } from './adminpetition.component';

describe('AdminpetitionComponent', () => {
  let component: AdminpetitionComponent;
  let fixture: ComponentFixture<AdminpetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminpetitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminpetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
