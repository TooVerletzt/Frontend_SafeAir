import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'sa-dashboard-humidity-widget',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './dashboard-humidity-widget.component.html',
  styleUrl: './dashboard-humidity-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardHumidityWidgetComponent {
  @Input({ required: true }) humidityPct = 50;

  readonly radius = 62;
  readonly circumference = Math.PI * this.radius;

  get clampedHumidity(): number {
    return Math.max(0, Math.min(100, this.humidityPct));
  }

  get dashOffset(): number {
    return this.circumference * (1 - this.clampedHumidity / 100);
  }
}
