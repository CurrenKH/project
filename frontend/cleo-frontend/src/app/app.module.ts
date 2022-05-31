import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'
import { FullCalendarModule } from '@fullcalendar/angular';
import interactionPlugin from '@fullcalendar/interaction';
import timeGridPlugin from '@fullcalendar/timegrid';
import scrollGridPlugin from '@fullcalendar/scrollgrid';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {HttpClientModule} from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ScheduleComponent } from './schedule/schedule.component';
import { AdminNavbarComponent } from './admin/admin-navbar/admin-navbar.component';
import { AdminScheduleComponent } from './admin/admin-schedule/admin-schedule.component';
import { AdminAvailabilitiesComponent } from './admin/admin-availabilities/admin-availabilities.component';
import { AdminReportsComponent } from './admin/admin-reports/admin-reports.component';
import { AdminRegisterComponent } from './admin/admin-register/admin-register.component';
import { AdminRolesComponent } from './admin/admin-roles/admin-roles.component';
import { AdminMainComponent } from './admin/admin-main/admin-main.component';
import { AuthGuard } from './AuthGuard';
import { StudentNavbarComponent } from './student-navbar/student-navbar.component';
import { StudentComponent } from './student/student.component';
import { StudentAvailabilitiesComponent } from './student-availabilities/student-availabilities.component';
import { StudentInfoComponent } from './student-info/student-info.component';

FullCalendarModule.registerPlugins([
  timeGridPlugin,
  interactionPlugin,
  scrollGridPlugin
]);


@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    ScheduleComponent,
    StudentComponent,
    AdminNavbarComponent,
    AdminScheduleComponent,
    AdminAvailabilitiesComponent,
    AdminReportsComponent,
    AdminRegisterComponent,
    AdminRolesComponent,
    AdminMainComponent,
    StudentNavbarComponent,
    StudentAvailabilitiesComponent,
    StudentInfoComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    FormsModule,
    HttpClientModule,
    FullCalendarModule,
    FontAwesomeModule
  ],
  providers: [AuthGuard],
  bootstrap: [AppComponent]
})
export class AppModule { }
