import { Component, Inject, OnInit } from '@angular/core';
import { OKTA_AUTH } from '@okta/okta-angular'

//2 formas: criar um ficheiro (okta-signin-widget.d.ts) ou usar (// @ts-ignore)
import OktaSignIn from '@okta/okta-signin-widget'

import { OktaAuth } from '@okta/okta-auth-js';
import myAppConfig from '../../config/my-app-config';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: false
})
export class LoginComponent implements OnInit {

  oktaSignin: any

  constructor(@Inject(OKTA_AUTH) private oktaAuth: OktaAuth) {
    this.oktaSignin = new OktaSignIn({
      logo: 'assets/images/logo.png',
      baseUrl: myAppConfig.oidc.issuer.split('/oauth2')[0],
      clientId: myAppConfig.oidc.clientId,
      redirectUri: myAppConfig.oidc.redirectUri,
      authParams: {
        pkce: true,
        issuer: myAppConfig.oidc.issuer,
        scopes: myAppConfig.oidc.scopes
      }
    })
  }

  ngOnInit() {
    this.oktaSignin.remove()

    this.oktaSignin.renderEl({
      el: '#okta-sign-in-widget'},

      (response: any) => {
        if(response.status === 'SUCCESS') {
          this.oktaAuth.signInWithRedirect()
        }
      },
      (error: any) => {
        throw error
      }
    )
  }

}