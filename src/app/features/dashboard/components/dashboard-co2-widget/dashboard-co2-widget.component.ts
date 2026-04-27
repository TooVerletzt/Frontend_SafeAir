import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { DecimalPipe, NgFor, NgIf } from '@angular/common';

interface ChartTick {
  readonly value: number;
  readonly y: number;
  readonly showLabel: boolean;
}

interface ChartXTick {
  readonly label: string;
  readonly x: number;
}

@Component({
  selector: 'sa-dashboard-co2-widget',
  standalone: true,
  imports: [DecimalPipe, NgFor, NgIf],
  templateUrl: './dashboard-co2-widget.component.html',
  styleUrl: './dashboard-co2-widget.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardCo2WidgetComponent {
  @Input({ required: true }) co2Ppm = 500;
  @Input({ required: true }) history: readonly number[] = [];

  readonly chartWidth = 320;
  readonly chartHeight = 170;
  private readonly minY = 0;
  private readonly maxY = 1000;
  private readonly marginTop = 8;
  private readonly marginRight = 6;
  private readonly marginBottom = 24;
  private readonly marginLeft = 24;

  readonly yTicks: readonly ChartTick[] = Array.from({ length: 6 }, (_, index) => {
    const value = index * 200;
    return {
      value,
      y: this.toChartY(value),
      showLabel: true,
    };
  });

  readonly xTicks: readonly ChartXTick[] = [
    { label: 'Hace 1 min', x: this.marginLeft },
    { label: '40 s', x: this.marginLeft + this.plotWidth * 0.33 },
    { label: '20 s', x: this.marginLeft + this.plotWidth * 0.66 },
    { label: 'Ahora', x: this.marginLeft + this.plotWidth },
  ];

  get linePath(): string {
    return this.buildLinePath(this.history);
  }

  get areaPath(): string {
    if (this.history.length === 0) {
      return '';
    }

    return `${this.linePath} L ${this.marginLeft + this.plotWidth} ${this.marginTop + this.plotHeight} L ${this.marginLeft} ${this.marginTop + this.plotHeight} Z`;
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

  private get plotWidth(): number {
    return this.chartWidth - this.marginLeft - this.marginRight;
  }

  private get plotHeight(): number {
    return this.chartHeight - this.marginTop - this.marginBottom;
  }

  private toChartY(value: number): number {
    const clamped = Math.max(this.minY, Math.min(this.maxY, value));
    const ratio = (clamped - this.minY) / (this.maxY - this.minY);
    return this.marginTop + this.plotHeight - ratio * this.plotHeight;
  }
}
