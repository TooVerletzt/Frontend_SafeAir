import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { combineLatest } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardFacade } from '@features/dashboard/application/facades/dashboard.facade';
import { DashboardRoom } from '@features/dashboard/domain/models/dashboard-room.model';
import { DashboardUser } from '@features/dashboard/domain/models/dashboard-user.model';
import { DashboardSidebarComponent } from '@features/dashboard/components/dashboard-sidebar/dashboard-sidebar.component';
import { DashboardTopbarComponent } from '@features/dashboard/components/dashboard-topbar/dashboard-topbar.component';

type ActuatorKey = 'minisplit' | 'purifier' | 'extractor';

interface VisualActuator {
  key: ActuatorKey;
  label: string;
  quantity: number;
  iconOn: string;
  iconOff: string;
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
}

interface UnitControlState {
  on: boolean;
  value: number;
}

@Component({
  selector: 'app-room-control-page',
  standalone: true,
  imports: [CommonModule, DashboardSidebarComponent, DashboardTopbarComponent],
  templateUrl: './room-control-page.component.html',
  styleUrl: './room-control-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoomControlPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly facade = inject(DashboardFacade);
  private readonly destroyRef = inject(DestroyRef);

  user: DashboardUser = {
    displayName: 'Admin',
    statusLabel: 'CONECTADO',
  };

  locationLabel = 'Rooms > Master Suite Emulator';
  room: DashboardRoom | null = null;

  availableActuators: VisualActuator[] = [];
  selectedActuatorKey: ActuatorKey | null = null;

  private readonly unitStates: Record<string, UnitControlState> = {};

  readonly environmentMetrics = [
    {
      title: 'TEMPERATURA',
      value: '22°C',
      status: '↗ Optimal Range',
      icon: 'assets/icons/temperatura.png',
    },
    {
      title: 'HUMEDAD',
      value: '45%',
      status: '≈ Stable',
      icon: 'assets/icons/humedad.png',
    },
    {
      title: 'CO2',
      value: '800 ppm',
      status: '◎ Excellent',
      icon: 'assets/icons/actuador.png',
    },
    {
      title: 'PM2.5',
      value: '25 μg/m³',
      status: '◎ Excellent',
      icon: 'assets/icons/pm.png',
    },
  ];

  ngOnInit(): void {
    combineLatest([this.facade.viewModel$, this.route.paramMap])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(([vm, params]) => {
        this.user = vm.user;
        this.locationLabel = vm.locationLabel;

        const roomId = params.get('id');
        this.room = vm.rooms.find((item) => item.id === roomId) ?? null;

        this.availableActuators = this.room
          ? this.buildAvailableActuators(this.room)
          : [];

        this.ensureSelectedActuator();
        this.ensureUnitStates();
      });
  }

  get selectedActuator(): VisualActuator | null {
    if (!this.selectedActuatorKey) return null;
    return this.availableActuators.find((item) => item.key === this.selectedActuatorKey) ?? null;
  }

  get selectedUnits(): number[] {
    if (!this.selectedActuatorKey) return [];
    const quantity = this.getActuatorQuantity(this.selectedActuatorKey);
    return Array.from({ length: quantity }, (_, index) => index + 1);
  }

  get roomImage(): string {
    return this.room?.controlImageSrc || 'assets/images/3d.png';
  }

  selectActuator(key: ActuatorKey): void {
    this.selectedActuatorKey = key;
  }

  isSelectedActuator(key: ActuatorKey): boolean {
    return this.selectedActuatorKey === key;
  }

  getBadgeIcon(actuator: VisualActuator): string {
    return this.isSelectedActuator(actuator.key) ? actuator.iconOn : actuator.iconOff;
  }

  getPanelTitle(): string {
    switch (this.selectedActuatorKey) {
      case 'minisplit':
        return 'Sistema Minisplit';
      case 'purifier':
        return 'Purificador de Aire';
      case 'extractor':
        return 'Extractor de Aire';
      default:
        return 'Control de Actuadores';
    }
  }

  getPanelIcon(): string {
  switch (this.selectedActuatorKey) {
    case 'minisplit':
      return 'assets/icons/copoon.png';     // <- minisplit
    case 'purifier':
      return 'assets/icons/purifion.png';   // <- purifier
    case 'extractor':
      return 'assets/icons/aireon.png';     // <- extractor
    default:
      return 'assets/icons/actuador.png';
  }
}

  getActuatorSize(type: ActuatorKey): 'small' | 'medium' | 'large' {
    if (!this.room) return 'small';

    switch (type) {
      case 'minisplit':
        return this.room.actuators.minisplit.size;
      case 'purifier':
        return this.room.actuators.purifier.size;
      case 'extractor':
        return this.room.actuators.extractor.size;
    }
  }

  getActuatorQuantity(type: ActuatorKey): number {
    if (!this.room) return 0;

    switch (type) {
      case 'minisplit':
        return Number(this.room.actuators.minisplit.quantity ?? 0);
      case 'purifier':
        return Number(this.room.actuators.purifier.quantity ?? 0);
      case 'extractor':
        return Number(this.room.actuators.extractor.quantity ?? 0);
    }
  }

  sizeLabel(value: 'small' | 'medium' | 'large'): string {
    switch (value) {
      case 'small':
        return 'Tamaño: Small';
      case 'medium':
        return 'Tamaño: Medium';
      case 'large':
        return 'Tamaño: Large';
    }
  }

  unitTitle(index: number): string {
    switch (this.selectedActuatorKey) {
      case 'minisplit':
        return `Minisplit Unidad ${index}`;
      case 'purifier':
        return `Purificador Unidad ${index}`;
      case 'extractor':
        return `Extractor Unidad ${index}`;
      default:
        return `Unidad ${index}`;
    }
  }

  get simpleUnitPlaceholders(): number[] {
  const missingSlots = Math.max(0, 3 - this.selectedUnits.length);
  return Array.from({ length: missingSlots }, (_, index) => index + 1);
}

isUnitOn(index: number): boolean {
  if (!this.selectedActuatorKey) return false;
  return this.getUnitState(this.selectedActuatorKey, index).on;
}

toggleUnit(index: number): void {
  if (!this.selectedActuatorKey) return;

  const key = this.buildUnitKey(this.selectedActuatorKey, index);
  const current = this.unitStates[key] ?? { on: false, value: 24 };

  this.unitStates[key] = {
    ...current,
    on: !current.on,
  };
}

getUnitValue(index: number): number {
  if (!this.selectedActuatorKey) return 24;
  return this.getUnitState(this.selectedActuatorKey, index).value;
}

setUnitValue(index: number, event: Event): void {
  if (!this.selectedActuatorKey) return;

  const target = event.target as HTMLInputElement;
  const key = this.buildUnitKey(this.selectedActuatorKey, index);
  const current = this.unitStates[key] ?? { on: false, value: 24 };

  this.unitStates[key] = {
    ...current,
    value: Number(target.value),
  };
}

areAllSelectedUnitsOn(): boolean {
  if (!this.selectedActuatorKey || this.selectedUnits.length === 0) {
    return false;
  }

  return this.selectedUnits.every((unit) => this.isUnitOn(unit));
}

toggleAllSelected(): void {
  if (!this.selectedActuatorKey) return;

  const shouldTurnOff = this.areAllSelectedUnitsOn();

  for (const unit of this.selectedUnits) {
    const key = this.buildUnitKey(this.selectedActuatorKey, unit);
    const current = this.unitStates[key] ?? { on: false, value: 24 };

    this.unitStates[key] = {
      ...current,
      on: !shouldTurnOff,
    };
  }
}

activateAllSelected(): void {
  this.toggleAllSelected();
}

  private ensureSelectedActuator(): void {
    const selectedStillExists = this.availableActuators.some(
      (item) => item.key === this.selectedActuatorKey,
    );

    if (!selectedStillExists) {
      this.selectedActuatorKey = this.availableActuators[0]?.key ?? null;
    }
  }

  private ensureUnitStates(): void {
    if (!this.room) return;

    const keys: ActuatorKey[] = ['minisplit', 'purifier', 'extractor'];

    for (const key of keys) {
      const quantity = this.getActuatorQuantity(key);

      for (let index = 1; index <= quantity; index++) {
        const stateKey = this.buildUnitKey(key, index);

        if (!this.unitStates[stateKey]) {
          this.unitStates[stateKey] = {
            on: false,
            value: 24,
          };
        }
      }
    }
  }

  private getUnitState(type: ActuatorKey, index: number): UnitControlState {
    const key = this.buildUnitKey(type, index);
    return this.unitStates[key] ?? { on: false, value: 24 };
  }

  private buildUnitKey(type: ActuatorKey, index: number): string {
    return `${type}-${index}`;
  }

 private buildAvailableActuators(room: DashboardRoom): VisualActuator[] {
  const items: VisualActuator[] = [];

  if ((room.actuators.minisplit.quantity ?? 0) > 0) {
    items.push({
      key: 'minisplit',
      label: 'Sistema Minisplit',
      quantity: room.actuators.minisplit.quantity,
      iconOn: 'assets/icons/copoon.png',
      iconOff: 'assets/icons/copooff.png',
      top: '14px',
      right: '18px',
    });
  }

  if ((room.actuators.purifier.quantity ?? 0) > 0) {
    items.push({
      key: 'purifier',
      label: 'Purificador de Aire',
      quantity: room.actuators.purifier.quantity,
      iconOn: 'assets/icons/purifion.png',
      iconOff: 'assets/icons/purifioff.png',
      bottom: '18px',
      left: '18px',
    });
  }

  if ((room.actuators.extractor.quantity ?? 0) > 0) {
    items.push({
      key: 'extractor',
      label: 'Extractor de Aire',
      quantity: room.actuators.extractor.quantity,
      iconOn: 'assets/icons/aireon.png',
      iconOff: 'assets/icons/aireoff.png',
      bottom: '18px',
      right: '18px',
    });
  }

  return items;
}
}