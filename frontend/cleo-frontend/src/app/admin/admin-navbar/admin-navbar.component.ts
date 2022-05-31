import { Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { Router } from '@angular/router';
import { faCalendarWeek, faClock, faFileAlt, faUsers, faTags, faBars, faSignOutAlt  } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-admin-navbar',
  templateUrl: './admin-navbar.component.html',
  styleUrls: ['./admin-navbar.component.scss']
})
export class AdminNavbarComponent implements OnInit {
  icons = {
    faCalendarWeek: faCalendarWeek,
    faClock: faClock,
    faFileAlt: faFileAlt,
    faUsers: faUsers,
    faTags: faTags,
    faBars: faBars,
    faSignOut: faSignOutAlt
  };

  @Output() pageChanged: EventEmitter<number> =   new EventEmitter();
  @Input() activePage: number = 1;

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  toggleSideBar(): void {
    document.getElementById('sidebar')?.classList.toggle('active');
  }

  clickNavLink(linkNo: number): void {
    this.activePage = linkNo;
    this.pageChanged.emit(this.activePage);
  }

  logout(): void{
    localStorage.setItem("token", "");
    localStorage.setItem("studentID", "");
    localStorage.setItem("admin", "");
    this.router.navigate(['/login']);
  }

}
