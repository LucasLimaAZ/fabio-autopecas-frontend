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
  ]);

  beforeEach(async () => {
    productService.getProducts.and.returnValue(
      of({
        products: [],
        pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },
      }),
    );
    productService.searchProducts.and.returnValue(of([]));

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
});
