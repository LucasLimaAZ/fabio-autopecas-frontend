import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ProductService } from '../../shared/services/product-service';
import { NewProduct } from './new-product';

describe('NewProduct', () => {
  let component: NewProduct;
  let fixture: ComponentFixture<NewProduct>;
  const productService = jasmine.createSpyObj<ProductService>('ProductService', ['createProduct']);

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewProduct],
      providers: [{ provide: ProductService, useValue: productService }],
    }).compileComponents();

    productService.createProduct.and.returnValue(
      of({
        id: 1,
        name: 'Produto',
        ref: 'REF-1',
        notes: null,
        cost_price: null,
        sale_price: null,
        amount: 0,
        minimum_amount: 0,
        category_id: 1,
      }),
    );

    fixture = TestBed.createComponent(NewProduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
