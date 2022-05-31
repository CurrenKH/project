import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ScheduleComponent } from 'src/app/schedule/schedule.component';
import { AdminService } from 'src/app/services/admin.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-admin-availabilities',
  templateUrl: './admin-availabilities.component.html',
  styleUrls: ['./admin-availabilities.component.scss']
})
export class AdminAvailabilitiesComponent implements OnInit {

  reason: string = "Reason";

  saved: boolean = false;

  @ViewChild(ScheduleComponent) scheduleComponent!: ScheduleComponent;

  constructor(private adminService: AdminService, private router: Router) { }

  selectValue = {};
  students = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();

  ngOnInit(): void {
    this.getStudents();
  }

  saveSchedule() {
    var jsonToSend = ScheduleService.getJsonFromEvents(this.scheduleComponent.calendar.getApi().getEvents());
    console.log(jsonToSend)
    this.adminService.postStudentAvailabilities((this.selectValue as any).StudentID, jsonToSend).subscribe({
      next: resp => {
        console.log(resp);
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
    this.saved = true;
    setTimeout(() => { this.saved = false }, 2000)
  }

  getStudents() {
    this.adminService.getStudents().subscribe((resp: any) => {
      this.students = resp;
    });
  }
  onSelectChange(event: any): void {
    var studentSelected = this.selectValue as any;
    this.adminService.getStudentAvailabilities(studentSelected.StudentID).subscribe({
      next: resp => {
        let updatedEvents = ScheduleService.getEventsFromJson(resp);
        this.scheduleComponent.calendarOptions.events = updatedEvents;
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

}
