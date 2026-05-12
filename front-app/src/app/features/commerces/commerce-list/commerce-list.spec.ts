import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommerceList } from './commerce-list';

describe('CommerceList', () => {
  let component: CommerceList;
  let fixture: ComponentFixture<CommerceList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommerceList],
    }).compileComponents();

    fixture = TestBed.createComponent(CommerceList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
