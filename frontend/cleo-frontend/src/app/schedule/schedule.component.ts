import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CalendarOptions, FullCalendarComponent } from '@fullcalendar/angular';
import { Draggable } from '@fullcalendar/interaction';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.scss']
})
export class ScheduleComponent implements OnInit {
  modalCloseResult = '';
  @ViewChild(FullCalendarComponent) calendar!: FullCalendarComponent;
  @ViewChild('content', {read: TemplateRef}) public content!: TemplateRef<any>;
  @Input() overlap!: boolean;
  @Input() fridayEnabled!: boolean;
  events: any[] = [];
  reason: string = "";
  startTime: string = '07:30:00';
  endTime: string = '19:00:00';
  reasonEventId: any;

  constructor(private modalService: NgbModal) {  }

  calendarOptions: CalendarOptions = {
    schedulerLicenseKey: 'CC-Attribution-NonCommercial-NoDerivatives',
    initialView: 'timeGridWeek',
    weekends: false,
    locale: 'fr',
    allDaySlot: false,
    slotDuration: '00:30:00',
    slotLabelInterval: '00:30',
    droppable: true,
    nowIndicator: false,
    slotLabelFormat: {
      hour: 'numeric',
      minute: '2-digit',
      omitZeroMinute: false,
      meridiem: 'short'
    },
    slotMinTime: this.startTime,
    slotMaxTime: this.endTime,
    expandRows: true,
    headerToolbar: false,
    height: 'auto',
    editable: true,
    dayHeaderFormat: {weekday: 'long'},
    eventClick: this.eventClick.bind(this)
  };

  eventClick(info: any): void {
    this.reasonEventId = info.event.id;
    this.reason = info.event.title;
    if (this.reasonEventId != 'na')
      this.showModal(this.content, info.event.title)
  }

  showModal(content: TemplateRef<any>, reason: string): void {
    const modalRef: any = this.modalService.open(content, {ariaLabelledBy: 'modal-basic-title'});
  }
  deleteClick(modal: any): void{
    this.calendar.getApi().getEventById(this.reasonEventId)?.remove();
    modal.close();
  }
  saveClick(modal: any): void{
    this.calendar.getApi().getEventById(this.reasonEventId)?.setProp('title', this.reason);
    modal.close();
  }
  ngOnInit(): void {
    this.calendarOptions.eventOverlap = this.overlap;
    let reasonEvent = document.getElementById("fc-event");
    if(reasonEvent)
    new Draggable(reasonEvent!, {
      eventData: function(event: any){
        return {
          title: event.innerText,
          duration: '00:30',
        };
      }
    });
  }

}
