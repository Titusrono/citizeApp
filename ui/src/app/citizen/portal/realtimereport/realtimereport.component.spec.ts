import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealtimereportComponent } from './realtimereport.component';

describe('RealtimereportComponent', () => {
  let component: RealtimereportComponent;
  let fixture: ComponentFixture<RealtimereportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RealtimereportComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealtimereportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
