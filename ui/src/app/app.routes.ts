import { Routes } from "@angular/router";
import { ModeratorComponent } from "./admin/dashboard/moderator/moderator.component";
import { VoteCreateComponent } from "./admin/dashboard/vote-create/vote-create.component";
import { ForgotPasswordComponent } from "./auth/forgot-password/forgot-password.component";
import { GoogleCallbackComponent } from "./auth/google-callback/google-callback.component";
import { LoginComponent } from "./auth/login/login.component";
import { RegisterComponent } from "./auth/register/register.component";
import { ResetPasswordComponent } from "./auth/reset-password/reset-password.component";
import { UpdatePasswordComponent } from "./auth/update-password/update-password.component";
import { MainLayoutComponent } from "./shared/main-layout/main-layout.component";
import { AboutComponent } from "./components/about/about.component";
import { BlogComponent } from "./components/blog/blog.component";
import { ContactComponent } from "./components/contact/contact.component";
import { HomeComponent } from "./components/home/home.component";
import { PetitionComponent } from "./citizen/portal/petition/petition.component";
import { PrivacyComponent } from "./components/privacy/privacy.component";
import { ProposalComponent } from "./citizen/portal/proposal/proposal.component";
import { RealtimereportComponent } from "./citizen/portal/realtimereport/realtimereport.component";
import { ServiceComponent } from "./components/service/service.component";
import { StreamingliveComponent } from "./citizen/portal/streaminglive/streaminglive.component";
import { TermsComponent } from "./components/terms/terms.component";
import { PagenotfoundComponent } from "./shared/pagenotfound/pagenotfound.component";
import { ProfileComponent } from "./auth/profile/profile.component";
import { ReportAdminComponent } from "./admin/dashboard/report-admin/report-admin.component";
import { UsersregComponent } from "./admin/dashboard/usersreg/usersreg.component";
import { BlogAdminComponent } from "./admin/dashboard/blog-admin/blog-admin.component";
import { BlogsdetailsComponent } from "./components/blogsdetails/blogsdetails.component";
import { VirtualCreateComponent } from "./admin/dashboard/virtual-create/virtual-create.component";
import { RoleGuard } from "./core/auth/role.guard";
import { AuthGuard } from "./core/auth/auth.guard";
import { AdminpetitionComponent } from "./admin/dashboard/adminpetition/adminpetition.component";
import { UnauthorizedComponent } from "./shared/unauthorized/unauthorized.component";

export const routes: Routes = [
  // Public routes
  { path: '', title: 'Home', component: HomeComponent },
  { path: 'about', title: 'About', component: AboutComponent },
  { path: 'service', title: 'Services', component: ServiceComponent },
  { path: 'blog', title: 'Blog', component: BlogComponent },
  { path: 'contact', title: 'Contact', component: ContactComponent },
  { path: 'privacy', title: 'Privacy Policy', component: PrivacyComponent },
  { path: 'blogsdetails/:id', component: BlogsdetailsComponent },

  { path: 'terms', title: 'Terms & Conditions', component: TermsComponent },

  // Auth routes
  { path: 'login', title: 'Login', component: LoginComponent },
  { path: 'register', title: 'Register', component: RegisterComponent },
  { path: 'forgot-password', title: 'Forgot Password', component: ForgotPasswordComponent },
  { path: 'reset-password', title: 'Reset Password', component: ResetPasswordComponent },
  { path: 'update-password', title: 'Update Password', component: UpdatePasswordComponent },
  { path: 'google-callback', title: 'Google Login', component: GoogleCallbackComponent },
  {path:'profile', title:'Profile', component:ProfileComponent},
  { path: 'unauthorized', title: 'Unauthorized', component: UnauthorizedComponent },

  // Authenticated routes with sidebar
  {
    path: 'portal',
    component: MainLayoutComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['citizen', 'ward_manager', 'constituency_manager', 'admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'realtimereport', pathMatch: 'full' },
      { path: 'realtimereport', title: 'Report Issue', component: RealtimereportComponent },
      { path: 'petition', title: 'Petitions', component: PetitionComponent },
      { path: 'proposal', title: 'Vote on Projects', component: ProposalComponent },
      { path: 'streaminglive', title: 'Virtual Hall', component: StreamingliveComponent },
    ],
  },
  {
    path: 'dashboard',
    component: MainLayoutComponent,
    canActivate: [RoleGuard, AuthGuard],
    data: { roles: ['admin', 'super_admin'] },
    children: [
      { path: '', redirectTo: 'report-admin', pathMatch: 'full' },
      { path: 'moderator', title: 'Moderator', component: ModeratorComponent },
      { path: 'report-admin', title: 'Reports Admin', component: ReportAdminComponent },
      { path: 'vote-create', title: 'Vote Create', component: VoteCreateComponent },
      { path: 'virtual-create', title: 'Virtual Meet', component: VirtualCreateComponent },
      { path: 'adminpetition', title: 'Admin Petition', component: AdminpetitionComponent },
      { path: 'usersreg', title: 'Users Register', component: UsersregComponent },
      { path: 'blog_admin', title: 'Admin Blog', component: BlogAdminComponent },
      { path: 'profile', title: 'Profile', component: ProfileComponent },
    ],
  },

  // Fallback
  { path: '**', title: '404 - Page Not Found', component: PagenotfoundComponent },
];
