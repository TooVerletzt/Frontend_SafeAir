import { NgFor } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { DashboardUser } from '@features/dashboard/domain/models/dashboard-user.model';

interface DashboardSidebarItem {
  readonly label: string;
  readonly iconSrc: string;
  readonly to: string;
}

@Component({
  selector: 'sa-dashboard-sidebar',
  standalone: true,
  imports: [NgFor, RouterLink, RouterLinkActive],
  templateUrl: './dashboard-sidebar.component.html',
  styleUrl: './dashboard-sidebar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardSidebarComponent {
  @Input({ required: true }) user!: DashboardUser;

  readonly menuItems: readonly DashboardSidebarItem[] = [
    { label: 'Inicio', iconSrc: 'assets/icons/cuadros.png', to: '/dashboard' },
    { label: 'Dashboard', iconSrc: 'assets/icons/area.png', to: '/dashboard-view' },
    { label: 'Cuartos', iconSrc: 'assets/icons/cuarto.png', to: '/rooms' },
    { label: 'Actuadores', iconSrc: 'assets/icons/actuador.png', to: '/actuators' },
    { label: 'Configuración', iconSrc: 'assets/icons/escudo.png', to: '/settings' },
  ];
}
