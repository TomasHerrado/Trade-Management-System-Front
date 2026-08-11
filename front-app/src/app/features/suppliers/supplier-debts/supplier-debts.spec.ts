import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SupplierDebts } from './supplier-debts';

describe('SupplierDebts', () => {
  let component: SupplierDebts;
  let fixture: ComponentFixture<SupplierDebts>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SupplierDebts],
    }).compileComponents();

    fixture = TestBed.createComponent(SupplierDebts);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
