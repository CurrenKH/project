import { Injectable } from '@angular/core';
import { v4 as uuid } from 'uuid';


@Injectable({
	providedIn: 'root'
})
export class ScheduleService {

	constructor() { }

	//Output format '07:30'
	static blockToTime(block: number): string {
		var startTime = new Date('1000-10-10 07:30:00');
		for (let i = 0; i < block; i++) {
			if (i == block - 1)
				return startTime.toLocaleTimeString();
			startTime.setMinutes(startTime.getMinutes() + 30);
		}
		return '';
	}
	//Input format '07:30'
	static timeToBlock(time: string): number {
		var dateTime = new Date('1000-10-10 ' + time);
		let block = 1;
		var startTime = new Date('1000-10-10 07:30:00');
		while (startTime < dateTime) {
			block++;
			startTime.setMinutes(startTime.getMinutes() + 30);
		}
		return block;
	}

	static getJsonFromEvents(events: any): any {
		var json = { 'availabilities': Array<{ day: Date, block: number, desc: string }>() };
		events.forEach((event: any) => {
			var eventDurationInBlocks = ((event.end as Date).getTime() - (event.start as Date).getTime()) / 1800000;
			var tmpStartdate = new Date(event.start);
			for (let i = 0; i < eventDurationInBlocks; i++) {
				json.availabilities.push({
					day: event.start.getDay(),
					block: this.timeToBlock(tmpStartdate.toLocaleTimeString()),
					desc: event.title
				});
				tmpStartdate.setTime(tmpStartdate.getTime() + 1800000);
			}
		});
		return json;
	}

	//Takes JSON returned by backend/database and turns that into Events that can be fed to the calendar
	static getEventsFromJson(data: any): Array<any> {
		var today = new Date();
		let dataArray = data as any[];
		let events: Array<{ title: string, date: Date }> = [];
		let overlaps: Array<{ title: string, date: Date }> = [];
		let date: Date;
		dataArray.forEach(e => {
			if (!isNaN(e.Block)) e.Block = this.blockToTime(e.Block);
			date = new Date(today.toLocaleDateString() + " " + e.Block);//Block is the time
			date.setDate(date.getDate() + (e.Day - date.getDay()));
			if (e.isOverlap)
				overlaps.push({ title: e.Description, date: date });
			else
				events.push({ title: e.Description, date: date });
		});

		//Sort overlaps
		//By student and time
		overlaps.sort((a, b) => {
			if (a.title == b.title) {
				return a.date.getTime() - b.date.getTime();
			}
			else{
				return a.title > b.title ? 1 : -1;
			}
		});
		//By day
		overlaps.sort((a, b) => { return a.date.getDay() - b.date.getDay() });

		//Sort by time
		events.sort((a, b) => { return a.date.getTime() - b.date.getTime() });
		events.push.apply(events, overlaps);

		//Turn two or more small events into a bigger one when adjacent in time
		let updatedEvents: Array<{ id: string, title: string, start: Date, end: Date }> = [];
		let arr: { title: string, date: Date }[] = [];
		let tmpDate: Date;
		for (let i = 0; i < events.length; i++) {
			arr.push(events[i]);
			if (arr.length > 1 && ((arr[arr.length - 1].date.getTime() - arr[arr.length - 2].date.getTime()) > 1800000 || !arr.every(e => e.title == arr[0].title))) {
				tmpDate = new Date(arr[0].date);
				tmpDate.setTime(tmpDate.getTime() + (arr[arr.length - 2].date.getTime() - arr[0].date.getTime()) + 1800000);
				updatedEvents.push({ id: uuid(), title: arr[0].title, start: arr[0].date, end: tmpDate })
				arr = [];
				arr.push(events[i]);
			}
		}
		if (arr.length > 1) {
			tmpDate = new Date(arr[0].date);
			tmpDate.setTime(tmpDate.getTime() + (arr[arr.length - 1].date.getTime() - arr[0].date.getTime()) + 1800000);
			updatedEvents.push({ id: uuid(), title: arr[0].title, start: arr[0].date, end: tmpDate })
		}
		else if (arr.length == 1) {
			tmpDate = new Date(arr[0].date);
			tmpDate.setTime(arr[0].date.getTime() + 1800000);
			updatedEvents.push({ id: uuid(), title: arr[0].title, start: arr[0].date, end: tmpDate })
		}
		return updatedEvents;
	}
}
