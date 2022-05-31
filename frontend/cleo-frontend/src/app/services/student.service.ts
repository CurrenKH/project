import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StudentService {

  constructor(private http: HttpClient) { }

  getScheduleForStudent() {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")}
    return this.http.get(environment.serverUrl + '/student/availabilities', { headers });
  }

  postScheduleForStudent(data: any) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")}
    return this.http.post(environment.serverUrl + '/student/availabilities', { data }, {headers});
  }

  getStudentInfo() {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")}
    return this.http.get(environment.serverUrl + '/student/info', {headers});
  }

  postStudentInfo(data: any) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")}
    return this.http.post(environment.serverUrl + '/student/info',{data}, {headers});
  }
}
