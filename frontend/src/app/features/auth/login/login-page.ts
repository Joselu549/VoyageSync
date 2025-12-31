import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { email, Field, form, required, validate } from '@angular/forms/signals';
import { LoggingDataModel, MsgLogin } from '@datasources/login/login';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FatherRoutes } from '@datasources/routes/routes';
import { AuthService } from '@services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login-page',
  imports: [NgOptimizedImage, CommonModule, Field],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  loginModel = signal<LoggingDataModel>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    isRegistring: false,
  });
  isRegistring = signal(false);
  msgLogin = signal<MsgLogin | null>(null);

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

  authService = inject(AuthService);
  router = inject(Router);

  onSubmit(event: Event) {
    event.preventDefault();
    this.login();
  }

  login() {
    this.msgLogin.set(null);
    if (!this.isRegistring()) {
      this.authService.login(this.loginModel().email, this.loginModel().password).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.msgLogin.set({
            message: 'Inicio de sesión exitoso. Redirigiendo al dashboard...',
            isError: false,
          });
          setTimeout(() => {
            this.router.navigate([FatherRoutes.DASHBOARD]);
          }, 1000);
        },
        error: (error) => {
          this.msgLogin.set({ message: error?.error?.error, isError: true });
        },
      });
    } else {
      this.authService
        .register(this.loginModel().name, this.loginModel().email, this.loginModel().password)
        .subscribe({
          next: (response) => {
            console.log('Registration successful:', response);
            this.msgLogin.set({
              message: 'Registro exitoso. Ahora puedes iniciar sesión.',
              isError: false,
            });
            this.authService.login(this.loginModel().email, this.loginModel().password).subscribe({
              next: (loginResponse) => {
                console.log('Login after registration successful:', loginResponse);
                setTimeout(() => {
                  this.router.navigate([FatherRoutes.DASHBOARD]);
                }, 1000);
              },
              error: (loginError) => {
                this.msgLogin.set({ message: loginError?.error?.error, isError: true });
              },
            });
          },
          error: (error) => {
            this.msgLogin.set({ message: error?.error?.error, isError: true });
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
      name: '',
      email: 'prueba@gmail.com',
      password: '123456',
      confirmPassword: '',
      isRegistring: false,
    });
    this.login();
  }
}
