import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '@env/environment';

import { ReportService } from './report-service';

describe('ReportService', () => {
  let service: ReportService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReportService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should request the sales report by period', () => {
    const response = {
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      totalSales: 18,
      totalProducts: 6,
      items: [
        {
          product_id: 10,
          product_name: 'Filtro de Óleo',
          ref: 'FLT-001',
          category_id: 2,
          total_quantity: 12,
          total_amount: '479.60',
          average_unit_price: '39.97',
        },
      ],
    };

    service.getProductsSoldReport('2026-11-01', '2026-11-30').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/sale/report/products?startDate=2026-11-01&endDate=2026-11-30`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should request the top products report', () => {
    const response = {
      period: 'month' as const,
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      limit: 10,
      totalSales: 18,
      totalProducts: 5,
      items: [
        {
          product_id: 10,
          product_name: 'Filtro de Óleo',
          ref: 'FLT-001',
          category_id: 2,
          total_quantity: 12,
          total_amount: '479.60',
          average_unit_price: '39.97',
        },
      ],
    };

    service.getTopProductsReport('month', '2026-11-01', '2026-11-30', 10).subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/sale/report/top-products?period=month&startDate=2026-11-01&endDate=2026-11-30&limit=10`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });

  it('should request the revenue report', () => {
    const response = {
      startDate: '2026-11-01',
      endDate: '2026-11-30',
      totalSales: 18,
      totalRevenue: '12450.75',
    };

    service.getRevenueReport('2026-11-01', '2026-11-30').subscribe((result) => {
      expect(result).toEqual(response);
    });

    const request = httpTesting.expectOne(
      `${environment.apiUrl}/sale/report/revenue?startDate=2026-11-01&endDate=2026-11-30`,
    );
    expect(request.request.method).toBe('GET');
    request.flush(response);
  });
});
