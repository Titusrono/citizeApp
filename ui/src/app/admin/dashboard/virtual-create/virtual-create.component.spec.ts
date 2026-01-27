import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VirtualCreateComponent } from './virtual-create.component';

describe('VirtualCreateComponent', () => {
  let component: VirtualCreateComponent;
  let fixture: ComponentFixture<VirtualCreateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VirtualCreateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VirtualCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
