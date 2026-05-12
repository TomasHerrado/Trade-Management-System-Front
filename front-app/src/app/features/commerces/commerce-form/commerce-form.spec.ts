import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommerceForm } from './commerce-form';

describe('CommerceForm', () => {
  let component: CommerceForm;
  let fixture: ComponentFixture<CommerceForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommerceForm],
    }).compileComponents();

    fixture = TestBed.createComponent(CommerceForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
