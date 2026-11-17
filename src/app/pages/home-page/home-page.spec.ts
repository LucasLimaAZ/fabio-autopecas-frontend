import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { HomeService } from '../../shared/services/home-service';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  const homeService = jasmine.createSpyObj<HomeService>('HomeService', ['getHomeStats']);

  beforeEach(async () => {
    homeService.getHomeStats.and.returnValue(
      of({
        totalSalesToday: 6,
        lowStockProducts: [
          {
            id: 10,
            name: 'Filtro de Óleo',
            ref: 'FLT-001',
            category_id: 2,
            amount: 3,
            minimum_amount: 10,
            missing_amount: 7,
            sale_price: '39.90',
          },
        ],
        topSellingProducts: [
          {
            rank: 1,
            product_id: 10,
            name: 'Filtro de Óleo',
            ref: 'FLT-001',
            category_id: 2,
            amount: 42,
            sale_price: '39.90',
            total_quantity: 24,
            total_amount: '957.60',
          },
        ],
        topSellingPeriod: {
          startDate: '2026-10-19',
          endDate: '2026-11-17',
        },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [{ provide: HomeService, useValue: homeService }],
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
