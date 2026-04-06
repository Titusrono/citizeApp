import { Routes } from "@angular/router";
import { ModeratorListComponent } from "./admin/dashboard/moderator/components/list/moderator-list.component";
import { VoteCreateListComponent } from "./admin/dashboard/vote-create/components/list/vote-create-list.component";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { GoogleCallbackComponent } from "./auth/google-callback/google-callback.component";
import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from "./auth/register/register.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { UpdatePasswordComponent } from "./auth/update-password/update-password.component";
import { MainLayoutComponent } from "./shared/main-layout/main-layout.component";
import { PetitionListComponent } from "./citizen/portal/petition/components/list/petition-list.component";
import { ProposalListComponent } from "./citizen/portal/proposal/components/list/proposal-list.component";
import { RealtimereportListComponent } from "./citizen/portal/realtimereport/components/list/realtimereport-list.component";
import { StreamingLiveListComponent } from "./citizen/portal/streaminglive/components/list/streaminglive-list.component";
import { ProfileComponent } from "./auth/profile/profile.component";
import { ReportAdminListComponent } from "./admin/dashboard/report-admin/components/list/report-admin-list.component";
import { UsersregListComponent } from "./admin/dashboard/usersreg/components/list/usersreg-list.component";
import { BlogAdminListComponent } from "./admin/dashboard/blog-admin/components/list/blog-admin-list.component";
import { VirtualCreateListComponent } from "./admin/dashboard/virtual-create/components/list/virtual-create-list.component";
import { RoleGuard } from "./core/auth/role.guard";
import { AuthGuard } from "./core/auth/auth.guard";
import { AdminPetitionListComponent } from "./admin/dashboard/adminpetition/components/list/adminpetition-list.component";
import { VoteResultsComponent } from "./admin/dashboard/vote-create/components/results/vote-results.component";

export const routes: Routes = [
  // Root route - redirect to login or dashboard based on auth state
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Public routes

  // Auth routes
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'forgot-password', title: 'Forgot Password', component: ForgotPasswordComponent },
  { path: 'reset-password', title: 'Reset Password', component: ResetPasswordComponent },
  { path: 'update-password', title: 'Update Password', component: UpdatePasswordComponent },
  { path: 'google-callback', title: 'Google Login', component: GoogleCallbackComponent },
  {path:'profile', title:'Profile', component:ProfileComponent},

  // Authenticated routes with sidebar
  {
    path: 'portal',
    component: MainLayoutComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['citizen', 'ward_manager', 'constituency_manager', 'admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'realtimereport', pathMatch: 'full' },
      { path: 'realtimereport', title: 'Report Issue', component: RealtimereportListComponent },
      { path: 'petition', title: 'Petitions', component: PetitionListComponent },
      { path: 'proposal', title: 'Vote on Projects', component: ProposalListComponent },
      { path: 'streaminglive', title: 'Virtual Hall', component: StreamingLiveListComponent },
    ],
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'report-admin', pathMatch: 'full' },
      { path: 'moderator', title: 'Moderator', component: ModeratorListComponent },
      { path: 'report-admin', title: 'Reports Admin', component: ReportAdminListComponent },
      { path: 'vote-create', title: 'Vote Create', component: VoteCreateListComponent },
      { path: 'votes/:id', title: 'Vote Results', component: VoteResultsComponent },
      { path: 'virtual-create', title: 'Virtual Meet', component: VirtualCreateListComponent },
      { path: 'adminpetition', title: 'Admin Petition', component: AdminPetitionListComponent },
      { path: 'usersreg', title: 'Users Register', component: UsersregListComponent },
      { path: 'blog_admin', title: 'Admin Blog', component: BlogAdminListComponent },
      { path: 'profile', title: 'Profile', component: ProfileComponent },
    ],
  },
  // Wildcard route - redirect to login for any undefined routes
  { path: '**', redirectTo: '/login', pathMatch: 'full' }
];
