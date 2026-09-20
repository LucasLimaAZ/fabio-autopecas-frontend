import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';

import { CategoryService } from './category-service';

describe('CategoryService', () => {
  let service: CategoryService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(CategoryService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('should create a category with POST /category', () => {
    const category = { name: 'Filtros' };

    service.createCategory(category).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/category`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(category);
    request.flush({ id: 1, ...category });
  });

  it('should list categories with GET /category', () => {
    service.getCategories().subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/category`);
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('should delete a category with DELETE /category/:id', () => {
    service.deleteCategory(4).subscribe();

    const request = httpTesting.expectOne(`${environment.apiUrl}/category/4`);
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
