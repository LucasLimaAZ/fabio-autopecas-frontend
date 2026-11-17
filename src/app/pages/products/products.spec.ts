import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ProductService } from '../../shared/services/product-service';
import { Products } from './products';

describe('Products', () => {
  let component: Products;
  let fixture: ComponentFixture<Products>;
  const productService = jasmine.createSpyObj<ProductService>('ProductService', [
    'getProducts',
    'searchProducts',
    'archiveProduct',
  ]);

  beforeEach(async () => {
    productService.getProducts.and.returnValue(
      of({
        products: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
    );
    productService.searchProducts.and.returnValue(of([]));
    productService.archiveProduct.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Products],
      providers: [{ provide: ProductService, useValue: productService }, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Products);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load products when initialized', () => {
    expect(component).toBeTruthy();
    expect(productService.getProducts).toHaveBeenCalled();
    expect(component.products).toEqual([]);
    expect(component.currentPage).toBe(1);
    expect(component.totalProducts).toBe(0);
  });

  it('should confirm and archive a product', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    const product = {
      id: 8,
      name: 'Filtro de Óleo',
      ref: 'FLT-001',
      notes: null,
      cost_price: 25,
      sale_price: 39.9,
      amount: 10,
      minimum_amount: 2,
      category_id: 3,
      status: 'active' as const,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    };

    component.archiveProduct(product);

    expect(window.confirm).toHaveBeenCalledWith('Deseja arquivar o produto "Filtro de Óleo"?');
    expect(productService.archiveProduct).toHaveBeenCalledWith(8);
  });
});
