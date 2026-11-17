import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, Subject } from 'rxjs';

import { Product, ProductService } from '../../shared/services/product-service';
import { SaleService } from '../../shared/services/sale-service';
import { NewSale } from './new-sale';

describe('NewSale', () => {
  let component: NewSale;
  let fixture: ComponentFixture<NewSale>;
  const productService = jasmine.createSpyObj<ProductService>('ProductService', ['searchProducts']);
  const saleService = jasmine.createSpyObj<SaleService>('SaleService', ['createSale']);
  const product: Product = {
    id: 1,
    name: 'Filtro de óleo',
    ref: 'FO-1',
    notes: null,
    cost_price: 10,
    sale_price: 20,
    amount: 5,
    minimum_amount: 1,
    category_id: 1,
    createdAt: '',
    updatedAt: '',
  };

  beforeEach(async () => {
    productService.searchProducts.calls.reset();
    productService.searchProducts.and.returnValue(of([product]));

    await TestBed.configureTestingModule({
      imports: [NewSale],
      providers: [
        { provide: ProductService, useValue: productService },
        { provide: SaleService, useValue: saleService },
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NewSale);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should display and add the selected product on the first attempt', async () => {
    component.productSearchControl.setValue('Filtro');
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(productService.searchProducts).toHaveBeenCalledOnceWith('Filtro');
    expect(component.filteredProducts).toEqual([product]);

    component.productSearchControl.setValue(product);
    component.selectProduct(product);

    expect(component.productSearchControl.value).toBe(product.name);
    expect(component.addItemForm.controls.product_id.value).toBe(product.id);

    await fixture.whenStable();
    fixture.detectChanges();
    const productInput = fixture.nativeElement.querySelector(
      '.product-field input',
    ) as HTMLInputElement;
    expect(productInput.value).toBe(product.name);

    component.addItem();
    fixture.detectChanges();

    expect(component.saleItems.length).toBe(1);
    expect(component.saleItems[0].product).toBe(product);
  });

  it('should show a loader while searching products', async () => {
    const searchResponse = new Subject<Product[]>();
    productService.searchProducts.and.returnValue(searchResponse);

    component.productSearchControl.setValue('Filtro');
    await new Promise((resolve) => setTimeout(resolve, 450));

    expect(component.productSearchLoading).toBeTrue();

    searchResponse.next([product]);
    searchResponse.complete();
    fixture.detectChanges();

    expect(component.productSearchLoading).toBeFalse();
    expect(component.filteredProducts).toEqual([product]);
  });
});
