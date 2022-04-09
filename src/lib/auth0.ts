import fetch from 'node-fetch';
import { config } from '../lib/config';
import { Auth0UserInfo, Tokens } from '../models';

export class Auth0 {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async getUserInfo(): Promise<Auth0UserInfo> {
    return fetch(`${config.auth0.domain}/userInfo`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    }).then((res) => res.json());
  }

  async refreshToken(clientId: string, refreshToken: string): Promise<Tokens> {
    var body = new URLSearchParams();
    body.append('grant_type', 'refresh_token');
    body.append('client_id', clientId);
    body.append('refresh_token', refreshToken);

    return fetch(`${config.auth0.domain}/oauth/token`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'content-type': 'application/x-www-form-urlencoded',
      },
      body,
    }).then((res) => {
      if (!res.ok) {
        throw new Error(`Failed to refresh token: ${res.statusText}`);
      }

      return res.json();
    });
  }
}
