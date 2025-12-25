import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  message: string;
  user: {
    id: number;
    email: string;
    name?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  private readonly API_URL = 'http://localhost:1234';

  constructor(private httpClient: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };
    return this.httpClient.post<LoginResponse>(`${this.API_URL}/users/login`, payload);
  }

  register(
    email: string,
    password: string,
    name?: string
  ): Observable<{ message: string; userId: number }> {
    const payload = { email, password, name };
    return this.httpClient.post<{ message: string; userId: number }>(
      `${this.API_URL}/users/register`,
      payload
    );
  }
}
