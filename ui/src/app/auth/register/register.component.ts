import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  standalone: true,
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  errorMessage: string | null = null;
  wards: string[] = [];

  subCounties = [
    { name: 'Tetu', wards: ['Dedan Kimathi', 'Wamagana', 'Aguthi-Gaaki'] },
    { name: 'Kieni', wards: ['Gatarakwa', 'Naromoru Kiamathaga', 'Mweiga', 'Mugunda', 'Kabaru', 'Thegu River', 'Konyu'] },
    { name: 'Mathira East', wards: ['Magutu', 'Mutithi', 'Karatina Town', 'Kirimukuyu'] },
    { name: 'Mathira West', wards: ['Ruguru', 'Mbiriri', 'Iria-Ini'] },
    { name: 'Othaya', wards: ['Karima', 'Irigithathi', 'Mahiga', 'Chinga', 'Mugunda'] },
    { name: 'Mukurweini', wards: ['Rugi', 'Gikondi', 'Mukurwe-Ini West', 'Mukurwe-Ini Central'] },
  ];

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      username: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z\s]+$/),
        ],
      ],
      phone_no: [
        '',
        [
          Validators.required,
          Validators.pattern(/^(\+2547\d{8}|07\d{8})$/), // +2547XXXXXXXX or 07XXXXXXXX
        ],
      ],
      email: ['', [Validators.required, Validators.email]],
      password: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.pattern(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]+$/),
        ],
      ],
      confirmPassword: ['', Validators.required],
      subCounty: ['', Validators.required],
      ward: ['', Validators.required],
    }, {
      validators: [this.passwordsMatchValidator]
    });
  }

  updateWards(): void {
    const selectedSubCounty = this.registerForm.get('subCounty')?.value;
    const selected = this.subCounties.find(sc => sc.name === selectedSubCounty);
    this.wards = selected ? selected.wards : [];
    this.registerForm.patchValue({ ward: '' });
  }

  passwordsMatchValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  };

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.errorMessage = 'Please fill all fields correctly.';
      this.registerForm.markAllAsTouched();
      return;
    }

    this.errorMessage = null;

    const payload = {
      username: this.registerForm.value.username,
      phone_no: this.registerForm.value.phone_no,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      subCounty: this.registerForm.value.subCounty,
      ward: this.registerForm.value.ward,
      role: 'citizen',
    };

    this.authService.register(payload).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err: { error: { message: string } }) => {
        this.errorMessage = err.error?.message || 'Registration failed. Please try again.';
      },
    });
  }
}
