import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { faMinusCircle, faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-admin-register',
  templateUrl: './admin-register.component.html',
  styleUrls: ['./admin-register.component.scss']
})
export class AdminRegisterComponent implements OnInit {

  icons = {
    faPlusCircle: faPlusCircle,
    faMinusCircle: faMinusCircle,
  };

  @ViewChild('content', {read: TemplateRef}) public content!: TemplateRef<any>;

  students = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();
  inactiveStudents = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();
  nonRegisteredStudents = Array<{ StudentID: string, LastName: string, FirstName: string, CellPhone: string, Email: string }>();
  activeStudentId: String = "";
  inactiveStudentId: String = "";
  unregisteredStudentId: String = "";
  addStudentID: String = "";

  constructor(private adminService: AdminService,
              private router: Router, 
              private modalService: NgbModal) { }

  ngOnInit(): void {
    this.getAllStudents();
  }

  getAllStudents(){
    this.getStudents();
    this.getInactiveStudents();
    this.getUnregisteredStudents();
  }

  showModal(): void {
    this.modalService.open(this.content, {ariaLabelledBy: 'modal-basic-title'});
  }
  addStudent(modal: any){
    if(this.addStudentID != null && this.addStudentID.length > 0){
      this.adminService.addStudent(this.addStudentID).subscribe({
        next: () => {
          this.getAllStudents();
          modal.close();
        },
        error: () => {
          localStorage.setItem("token", "");
          localStorage.setItem("studentID", "");
          localStorage.setItem("admin", "");
          this.router.navigate(['/login']);
        }
      });
    }
    else{
      alert('Numéro étudiant invalide.')
    }
  }

  getStudents() {
    this.adminService.getStudents().subscribe({
      next: resp => {
        this.students = resp as any;
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  deleteStudent(studentid: any){
    this.adminService.deleteStudent(studentid).subscribe({
      next: () => {
        this.getAllStudents();
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  makeStudentInactive(studentid: any){
    this.adminService.makeStudentInactive(studentid).subscribe({
      next: () => {
        this.getAllStudents();
        this.activeStudentId = "";
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  makeStudentActive(studentid: any){
    this.adminService.makeStudentActive(studentid).subscribe({
      next: () => {
        this.getAllStudents();
        this.inactiveStudentId = "";
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  getInactiveStudents() {
    this.adminService.getInactiveStudents().subscribe({
      next: resp => {
        this.inactiveStudents = resp as any;
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  getUnregisteredStudents() {
    this.adminService.getUnregisteredStudents().subscribe({
      next: resp => {
        this.nonRegisteredStudents = resp as any;
      },
      error: () => {
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.router.navigate(['/login']);
      }
    });
  }

  selectActiveStudent(student: any) {
      this.activeStudentId = student.StudentID;
  }

  selectNonActiveStudentId(student: any){
    this.inactiveStudentId = student.StudentID;
  }

  selectUnregisteredStudentId(student: any){
    this.unregisteredStudentId = student.StudentID;
  }

}
