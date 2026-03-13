import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { User, UserRole } from '../models/user.model';

export interface RoleDistribution {
  Admin: number;
  Editor: number;
  Viewer: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly _users$ = new BehaviorSubject<User[]>([
    {
      id: crypto.randomUUID(),
      name: 'User1',
      email: 'user1@example.com',
      role: 'Admin',
      createdAt: new Date('2024-01-10')
    },
    {
      id: crypto.randomUUID(),
      name: 'User2',
      email: 'user2@example.com',
      role: 'Editor',
      createdAt: new Date('2024-02-14')
    },
    {
      id: crypto.randomUUID(),
      name: 'User3',
      email: 'user3@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-03-05')
    },

    {
      id: crypto.randomUUID(),
      name: 'User4',
      email: 'user4@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-01-10')
    },
    {
      id: crypto.randomUUID(),
      name: 'User5',
      email: 'user5@example.com',
      role: 'Editor',
      createdAt: new Date('2024-02-14')
    },
    {
      id: crypto.randomUUID(),
      name: 'User6',
      email: 'user6@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-03-05')
    },
    {
      id: crypto.randomUUID(),
      name: 'User7',
      email: 'user7@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-01-10')
    },
    {
      id: crypto.randomUUID(),
      name: 'User8',
      email: 'user8@example.com',
      role: 'Editor',
      createdAt: new Date('2024-02-14')
    },
    {
      id: crypto.randomUUID(),
      name: 'User9',
      email: 'user9@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-03-05')
    },
    {
      id: crypto.randomUUID(),
      name: 'User10',
      email: 'user10@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-01-10')
    },
    {
      id: crypto.randomUUID(),
      name: 'Sudeep',
      email: 'user11@example.com',
      role: 'Editor',
      createdAt: new Date('2024-02-14')
    },
    {
      id: crypto.randomUUID(),
      name: 'Lakshmi',
      email: 'user12@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-03-05')
    },
    {
      id: crypto.randomUUID(),
      name: 'Priya',
      email: 'user13@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-01-10')
    },
    {
      id: crypto.randomUUID(),
      name: 'Karthi',
      email: 'user14@example.com',
      role: 'Editor',
      createdAt: new Date('2024-02-14')
    },
    {
      id: crypto.randomUUID(),
      name: 'Mani',
      email: 'user15@example.com',
      role: 'Viewer',
      createdAt: new Date('2024-03-05')
    }
  ]);

  readonly users$: Observable<User[]> = this._users$.asObservable();

  readonly roleDistribution$: Observable<RoleDistribution> = this._users$.pipe(
    map(users => ({
      Admin: users.filter(u => u.role === 'Admin').length,
      Editor: users.filter(u => u.role === 'Editor').length,
      Viewer: users.filter(u => u.role === 'Viewer').length
    }))
  );

  get currentUsers(): User[] {
    return this._users$.getValue();
  }

  addUser(data: { name: string; email: string; role: UserRole }): void {
    const newUser: User = {
      id: crypto.randomUUID(),
      name: data.name.trim(),
      email: data.email.trim().toLowerCase(),
      role: data.role,
      createdAt: new Date()
    };
    this._users$.next([...this.currentUsers, newUser]);
  }

  deleteUser(id: string): void {
    this._users$.next(this.currentUsers.filter(u => u.id !== id));
  }

  filterUsers(query: string): Observable<User[]> {
    return this.users$.pipe(
      map(users =>
        query
          ? users.filter(u =>
              u.name.toLowerCase().includes(query.toLowerCase()) ||
              u.email.toLowerCase().includes(query.toLowerCase()) ||
              u.role.toLowerCase().includes(query.toLowerCase())
            )
          : users
      )
    );
  }
}
