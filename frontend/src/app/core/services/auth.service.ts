import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  expiresIn?: string;
}

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  userRole: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly API_URL = 'http://localhost:1234';

  constructor(private httpClient: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };
    return this.httpClient.post<LoginResponse>(`${this.API_URL}/users/login`, payload, {
      withCredentials: true,
    });
  }

  register(
    email: string,
    password: string,
    name?: string,
  ): Observable<{ message: string; userId: number }> {
    const payload = { email, password, name };
    return this.httpClient.post<{ message: string; userId: number }>(
      `${this.API_URL}/users/register`,
      payload,
    );
  }

  checkSession(): Observable<UserSession> {
    return this.httpClient.post<UserSession>(
      `${this.API_URL}/users/session`,
      {},
      {
        withCredentials: true,
      },
    );
  }

  logout(): Observable<{ message: string }> {
    return this.httpClient.post<{ message: string }>(
      `${this.API_URL}/users/logout`,
      {},
      {
        withCredentials: true,
      },
    );
  }
}
