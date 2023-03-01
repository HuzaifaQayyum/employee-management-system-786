import { HttpErrorResponse } from '@angular/common/http';
import { AuthService } from './../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-verify-email',
  templateUrl: './verify-email.component.html',
  styleUrls: ['./verify-email.component.css']
})
export class VerifyEmailComponent implements OnInit {
  private token: string;
  isLoading = true;
  serverMsg: string;
  isServerError: boolean;

  constructor(private route: ActivatedRoute, private authService: AuthService) { }

  ngOnInit(): void {
    this.token = this.route.snapshot.paramMap.get('token');

    this.authService.verifyEmail(this.token)
      .subscribe(({ token }) => {
        this.authService.saveTokenAndRedirect(token);
      }, ({ status }) => {
        if (status === 422) {
          this.serverMsg = 'Invalid Url or already used token.';
          this.isServerError = true;
        }
      });
  }

}
