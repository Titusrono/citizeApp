import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlogsdetailsComponent } from './blogsdetails.component';

describe('BlogsdetailsComponent', () => {
  let component: BlogsdetailsComponent;
  let fixture: ComponentFixture<BlogsdetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BlogsdetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlogsdetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
