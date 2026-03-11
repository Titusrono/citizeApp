import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { HeaderComponent } from './shared/header/header.component';
import { FooterComponent } from './shared/footer/footer.component';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, HeaderComponent, RouterOutlet, FooterComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'citizenConnectFrontend';
  showFooter = true;
  showHeader = true;

  constructor(
    private router: Router,
    private themeService: ThemeService
  ) {
    // Initialize theme service (constructor will handle initialization)
  }

  ngOnInit() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        const url = event.urlAfterRedirects;
        const isAuthenticatedRoute = url.startsWith('/portal') || url.startsWith('/dashboard');
        this.showFooter = !isAuthenticatedRoute;
        this.showHeader = !isAuthenticatedRoute;
      });
  }
}
