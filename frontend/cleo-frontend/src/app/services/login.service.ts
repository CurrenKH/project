import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';


@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor(private http: HttpClient) { }

  tryLogin(studentid: string, password: string): Observable<any> {
    return this.http.post(environment.serverUrl + '/login', { StudentID: studentid, Password: password });
  }

  tryRegister(data: any): Observable<any> {
    return this.http.post(environment.serverUrl + '/register', data);
  }

}
