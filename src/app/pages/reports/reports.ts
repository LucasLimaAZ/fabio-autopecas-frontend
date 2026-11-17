import { DatePipe } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { Observable } from 'rxjs';
import {
  ProductSalesSummary,
  ProductsSoldReport,
  ReportService,
  RevenueReport,
  SoldProductItem,
  TopProductsReport,
} from '../../shared/services/report-service';

type ReportType = 'products-sold' | 'top-products' | 'revenue';

interface ReportFormValue {
  reportType: ReportType;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-reports',
  imports: [
    DatePipe,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './reports.html',
  styleUrl: './reports.scss',
})
export class Reports {
  readonly reportTypeOptions = [
    { value: 'products-sold', label: 'Todos produtos vendidos' },
    { value: 'top-products', label: 'Produtos mais vendidos' },
    { value: 'revenue', label: 'Faturamento' },
  ] as const;

  readonly reportForm = new FormGroup({
    reportType: new FormControl<ReportType>('products-sold', { nonNullable: true }),
    startDate: new FormControl<Date | null>(this.getDateDaysAgo(30), {
      validators: [Validators.required],
    }),
    endDate: new FormControl<Date | null>(this.getToday(), {
      validators: [Validators.required],
    }),
  });

  readonly pageSize = 20;
  loading = false;
  errorMessage = '';
  currentPage = 1;
  totalItems = 0;
  totalPages = 0;
  reportData: ProductsSoldReport | TopProductsReport | RevenueReport | null = null;
  private readonly cdr = inject(ChangeDetectorRef);

  constructor(private readonly reportService: ReportService) {}

  get selectedReportType(): ReportType {
    return this.reportForm.getRawValue().reportType;
  }

  get currentReportLabel(): string {
    return (
      this.reportTypeOptions.find((option) => option.value === this.selectedReportType)?.label ??
      'Relatório'
    );
  }

  get hasResults(): boolean {
    if (!this.reportData) {
      return false;
    }

    if ('items' in this.reportData && Array.isArray(this.reportData.items)) {
      return this.reportData.items.length > 0;
    }

    return true;
  }

  submit(page = 1) {
    if (this.reportForm.invalid) {
      this.errorMessage = 'Informe as datas para consultar o relatório.';
      this.reportData = null;
      return;
    }

    const formValue = this.reportForm.getRawValue();
    if (!formValue.startDate || !formValue.endDate) {
      this.errorMessage = 'Informe as datas para consultar o relatório.';
      this.reportData = null;
      return;
    }

    if (formValue.startDate > formValue.endDate) {
      this.errorMessage = 'A data inicial não pode ser maior que a data final.';
      this.reportData = null;
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    this.reportData = null;

    const request$: Observable<ProductsSoldReport | TopProductsReport | RevenueReport> =
      this.buildRequest(
        {
          ...formValue,
          startDate: this.formatDateValue(formValue.startDate) ?? '',
          endDate: this.formatDateValue(formValue.endDate) ?? '',
        },
        page,
      );

    request$.subscribe({
      next: (response: ProductsSoldReport | TopProductsReport | RevenueReport) => {
        this.reportData = response;
        if (this.selectedReportType === 'products-sold' && 'totalItems' in response) {
          this.currentPage = response.page;
          this.totalItems = response.totalItems;
          this.totalPages = response.totalPages;
        } else {
          this.currentPage = 1;
          this.totalItems = 0;
          this.totalPages = 0;
        }
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.loading = false;
        this.errorMessage = 'Não foi possível carregar o relatório. Tente novamente.';
        this.reportData = null;
        this.cdr.detectChanges();
      },
      complete: () => {
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadReport() {
    this.submit();
  }

  resetFilters() {
    this.reportForm.reset({
      reportType: 'products-sold',
      startDate: this.getDateDaysAgo(30),
      endDate: this.getToday(),
    });
    this.submit();
  }

  formatCurrency(value: number | string | null | undefined): string {
    const numericValue = Number(value ?? 0);
    return numericValue.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  }

  getRevenueSummary(): { sales: number; revenue: string } | null {
    if (!this.reportData || !('totalRevenue' in this.reportData)) {
      return null;
    }

    return {
      sales: Number(this.reportData.totalSales ?? 0),
      revenue: this.formatCurrency(this.reportData.totalRevenue),
    };
  }

  getSummaryMetrics(): { sales: number; products: number } | null {
    if (!this.reportData || !('totalSales' in this.reportData)) {
      return null;
    }

    const products =
      'totalItems' in this.reportData
        ? Number(this.reportData.totalItems ?? 0)
        : 'totalProducts' in this.reportData
          ? Number(this.reportData.totalProducts ?? 0)
          : 0;

    return {
      sales: Number(this.reportData.totalSales ?? 0),
      products,
    };
  }

  getProductRows(): Array<ProductSalesSummary | SoldProductItem> {
    if (!this.reportData || !('items' in this.reportData)) {
      return [];
    }

    return this.reportData.items ?? [];
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.submit(this.currentPage - 1);
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.submit(this.currentPage + 1);
    }
  }

  private buildRequest(
    formValue: ReportFormValue,
    page = 1,
  ): Observable<ProductsSoldReport | TopProductsReport | RevenueReport> {
    if (formValue.reportType === 'products-sold') {
      return this.reportService.getProductsSoldReport(
        formValue.startDate,
        formValue.endDate,
        page,
        this.pageSize,
      );
    }

    if (formValue.reportType === 'top-products') {
      return this.reportService.getTopProductsReport(formValue.startDate, formValue.endDate);
    }

    return this.reportService.getRevenueReport(formValue.startDate, formValue.endDate);
  }

  private getToday(): Date {
    return new Date();
  }

  private getDateDaysAgo(days: number): Date {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  }

  private formatDateValue(value: Date | null | undefined): string | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    const timezoneOffset = date.getTimezoneOffset();
    const normalized = new Date(date.getTime() - timezoneOffset * 60 * 1000);
    return normalized.toISOString().slice(0, 10);
  }
}
