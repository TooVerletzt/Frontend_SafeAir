import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe, NgFor } from '@angular/common';

interface ChartTick {
  readonly value: number;
  readonly y: number;
}

interface ChartXTick {
  readonly label: string;
  readonly x: number;
}

@Component({
  selector: 'sa-dashboard-co2-widget',
  standalone: true,
  imports: [DecimalPipe, NgFor],
  templateUrl: './dashboard-co2-widget.component.html',
  styleUrl: './dashboard-co2-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCo2WidgetComponent {
  @Input({ required: true }) co2Ppm = 500;
  @Input({ required: true }) history: readonly number[] = [];

  readonly chartWidth = 520;
  readonly chartHeight = 240;

  readonly minY = 0;
  readonly maxY = 2000;

  readonly marginTop = 16;
  readonly marginRight = 18;
  readonly marginBottom = 34;
  readonly marginLeft = 56;

  readonly yTicks: readonly ChartTick[] = Array.from({ length: 6 }, (_, index) => {
    const value = index * 400;

    return {
      value,
      y: this.toChartY(value),
    };
  });

  readonly xTicks: readonly ChartXTick[] = [
    { label: 'Hace 1 min', x: this.marginLeft },
    { label: '40 s', x: this.marginLeft + this.plotWidth * 0.33 },
    { label: '20 s', x: this.marginLeft + this.plotWidth * 0.66 },
    { label: 'Ahora', x: this.marginLeft + this.plotWidth },
  ];

  get linePath(): string {
    return this.buildLinePath(this.safeHistory);
  }

  get areaPath(): string {
    const history = this.safeHistory;

    if (history.length === 0) {
      return '';
    }

    const baseY = this.marginTop + this.plotHeight;

    return `${this.linePath} L ${this.marginLeft + this.plotWidth} ${baseY} L ${this.marginLeft} ${baseY} Z`;
  }

  get trendLabel(): string {
    if (this.history.length < 2) {
      return 'Estable';
    }

    const previous = this.history[this.history.length - 2];

    if (this.co2Ppm > previous + 25) {
      return 'Subiendo';
    }

    if (this.co2Ppm < previous - 25) {
      return 'Bajando';
    }

    return 'Estable';
  }

  get plotWidth(): number {
    return this.chartWidth - this.marginLeft - this.marginRight;
  }

  get plotHeight(): number {
    return this.chartHeight - this.marginTop - this.marginBottom;
  }

  private get safeHistory(): readonly number[] {
    if (this.history.length > 0) {
      return this.history;
    }

    return [this.co2Ppm];
  }

  private buildLinePath(history: readonly number[]): string {
    if (history.length === 0) {
      return '';
    }

    return history
      .map((value, index) => {
        const x = this.marginLeft + (index / Math.max(1, history.length - 1)) * this.plotWidth;
        const y = this.toChartY(value);

        return `${index === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
      })
      .join(' ');
  }

  private toChartY(value: number): number {
    const clamped = Math.max(this.minY, Math.min(this.maxY, value));
    const ratio = (clamped - this.minY) / (this.maxY - this.minY);

    return this.marginTop + this.plotHeight - ratio * this.plotHeight;
  }
}