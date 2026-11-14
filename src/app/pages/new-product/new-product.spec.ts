import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CategoryService } from '../../shared/services/category-service';
import { ProductService } from '../../shared/services/product-service';
import { NewProduct } from './new-product';

describe('NewProduct', () => {
  let component: NewProduct;
  let fixture: ComponentFixture<NewProduct>;
  const productService = jasmine.createSpyObj<ProductService>('ProductService', [
    'createProduct',
    'getProductById',
    'updateProduct',
  ]);
  const categoryService = jasmine.createSpyObj<CategoryService>('CategoryService', [
    'getCategories',
  ]);

  beforeEach(async () => {
    categoryService.getCategories.and.returnValue(
      of([
        { id: 1, name: 'Filtros' },
        { id: 2, name: 'Pastilhas' },
      ]),
    );

    await TestBed.configureTestingModule({
      imports: [NewProduct],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: CategoryService, useValue: categoryService },
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({})) } },
      ],
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
        createdAt: '2026-09-20T15:16:07.000Z',
        updatedAt: '2026-09-20T15:16:07.000Z',
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
