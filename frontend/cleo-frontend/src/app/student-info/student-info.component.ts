import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StudentService } from '../services/student.service';

@Component({
  selector: 'app-student-info',
  templateUrl: './student-info.component.html',
  styleUrls: ['./student-info.component.scss']
})
export class StudentInfoComponent implements OnInit {

  studentInfo = {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    passwordconfirm: ""
  }

  saved: boolean = false;

  constructor(private studentService: StudentService, private router: Router) { }

  ngOnInit(): void {
    this.studentService.getStudentInfo().subscribe({
      next: (data: any) =>{
        if(!data || data.length != 1)
          return;
        var info = data[0];
        this.studentInfo.firstName = info.FirstName;
        this.studentInfo.lastName = info.LastName;
        this.studentInfo.email = info.Email;
        this.studentInfo.phone = info.CellPhone;
      },
      error: () =>{
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  save(): void {
    if(this.studentInfo.password != this.studentInfo.passwordconfirm){
      alert("Passwords don't match.");
      return;
    }


    var infoToSend = {
      Email: this.studentInfo.email,
      CellPhone: this.studentInfo.phone,
      Password: this.studentInfo.password
    }
    this.studentService.postStudentInfo(infoToSend).subscribe({
      next: (data: any) =>{
        if(!data || data.length != 1)
          return;
      },
      error: () =>{
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
    this.saved = true;
    setTimeout(() => { this.saved = false }, 2000);
  }

}
