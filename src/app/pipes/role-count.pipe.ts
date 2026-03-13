import { Pipe, PipeTransform } from '@angular/core';
import { User } from '../models/user.model';

@Pipe({ name: 'roleCount', pure: false })
export class RoleCountPipe implements PipeTransform {
  transform(users: User[], role: string): number {
    return users.filter(u => u.role === role).length;
  }
}
