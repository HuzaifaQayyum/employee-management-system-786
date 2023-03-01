import { environment } from './../../environments/environment';
import { Observable } from 'rxjs';
import { Supervisor } from './../models/Supervisor.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Account } from '../models/Account.model';

@Injectable({ providedIn: 'root' })
export class AdminService {
    private url = `${environment.serverUrl}/admin`;

    constructor(private http: HttpClient) { }


    fetchSupervisors(pageNo = 0): Observable<Supervisor[]> { 
        return this.http.get<Supervisor[]>(this.url + '/supervisors', { params: new HttpParams().set('pageNo', pageNo.toString()) });
    }

    fetchTotalPagesOfSupervisors(): Observable<{ pages: number}> { 
        return this.http.get<{ pages: number }>(this.url + '/supervisors-no-of-pages');
    }

    createSupervisor(formData: Supervisor): Observable<Supervisor> {
        return this.http.post<Supervisor>(this.url + '/supervisors', formData);
    }

    updateSupervisor(_id: string, formData: Supervisor): Observable<Supervisor> {
        return this.http.put<Supervisor>(this.url + `/supervisors/${_id}`, formData);
    }

    deleteSupervisor(_id: string): Observable<Supervisor> {
        return this.http.delete<Supervisor>(this.url + `/supervisors/${_id}`);
    }

    fetchTotalPagesOfAccounts(): Observable<{ pages: number }> { 
        return this.http.get<{ pages: number }>(this.url + '/accounts-no-of-pages');
    }

    fetchAccounts(pageNo = 0): Observable<Account[]> { 
        return this.http.get<Account[]>(this.url + '/accounts', { params: new HttpParams().set('pageNo', pageNo.toString()) });
    }

    deleteAccount(_id: string): Observable<Account> { 
        return this.http.delete<Account>(this.url + `/accounts/${_id}`);
    }

    createAccount(formData: { email: string, isAdmin: boolean }): Observable<Account> { 
        return this.http.post<Account>(this.url + '/accounts', formData);
    }

    updateAccount(_id: string, formData: { email: string, isAdmin: boolean }): Observable<Account> { 
        return this.http.put<Account>(this.url + `/accounts/${_id}`, formData);
    }
}
