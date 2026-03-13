# 👥 UserBoard — Angular User Dashboard

A production-grade Angular 16 User Dashboard featuring a dynamic user table, Chart.js pie chart for role distribution, lazy-loaded modal form, RxJS state management, pagination, search, and sorting.

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v16+ (v18+ recommended)
- **npm** v8+
- **Angular CLI** v16

### Installation

```bash
# 1. Install Angular CLI globally (if not already installed)
npm install -g @angular/cli@16

# 2. Navigate to project folder
cd user-dashboard

# 3. Install dependencies
npm install

# 4. Start the development server
ng serve

# 5. Open your browser
# Navigate to http://localhost:4200
```

---

## 📁 Project Structure

```
src/
├── app/
│   ├── models/
│   │   └── user.model.ts              # User interface & UserRole type
│   ├── services/
│   │   └── user.service.ts            # BehaviorSubject state management
│   ├── pipes/
│   │   └── role-count.pipe.ts         # Pipe to count users by role
│   └── components/
│       ├── user-dashboard/
│       │   ├── user-dashboard.component.ts    # Main dashboard logic
│       │   ├── user-dashboard.component.html  # Template
│       │   └── user-dashboard.component.scss  # Styles
│       └── user-form/
│           ├── user-form.component.ts         # Modal form logic
│           ├── user-form.component.html       # Form template
│           ├── user-form.component.scss       # Form styles
│           └── user-form.module.ts            # Lazy-loadable module
├── styles.scss                        # Global CSS variables & resets
└── index.html                         # Entry HTML (Google Fonts loaded here)
```

---

## ✅ Features

### Core Requirements
| Feature | Status | Details |
|---|---|---|
| User Table | ✅ | Name, Email, Role columns with avatar initials |
| Role Pie Chart | ✅ | Chart.js, updates in real-time |
| Add User Modal | ✅ | Lazy-loaded, animated slide-up |
| Form Validation | ✅ | Required, email format, name pattern, length |
| BehaviorSubject State | ✅ | `UserService` with `users$` + `roleDistribution$` |
| Real-time Updates | ✅ | Table & chart update instantly on add |
| Lazy Load Chart.js | ✅ | Dynamic `import('chart.js')` on init |
| Lazy Load Form | ✅ | `UserFormModule` loaded on modal open |
| No Console Errors | ✅ | Clean, strict TypeScript |

### Bonus Features
| Feature | Status | Details |
|---|---|---|
| Search / Filter | ✅ | Debounced 300ms, searches name, email, role |
| Pagination | ✅ | 5 users/page with page controls |
| Column Sorting | ✅ | Click headers to sort asc/desc |
| Delete User | ✅ | Per-row remove with icon button |
| Stats Bar | ✅ | Live count cards for all roles |
| Loading Skeleton | ✅ | Animated skeleton while Chart.js loads |
| Spinner Indicators | ✅ | On modal load and form submission |

---

## 🏗️ Architecture

### State Management (RxJS)

```
UserService
├── _users$: BehaviorSubject<User[]>      ← single source of truth
├── users$: Observable<User[]>            ← exposed read-only stream
├── roleDistribution$: Observable<...>    ← derived, auto-updates
├── addUser(data)                         ← emits updated array
└── deleteUser(id)                        ← emits filtered array

UserDashboardComponent
├── subscribes to users$                  ← re-renders table
├── subscribes to roleDistribution$       ← updates chart.data
└── ChangeDetectionStrategy.OnPush        ← optimised rendering
```

### Lazy Loading Strategy

**Chart.js** — loaded via ES dynamic import inside `ngOnInit()`:
```typescript
const { Chart, ArcElement, ... } = await import('chart.js');
```
This defers the ~200 KB Chart.js bundle until the dashboard initialises, and tree-shakes unused chart types.

**UserFormModule** — Angular module-level lazy loading. The `UserFormModule` and `UserFormComponent` are bundled separately. The modal spinner shows while the chunk is being resolved (simulated 300 ms delay to demonstrate async loading).

### Performance Optimisations
- `ChangeDetectionStrategy.OnPush` on both components
- `trackBy` function on `*ngFor` to minimise DOM mutations
- Debounced search with `distinctUntilChanged()` to avoid redundant filter runs
- Chart updated via `chart.update('active')` — data-only patch, no full re-render

---

## 🎨 Design System

| Token | Value | Usage |
|---|---|---|
| `--color-dark` | `#383838` | Primary text, headings |
| `--color-primary` | `#1c4980` | Header, buttons, Admin accent |
| `--color-editor` | `#0891b2` | Editor role accent |
| `--color-viewer` | `#7c3aed` | Viewer role accent |
| `--input-height` | `48px` | All inputs & buttons |
| `--radius` | `10px` | Cards, inputs |
| `--radius-lg` | `16px` | Panels, modal |

**Fonts**: `Syne` (headings/numbers, bold) + `DM Sans` (body/UI)

---

## 📦 Dependencies

| Package | Version | Purpose |
|---|---|---|
| `@angular/core` | ^16 | Framework |
| `chart.js` | ^4.4 | Pie chart (lazy-loaded) |
| `rxjs` | ~7.8 | BehaviorSubject, operators |
| `zone.js` | ~0.13 | Angular change detection |

---

## 🛠️ Available Commands

```bash
ng serve              # Dev server at localhost:4200
ng build              # Production build → dist/
ng build --watch      # Watch mode dev build
```

---

## 📋 Acceptance Criteria Checklist

- [x] Table with Name, Email, Role columns — updates on new user
- [x] Dynamic Chart.js pie chart — updates on new user
- [x] Lazy-loaded modal popup with validated form
- [x] Chart.js loaded lazily via dynamic import
- [x] BehaviorSubject drives all state; changes auto-propagate
- [x] No console errors or warnings in strict mode
- [x] Design theme `#383838` / `#1c4980`, buttons/inputs 48 px height
- [x] **Bonus**: Pagination (5/page), search filter, column sort, delete
