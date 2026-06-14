import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, RouterModule } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

import { TablerIconsModule } from 'angular-tabler-icons';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { AppSettings } from 'src/app/config';
import { MaterialModule } from 'src/app/material.module';
import { AuthUser } from 'src/app/models/auth-user';
import {
  HeaderNotification,
  HeaderProfileOption,
} from 'src/app/models/header.model';
import { AuthService } from 'src/app/services/auth.service';
import { CoreService } from 'src/app/services/core.service';

@Component({
  selector: 'app-header',
  imports: [RouterModule, NgScrollbarModule, TablerIconsModule, MaterialModule],
  templateUrl: './header.component.html',
  encapsulation: ViewEncapsulation.None,
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() showToggle = true;
  @Input() toggleChecked = false;

  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleMobileFilterNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  @Output() optionsChange = new EventEmitter<AppSettings>();

  showFiller = false;
  options = this.settings.getOptions();

  currentUser: AuthUser | null = null;
  private currentUserSubscription?: Subscription;

  notifications: HeaderNotification[] = [
    {
      id: 1,
      img: '/assets/images/profile/user-1.jpg',
      title: 'Nuevo reporte generado',
      subtitle: 'Consulta el módulo de reportes',
    },
    {
      id: 2,
      img: '/assets/images/profile/user-2.jpg',
      title: 'Mapa territorial actualizado',
      subtitle: 'Hay nueva información disponible',
    },
    {
      id: 3,
      img: '/assets/images/profile/user-3.jpg',
      title: 'Sesión activa',
      subtitle: 'Usuario autenticado correctamente',
    },
  ];

  profileOptions: HeaderProfileOption[] = [
    {
      id: 1,
      img: '/assets/images/svgs/icon-account.svg',
      title: 'Mi perfil',
      subtitle: 'Información de usuario',
      link: '/',
    },
    {
      id: 2,
      img: '/assets/images/svgs/icon-tasks.svg',
      title: 'Dashboard',
      subtitle: 'Panel principal',
      link: '/dashboard',
    },
  ];

  constructor(
    private readonly settings: CoreService,
    private readonly router: Router,
    private readonly authService: AuthService,
    public dialog: MatDialog,
    private readonly translate: TranslateService,
  ) {
    this.translate.setDefaultLang('en');
  }

  ngOnInit(): void {
    this.currentUserSubscription = this.authService
      .getCurrentUser()
      .subscribe((user) => {
        this.currentUser = user;
      });
  }

  ngOnDestroy(): void {
    this.currentUserSubscription?.unsubscribe();
  }

  logout(): void {
    this.authService.logout().subscribe(() => {
      this.router.navigate(['/authentication/login']);
    });
  }

  private emitOptions(): void {
    this.optionsChange.emit(this.options);
  }

  setlightDark(theme: string): void {
    this.options.theme = theme;
    this.emitOptions();
  }
}
