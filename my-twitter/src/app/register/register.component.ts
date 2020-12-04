import { Component, ViewChild } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, NgForm, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { emailValidator, rePasswordValidatorFactory } from '../validators';
import { User } from '../interfaces/user';
import { trigger, state, style, transition, animate } from '@angular/animations';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  animations:[
    trigger('fade',[
      state('void',style({opacity:0})),
      transition(':enter, :leave', [ // void <=> *
        animate(1000)
      ])
    ])
  ]
})
export class RegisterComponent {
  @ViewChild('f')
  ngForm!: NgForm;
  form: FormGroup;

  constructor(private http: HttpClient, private router: Router,
    private fb: FormBuilder,) {
    const passwordControl = this.fb.control('test-password', [Validators.required, Validators.minLength(4)]);
    this.form = this.fb.group({
      email: ['test@email.bg', [Validators.required, Validators.email, emailValidator], []],
      username: ['test-username', [Validators.required, Validators.minLength(4)], []],
      password: passwordControl,
      confirmPassword: ['test-password', [Validators.required, Validators.minLength(4), rePasswordValidatorFactory(passwordControl)]],
    });
  }


  onSubmit(): void {
    const content = this.ngForm.value;

    if (!this.form.controls.confirmPassword.errors && !this.form.controls.password.errors &&
      !this.form.controls.username.errors && !this.form.controls.email.errors) {

      this.http.get<User[]>('https://dark-twitter-fe5f2.firebaseio.com/users.json')
        .subscribe(responseData => {
          let isUsernameTaken = false;
          let isEmailTaken = false;
          for (const User in responseData) {
            if (this.form.controls.email.value == responseData[User].email) {
              isEmailTaken = true;
            }
            if (this.form.controls.username.value == responseData[User].username) {
              isUsernameTaken = true;
            }
            if (isEmailTaken && isUsernameTaken) {
              break;
            }
          }
          if (!isUsernameTaken && !isEmailTaken) {
            this.http.post('https://dark-twitter-fe5f2.firebaseio.com/users.json', {
              email: content.email,
              password: content.password,
              username: content.username,
            })
              .subscribe(responseData => {
                //TODO: something maybe?
                //console.log(responseData);
              });
            this.router.navigate(["/user/login"]);
          } else {
            if (isUsernameTaken) {
              alert("Username is taken.")
            }
            if (isEmailTaken) {
              alert("Email is registered.")
            }
          }
        });
    } else {
      console.log("Form incorrect!")
      return;
    }

  }

}
