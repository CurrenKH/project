import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient) { }

  getStudents() {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/students', { headers });
  }
  getInactiveStudents() {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/students/inactive', { headers });
  }
  getUnregisteredStudents(){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/students/unregistered', { headers });
  }
  addStudent(studentID: String) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/student/add?studentid=' + studentID, {}, { headers });
  }
  makeStudentInactive(studentID: string){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/student/inactive?studentid=' + studentID, {}, { headers });
  }
  makeStudentActive(studentID: string){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/student/active?studentid=' + studentID, {}, { headers });
  }
  deleteStudent(studentID: string) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.delete(environment.serverUrl + '/admin/student?studentid=' + studentID, { headers });
  }
  deleteSchedule() {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.delete(environment.serverUrl + '/admin/schedule', { headers });
  }
  getStudentAvailabilities(studentID: string) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/availabilities?studentid='+studentID, { headers });
  }
  postStudentAvailabilities(studentID: string, data: any) {
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/availabilities?studentid='+studentID, { data }, { headers });
  }

  getScheduleProposals(studPerRel: Number){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/schedule?studPerRel='+studPerRel, { headers });
  }
  selectSchedule(schedule: any){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/schedule/selectSchedule', { schedule } , { headers });
  }
  getStudentRoles(studentID: string){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/roles?studentid='+studentID, { headers });
  }
  postStudentRoles(studentID: string, data: any){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/roles?studentid='+studentID, { data }, { headers });
  }
  getSchedule(){
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.get(environment.serverUrl + '/admin/schedule', { headers});
  }
  printPdf(data: any): Observable<Blob>{
    const headers = { 'Authorization': 'Bearer '+localStorage.getItem("token")};
    return this.http.post(environment.serverUrl + '/admin/printpdf', { data }, { headers: headers, responseType: 'blob'});
  }
}
