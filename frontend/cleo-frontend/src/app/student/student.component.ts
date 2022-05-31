import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss']
})
export class StudentComponent implements OnInit {

  activePage: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  pageChanged(page: number){
    this.activePage = page;
  }

}
