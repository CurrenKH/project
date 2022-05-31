import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EventApi } from '@fullcalendar/angular';
import { ScheduleComponent } from 'src/app/schedule/schedule.component';
import { AdminService } from 'src/app/services/admin.service';
import { ScheduleService } from 'src/app/services/schedule.service';

@Component({
  selector: 'app-admin-schedule',
  templateUrl: './admin-schedule.component.html',
  styleUrls: ['./admin-schedule.component.scss']
})
export class AdminScheduleComponent implements OnInit {

  isScheduleChosen = false;
  saved: boolean = false;
  studPerRel: Number = 2;
  page: number = 1;
  nbSchedules: number = 1;
  currentScore: number = 0;
  proposals: any[] = [];
  currentMissingStudents = {block1: [], block2: []};
  selectValue = { StudentID: "", LastName: "", FirstName: "", CellPhone: "", Email: "" };
  students = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();

  static mainInstance?: AdminScheduleComponent;

  @ViewChild(ScheduleComponent) scheduleComponent!: ScheduleComponent;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    AdminScheduleComponent.mainInstance = this;
    this.getStudents();
    this.getSchedule();
  }

  getSchedule(){
    this.adminService.getSchedule().subscribe({
      next: (resp: any) => {
        if(resp.length > 0){
          this.isScheduleChosen = true;
          resp.forEach((e: any) => {
            e.Student = e.StudentID;
            e.isOverlap = e.isOverlap == 0 ? false : true;
          });
          console.log(resp);
          this.setCurrentSchedule({schedule: resp});
          console.log(this.scheduleComponent.calendarOptions.events);
        }
      },
      error: () => {
        this.isScheduleChosen = false;
      }
    });
  }

  saveSchedule(){

  }

  printSchedule(){
    var calendarToPrint = document.querySelector("app-schedule") as HTMLElement;

    var fullHtml = 
                '<!DOCTYPE html>';
    fullHtml += '<html>'
    fullHtml += `<head>
                  <title>Imprimer Horaire</title>
                  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/fullcalendar@5.10.2/main.min.css"></link>
                  <style>
                    html {
                      -webkit-print-color-adjust: exact;
                    }
                  </style>
                 </head>`;
    fullHtml += '<body>'
    fullHtml +=   calendarToPrint.outerHTML;
    fullHtml += '</body>';
    fullHtml += '</html>';

    var dataToSend = {
      html: fullHtml
    };
    
    this.adminService.printPdf(dataToSend).subscribe(
       blob => {
        const a = document.createElement('a')
        const objectUrl = URL.createObjectURL(blob)
        a.href = objectUrl
        a.download = 'horaire.pdf';
        a.click();
        URL.revokeObjectURL(objectUrl);
    });
  }

  chooseAnotherSchedule(){
    this.adminService.deleteSchedule().subscribe({
      next: () => {
        this.isScheduleChosen = false;
        this.scheduleComponent.calendar.getApi().removeAllEvents();
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  getStudents() {
    this.adminService.getStudents().subscribe({
      next: (resp: any) => {
        this.students = resp;
        this.selectValue = this.students[0];
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }


  eventChanged(): void {
    let calendar = this as any;
    let eventsApi = calendar.getEvents();
    let eventsForJson: any[] = [];
    eventsApi.forEach((e: EventApi) => {
      var eventDurationInBlocks = ((e.end as Date).getTime() - (e.start as Date).getTime()) / 1800000;
      var tmpStartdate = new Date(e.start as Date);
      for (let i = 0; i < eventDurationInBlocks; i++) {
        eventsForJson.push(
          {
            Day: e.start?.getDay(),
            Block: tmpStartdate.toLocaleTimeString(),
            Student: e.title,
            Description: e.title
          });
        tmpStartdate.setTime(tmpStartdate.getTime() + 1800000);
      }
    });
    AdminScheduleComponent.mainInstance!.proposals[AdminScheduleComponent.mainInstance!.page - 1] = { schedule: eventsForJson };
    AdminScheduleComponent.mainInstance!.currentScore = 0;
  }


  generateSchedule(): void {
    if (!this.isScheduleChosen) {
      this.scheduleComponent.calendarOptions.eventChange = this.eventChanged; //Lateinit
      this.scheduleComponent.calendarOptions.eventRemove = this.eventChanged; //Lateinit
      this.adminService.getScheduleProposals(this.studPerRel).subscribe({
        next: (resp: any) => {
          this.proposals = resp.schedule;
          this.setCurrentSchedule(this.proposals[0])
          this.nbSchedules = this.proposals.length;
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

  pageChanged(page: number): void {
    this.setCurrentSchedule(this.proposals[page - 1]);
  }

  chooseCurrentSchedule(): void {
    if (this.proposals == undefined || this.proposals.length <= 0)
      return;
    var sched = this.proposals[this.page - 1];
    this.adminService.selectSchedule(sched.schedule).subscribe({
      next: (resp: any) => {
        alert("TEMP: Schedule chosen");
        this.getSchedule();
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  setCurrentSchedule(schedule: any) {
    let events: any[] = [];
    schedule.schedule.forEach((event: any) => {
      event.Description = event.Student;
      events.push(event);
    });
    this.currentScore = schedule.score;
    this.currentMissingStudents = schedule.missingStudents;
    let updatedEvents = ScheduleService.getEventsFromJson(events);
    this.scheduleComponent.calendarOptions.events = updatedEvents;
  }

}
