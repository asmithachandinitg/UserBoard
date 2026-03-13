import { Component, EventEmitter, Output, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserRole } from '../../models/user.model';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserFormComponent {
  @Output() userAdded = new EventEmitter<{ name: string; email: string; role: UserRole }>();
  @Output() cancelled = new EventEmitter<void>();

  readonly roles: UserRole[] = ['Admin', 'Editor', 'Viewer'];
  submitted = false;
  isSubmitting = false;

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    this.form = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(60),
          Validators.pattern(/^[a-zA-Z\s'-]+$/)
        ]
      ],
      email: [
        '',
        [
          Validators.required,
          Validators.email,
          Validators.maxLength(120)
        ]
      ],
      role: ['', Validators.required]
    });
  }

  get name()  { return this.form.get('name')!; }
  get email() { return this.form.get('email')!; }
  get role()  { return this.form.get('role')!; }

  getNameError(): string {
    if (this.name.hasError('required'))   return 'Name is required.';
    if (this.name.hasError('minlength'))  return 'Name must be at least 2 characters.';
    if (this.name.hasError('maxlength'))  return 'Name must not exceed 60 characters.';
    if (this.name.hasError('pattern'))    return 'Name may only contain letters, spaces, hyphens and apostrophes.';
    return '';
  }

  getEmailError(): string {
    if (this.email.hasError('required'))   return 'Email is required.';
    if (this.email.hasError('email'))      return 'Please enter a valid email address.';
    if (this.email.hasError('maxlength'))  return 'Email is too long.';
    return '';
  }

  async onSubmit(): Promise<void> {
    this.submitted = true;
    if (this.form.invalid) return;

    this.isSubmitting = true;
    await new Promise(r => setTimeout(r, 400));

    this.userAdded.emit({
      name:  this.form.value.name,
      email: this.form.value.email,
      role:  this.form.value.role as UserRole
    });
    this.isSubmitting = false;
  }

  onCancel(): void {
    this.cancelled.emit();
  }
}
