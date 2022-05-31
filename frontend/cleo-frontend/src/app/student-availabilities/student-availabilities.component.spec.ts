import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAvailabilitiesComponent } from './student-availabilities.component';

describe('StudentAvailabilitiesComponent', () => {
  let component: StudentAvailabilitiesComponent;
  let fixture: ComponentFixture<StudentAvailabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StudentAvailabilitiesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentAvailabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
