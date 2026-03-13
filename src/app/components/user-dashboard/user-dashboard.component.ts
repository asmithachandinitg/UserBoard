import {
  Component, OnInit, OnDestroy,
  ViewChild, ElementRef, NgZone,
  ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subject, combineLatest, debounceTime, distinctUntilChanged, takeUntil } from 'rxjs';
import { FormControl } from '@angular/forms';
import { UserService, RoleDistribution } from '../../services/user.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-user-dashboard',
  templateUrl: './user-dashboard.component.html',
  styleUrls: ['./user-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('chartCanvas') chartCanvas!: ElementRef<HTMLCanvasElement>;

  users: User[] = [];
  filteredUsers: User[] = [];
  showModal = false;
  isLoadingModal = false;
  isLoadingChart = false;
  chartReady = false;
  currentPage = 1;
  pageSize = 8;
  searchControl = new FormControl('');
  sortColumn: keyof User | '' = '';
  sortAsc = true;

  private chart: any = null;
  private destroy$ = new Subject<void>();
  private searchTerm = '';

  constructor(
    private userService: UserService,
    private ngZone: NgZone,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.userService.users$
      .pipe(takeUntil(this.destroy$))
      .subscribe(users => {
        this.users = users;
        this.applyFilter();
        this.cdr.markForCheck();
      });

    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(term => {
      this.searchTerm = term ?? '';
      this.currentPage = 1;
      this.applyFilter();
      this.cdr.markForCheck();
    });

    this.userService.roleDistribution$
      .pipe(takeUntil(this.destroy$))
      .subscribe(dist => {
        if (this.chart) {
          this.updateChart(dist);
        }
      });
    this.loadChart();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.chart?.destroy();
  }


  private async loadChart(): Promise<void> {
    this.isLoadingChart = true;
    this.cdr.markForCheck();

    try {
      const { Chart, ArcElement, Tooltip, Legend, PieController } = await import('chart.js');
      Chart.register(ArcElement, Tooltip, Legend, PieController);
      await this.waitForCanvas();

      this.ngZone.runOutsideAngular(() => {
        const dist = this.currentDistribution();
        this.chart = new Chart(this.chartCanvas.nativeElement, {
          type: 'pie',
          data: this.buildChartData(dist),
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: { duration: 600, easing: 'easeInOutQuart' },
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: { family: 'DM Sans', size: 13, weight: 500 },
                  color: '#383838',
                  padding: 20,
                  usePointStyle: true,
                  pointStyleWidth: 12
                }
              },
              tooltip: {
                callbacks: {
                  label: (ctx: any) => {
                    const total = (ctx.dataset.data as number[]).reduce((a: number, b: number) => a + b, 0);
                    const pct = total > 0 ? Math.round((ctx.parsed / total) * 100) : 0;
                    return ` ${ctx.label}: ${ctx.parsed} (${pct}%)`;
                  }
                },
                backgroundColor: '#383838',
                titleFont: { family: 'DM Sans', size: 13 },
                bodyFont: { family: 'DM Sans', size: 13 },
                padding: 12,
                cornerRadius: 8
              }
            }
          }
        });
      });

      this.chartReady = true;
    } catch (err) {
      console.error('Chart.js failed to load:', err);
    } finally {
      this.isLoadingChart = false;
      this.cdr.markForCheck();
    }
  }

  private waitForCanvas(): Promise<void> {
    return new Promise(resolve => {
      const check = () => {
        if (this.chartCanvas?.nativeElement) {
          resolve();
        } else {
          setTimeout(check, 50);
        }
      };
      setTimeout(check, 0);
    });
  }

  private buildChartData(dist: RoleDistribution) {
    return {
      labels: ['Admin', 'Editor', 'Viewer'],
      datasets: [{
        data: [dist.Admin, dist.Editor, dist.Viewer],
        backgroundColor: ['#1c4980', '#0891b2', '#7c3aed'],
        hoverBackgroundColor: ['#163a66', '#0c7a9e', '#6d28d9'],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverBorderWidth: 3
      }]
    };
  }

  private updateChart(dist: RoleDistribution): void {
    if (!this.chart) return;
    this.ngZone.runOutsideAngular(() => {
      this.chart.data.datasets[0].data = [dist.Admin, dist.Editor, dist.Viewer];
      this.chart.update('active');
    });
  }

  private currentDistribution(): RoleDistribution {
    return {
      Admin: this.users.filter(u => u.role === 'Admin').length,
      Editor: this.users.filter(u => u.role === 'Editor').length,
      Viewer: this.users.filter(u => u.role === 'Viewer').length
    };
  }

  applyFilter(): void {
    let result = [...this.users];
    if (this.searchTerm) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
      );
    }
    if (this.sortColumn) {
      result.sort((a, b) => {
        const aVal = String(a[this.sortColumn as keyof User]);
        const bVal = String(b[this.sortColumn as keyof User]);
        return this.sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      });
    }
    this.filteredUsers = result;
  }

  sort(col: keyof User): void {
    if (this.sortColumn === col) {
      this.sortAsc = !this.sortAsc;
    } else {
      this.sortColumn = col;
      this.sortAsc = true;
    }
    this.applyFilter();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredUsers.length / this.pageSize));
  }

  get pagedUsers(): User[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredUsers.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
    }
  }

  deleteUser(id: string): void {
    this.userService.deleteUser(id);
    if (this.currentPage > this.totalPages) {
      this.currentPage = this.totalPages;
    }
  }

  async openModal(): Promise<void> {
    this.isLoadingModal = true;
    this.cdr.markForCheck();
    await new Promise(r => setTimeout(r, 300));

    this.showModal = true;
    this.isLoadingModal = false;
    this.cdr.markForCheck();
  }

  closeModal(): void {
    this.showModal = false;
    this.cdr.markForCheck();
  }

  onUserAdded(user: { name: string; email: string; role: any }): void {
    this.userService.addUser(user);
    this.closeModal();
    this.currentPage = this.totalPages; 
  }

  trackByUserId(_: number, user: User): string {
    return user.id;
  }
}
