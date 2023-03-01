import { ErrorService } from './../services/Error.service';
import { AuthService } from './../services/auth.service';
import { Observable, throwError } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthInterceptor implements HttpInterceptor {

    constructor(private authService: AuthService, private errorService: ErrorService) { }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        if (req.url.includes('/auth')) return next.handle(req);

        const modifiedReq = req.clone({
            headers: req.headers.set('authorization', `Bearer ${this.authService.token}`)
        });
        return next.handle(modifiedReq).pipe(
            catchError((error: HttpErrorResponse) => {
                switch (error.status) {
                    case 401:
                        this.authService.logoutUser();
                        this.errorService.add(`You are not authorized to visit the route that you requested. You was logged out.`);
                        break;
                    case 0:
                        this.errorService.add(`Server is not responding, make sure your internet connection is active.`);
                        break;
                    case 500:
                        this.errorService.add(`Something went wrong. Please try again later.`);
                        break;
                }

                this.errorService.handleHttpError(error);

                return throwError(error);
              })
        );
    }

}
