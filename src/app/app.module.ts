import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { AppComponent } from './app.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { UserFormModule } from './components/user-form/user-form.module';
import { UserFormComponent } from './components/user-form/user-form.component';

import { RoleCountPipe } from './pipes/role-count.pipe';

@NgModule({
  declarations: [
    AppComponent,
    UserDashboardComponent,
    RoleCountPipe
  ],
  imports: [
    BrowserModule,
    CommonModule,
    ReactiveFormsModule,
    UserFormModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
