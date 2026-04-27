import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

@Component({
  selector: 'sa-dashboard-topbar',
  standalone: true,
  templateUrl: './dashboard-topbar.component.html',
  styleUrl: './dashboard-topbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardTopbarComponent {
  @Input({ required: true }) locationLabel = '';
}
