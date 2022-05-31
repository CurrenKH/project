import { Component, OnInit, ViewChild } from '@angular/core';
import { AdminNavbarComponent } from '../admin-navbar/admin-navbar.component';

@Component({
  selector: 'app-admin-main',
  templateUrl: './admin-main.component.html',
  styleUrls: ['./admin-main.component.scss']
})
export class AdminMainComponent implements OnInit {


  activePage: number = 1;

  constructor() { }

  ngOnInit(): void {
  }

  pageChanged(page: number){
    this.activePage = page;
  }

}
