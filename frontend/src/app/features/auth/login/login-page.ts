import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, Field, form, required, validate } from '@angular/forms/signals';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { LoggingDataModel } from '@datasources/login/login';
import { LoginService } from '@services/login.service';

@Component({
  selector: 'app-login-page',
  imports: [NgOptimizedImage, CommonModule, Field],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  loginModel = signal<LoggingDataModel>({
    email: '',
    password: '',
    confirmPassword: '',
    isRegistring: false,
  });
  isRegistring = signal(false);

  loginForm = form(this.loginModel, (schemaPath) => {
    required(schemaPath.email, { message: 'El email es obligatorio' });
    email(schemaPath.email, { message: 'Introduce una dirección de email válida' });
    required(schemaPath.password, { message: 'La contraseña es obligatoria' });
    required(schemaPath.confirmPassword, {
      message: 'La confirmación de la contraseña es obligatoria',
    });
    validate(schemaPath.confirmPassword, ({ value, valueOf }) => {
      const password = valueOf(schemaPath.password);
      const confirmPassword = value();
      if (password !== confirmPassword) {
        return { kind: 'passwordMismatch', message: 'Las contraseñas no coinciden' };
      }
      return null;
    });
  });

  loginService = inject(LoginService);

  onSubmit(event: Event) {
    event.preventDefault();
    this.login();
  }

  login() {
    console.warn('Login attempt', this.loginModel());
    if (!this.isRegistring()) {
      this.loginService.login(this.loginModel().email, this.loginModel().password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
        },
        error: (error) => {
          console.error('Login failed:', error);
        },
      });
    } else {
      this.loginService.register(this.loginModel().email, this.loginModel().password).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
        },
        error: (error) => {
          console.error('Registration failed:', error);
        },
      });
    }
  }

  changeRegistring() {
    this.isRegistring.set(!this.isRegistring());
    this.loginModel.update((model) => ({
      ...model,
      isRegistring: this.isRegistring(),
    }));
  }

  defaultLogin() {
    this.isRegistring.set(false);
    this.loginModel.set({
      email: 'joseluisabellanmonreal@gmail.com',
      password: 'admin',
      confirmPassword: '',
      isRegistring: false,
    });
    this.login();
  }
}
