import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CategoryService } from '../../shared/services/category-service';
import { Categories } from './categories';

describe('Categories', () => {
  let component: Categories;
  let fixture: ComponentFixture<Categories>;
  const categoryService = jasmine.createSpyObj<CategoryService>('CategoryService', [
    'createCategory',
    'getCategories',
    'deleteCategory',
  ]);

  beforeEach(async () => {
    categoryService.getCategories.calls.reset();
    categoryService.createCategory.calls.reset();
    categoryService.deleteCategory.calls.reset();

    categoryService.getCategories.and.returnValue(of([]));
    categoryService.createCategory.and.returnValue(of({ id: 1, name: 'Filtros' }));
    categoryService.deleteCategory.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [Categories],
      providers: [{ provide: CategoryService, useValue: categoryService }],
    }).compileComponents();

    fixture = TestBed.createComponent(Categories);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should load categories when initialized', () => {
    expect(component).toBeTruthy();
    expect(categoryService.getCategories).toHaveBeenCalled();
  });

  it('should create and append a category', () => {
    component.categoryForm.setValue({ name: 'Filtros' });

    component.onSubmit();

    expect(categoryService.createCategory).toHaveBeenCalledWith({ name: 'Filtros' });
    expect(component.categories).toEqual([{ id: 1, name: 'Filtros' }]);
    expect(component.successMessage).toBe('Categoria cadastrada com sucesso!');
  });

  it('should confirm and delete a category', () => {
    spyOn(window, 'confirm').and.returnValue(true);
    component.categories = [{ id: 1, name: 'Filtros' }];

    component.deleteCategory(component.categories[0]);

    expect(window.confirm).toHaveBeenCalledWith('Deseja excluir a categoria "Filtros"?');
    expect(categoryService.deleteCategory).toHaveBeenCalledWith(1);
    expect(component.categories).toEqual([]);
    expect(categoryService.getCategories).toHaveBeenCalledTimes(2);
    expect(component.successMessage).toBe('Categoria excluída com sucesso!');
  });
});
