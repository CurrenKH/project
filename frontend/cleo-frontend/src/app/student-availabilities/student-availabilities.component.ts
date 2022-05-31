import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ScheduleComponent } from '../schedule/schedule.component';
import { ScheduleService } from '../services/schedule.service';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-availabilities',
  templateUrl: './student-availabilities.component.html',
  styleUrls: ['./student-availabilities.component.scss']
})
export class StudentAvailabilitiesComponent implements OnInit {

  reason: string = "Reason";

  saved: boolean = false;

  @ViewChild(ScheduleComponent) scheduleComponent!: ScheduleComponent;

  constructor(private studentService: StudentService, private scheduleService: ScheduleService, private router: Router) { }

  ngOnInit(): void {
    this.studentService.getScheduleForStudent().subscribe({
      next: data => {
        console.log('data: ', data);
      let updatedEvents = ScheduleService.getEventsFromJson(data);
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

  saveSchedule() {
    var jsonToSend = ScheduleService.getJsonFromEvents(this.scheduleComponent.calendar.getApi().getEvents());
    console.log(jsonToSend)
    this.studentService.postScheduleForStudent(jsonToSend).subscribe({
      next: resp =>{
      console.log(resp);
      },
      error: () =>{
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
    this.saved = true;
    setTimeout(()=>{ this.saved = false }, 2000)
  }
}
