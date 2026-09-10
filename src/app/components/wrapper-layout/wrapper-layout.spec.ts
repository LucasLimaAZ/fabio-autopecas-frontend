import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WrapperLayout } from './wrapper-layout';

describe('WrapperLayout', () => {
  let component: WrapperLayout;
  let fixture: ComponentFixture<WrapperLayout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WrapperLayout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WrapperLayout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
