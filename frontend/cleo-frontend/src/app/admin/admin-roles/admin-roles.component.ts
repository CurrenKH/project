import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin-roles',
  templateUrl: './admin-roles.component.html',
  styleUrls: ['./admin-roles.component.scss']
})
export class AdminRolesComponent implements OnInit {

  selectValue = {};
  students = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();

  tutorCheck: boolean = false;
  relCheck: boolean = false;
  monitorCheck: boolean = false;
  saved: boolean = false;

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.getStudents();
  }

  getStudents() {
    this.adminService.getStudents().subscribe((resp: any) => {
      this.students = resp;
    });
  }
  onSelectChange(event: any): void {
    var studentSelected = this.selectValue as any;
    this.adminService.getStudentRoles(studentSelected.StudentID).subscribe({
      next: resp => {
        this.tutorCheck = false;
        this.relCheck = false;
        this.monitorCheck = false;
        let respArray = resp as any[];
        respArray.forEach(role => {
          if(role.JobID == 3){
            //Relationiste
            this.relCheck = true;
          }
          else if(role.JobID == 1){
            //Tuteur
            this.tutorCheck = true;
          }
          else if(role.JobID == 2){
            //Moniteur
            this.monitorCheck = true;
          }
        });
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  saveRoles(): void {
    var jsonToSend = {roles: Array<number>()};
    if(this.tutorCheck)
      jsonToSend.roles.push(1);
    if(this.monitorCheck)
      jsonToSend.roles.push(2);
    if(this.relCheck)
      jsonToSend.roles.push(3);
    this.adminService.postStudentRoles((this.selectValue as any).StudentID, jsonToSend).subscribe({
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

}
