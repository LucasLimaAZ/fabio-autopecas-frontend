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
        totalProducts: 12,
        totalUsers: 8,
        totalSales: 56,
        lowStockProducts: 3,
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
