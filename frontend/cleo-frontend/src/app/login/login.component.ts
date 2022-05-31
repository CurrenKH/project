import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { LoginService } from '../services/login.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  studentID: string = "";
  password: string = "";

  registerInfo = {
    studentID: "",
    firstName: "",
    lastName: "",
    email: "",
    cellphone: "",
    password: "",
    passwordRepeat: ""
  };

  forgotEmail: string = '';

  @ViewChild('content', {read: TemplateRef}) public content!: TemplateRef<any>;

  isLogin: boolean = true;

  failedLogin = false;
  registerMessage: string = '';

  constructor(private loginService: LoginService, private router: Router, private modalService: NgbModal) { }

  ngOnInit(): void {
    if(localStorage.getItem('token')){
      if(localStorage.getItem('admin') == 'true')
        this.router.navigate(['/admin']);
      else
        this.router.navigate(['/student']);
    }
  }

  registerToggle(){
    this.isLogin = false;
  }
  loginToggle(){
    this.isLogin = true;
  }

  forgotPassword(){
    this.modalService.open(this.content);
  }

  forgotPasswordSend(){
    
  }

  onSubmit(): void {
    this.loginService.tryLogin(this.studentID, this.password).subscribe({
      next: data => {
        //Login worked. Save tokens
        localStorage.setItem("token", data.token);
        localStorage.setItem("studentID", data.studentID);
        localStorage.setItem("admin", data.admin);
        if(data.admin)
          this.router.navigate(['/admin']);
        else
          this.router.navigate(['/student']);
      },
      error: () => {
        //Error, could not login. Most likely a 
        //401 unauthorized from server but no reason to verify
        localStorage.setItem("token", "");
        localStorage.setItem("studentID", "");
        localStorage.setItem("admin", "");
        this.failedLogin = true;
        setTimeout(() => {
          this.failedLogin = false;
        }, 5000);
      }
    });
  }

  onRegisterSubmit(): void {
    this.loginService.tryRegister(this.registerInfo).subscribe({
      next: () => {
        //Register Done
        alert('Vous êtes maintenant inscrits. Vous pouvez vous connecter.')
      },
      error: err => {
        //Error, could not register. Set message
        this.registerMessage = err.error.message;
        this.failedLogin = true;
        setTimeout(() => {
          this.failedLogin = false;
        }, 5000);
      }
    });
  }

}
