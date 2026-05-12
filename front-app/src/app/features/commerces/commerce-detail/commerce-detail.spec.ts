import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommerceDetail } from './commerce-detail';

describe('CommerceDetail', () => {
  let component: CommerceDetail;
  let fixture: ComponentFixture<CommerceDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommerceDetail],
    }).compileComponents();

    fixture = TestBed.createComponent(CommerceDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
