import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminAvailabilitiesComponent } from './admin-availabilities.component';

describe('AdminAvailabilitiesComponent', () => {
  let component: AdminAvailabilitiesComponent;
  let fixture: ComponentFixture<AdminAvailabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminAvailabilitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminAvailabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
