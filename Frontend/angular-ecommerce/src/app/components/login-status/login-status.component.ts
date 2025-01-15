import { OktaAuth } from '@okta/okta-auth-js';
import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH, OktaAuthStateService } from '@okta/okta-angular';

@Component({
  selector: 'app-login-status',
  templateUrl: './login-status.component.html',
  styleUrls: ['./login-status.component.css'],
  standalone: false
})
export class LoginStatusComponent implements OnInit {

  isAuthenticated: boolean = false
  userFullName: string = ''

  storage: Storage = sessionStorage

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth,
              private oktaAuthService: OktaAuthStateService) { }

  ngOnInit() {
    this.oktaAuthService.authState$.subscribe(
      (result) => {
        this.isAuthenticated = result.isAuthenticated!
        this.getUserDetails()
      }
    )
  }

  getUserDetails() {
    if(this.isAuthenticated) {
      this.oktaAuth.getUser().then(
        (res) => {
          this.userFullName = res.name as string

          const theEmail = res.email
          this.storage.setItem('userEmail', JSON.stringify(theEmail))
        }
      )
    }
  }

  logout() {
    this.oktaAuth.signOut()
  }

}
