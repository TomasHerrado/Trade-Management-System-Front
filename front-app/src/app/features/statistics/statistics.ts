import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppStateService } from '../../core/services/app-state';
import { StatisticsService } from '../../core/services/statistics';
import { Statistics, PaymentTypeCode } from '../../core/models/statistics.model';

interface LinePoint {
  x: number;
  y: number;
  label: string;
  total: number;
}

interface DonutSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
  dasharray: string;
  dashoffset: string;
}

interface BarItem {
  label: string;
  sublabel?: string;
  value: number;
  barPercent: number;
}

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics.html',
})
export class StatisticsPage implements OnInit {
  private svc  = inject(StatisticsService);
  appState     = inject(AppStateService);

  stats   = signal<Statistics | null>(null);
  loading = signal(true);
  error   = signal('');

  topProductsMode = signal<'quantity' | 'revenue'>('quantity');

  private readonly paymentLabels: Record<PaymentTypeCode, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    TRANSFER: 'Transferencia',
    MIXED: 'Mixto',
    ACCOUNT: 'Cuenta corriente',
  };

  private readonly paymentColors: Record<PaymentTypeCode, string> = {
    CASH: '#10b981',
    CARD: '#6366f1',
    TRANSFER: '#0ea5e9',
    ACCOUNT: '#f59e0b',
    MIXED: '#f43f5e',
  };

  // ── Evolución de ventas (línea, 12 meses) ──────────────────────────
  readonly chartWidth   = 600;
  readonly chartHeight  = 180;
  private readonly chartPadding = 24;

  linePoints = computed<LinePoint[]>(() => {
    const data = this.stats()?.salesEvolution ?? [];
    if (data.length === 0) return [];
    const max = Math.max(...data.map(d => d.total), 1);
    const usableWidth = this.chartWidth - this.chartPadding * 2;
    const stepX = data.length > 1 ? usableWidth / (data.length - 1) : 0;
    return data.map((d, i) => {
      const x = this.chartPadding + i * stepX;
      const y = this.chartHeight - this.chartPadding
              - (d.total / max) * (this.chartHeight - this.chartPadding * 2);
      return { x, y, label: d.label, total: d.total };
    });
  });

  linePath = computed(() => {
    const pts = this.linePoints();
    if (pts.length === 0) return '';
    return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  });

  areaPath = computed(() => {
    const pts = this.linePoints();
    if (pts.length === 0) return '';
    const base = this.chartHeight - this.chartPadding;
    const first = pts[0];
    const last = pts[pts.length - 1];
    return `M ${first.x.toFixed(1)} ${base} ` +
           pts.map(p => `L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') +
           ` L ${last.x.toFixed(1)} ${base} Z`;
  });

  showLineLabel(index: number): boolean {
    const total = this.linePoints().length;
    if (total <= 6) return true;
    return index % 2 === 0 || index === total - 1;
  }

  // ── Top productos (barras horizontales) ────────────────────────────
  topProducts = computed<BarItem[]>(() => {
    const s = this.stats();
    if (!s) return [];
    const byQty = this.topProductsMode() === 'quantity';
    const list = byQty ? s.topProductsByQuantity : s.topProductsByRevenue;
    const max = Math.max(...list.map(p => byQty ? p.quantity : p.revenue), 1);
    return list.map(p => ({
      label: p.productName,
      sublabel: p.variantName && p.variantName !== 'DEFAULT' ? p.variantName : undefined,
      value: byQty ? p.quantity : p.revenue,
      barPercent: (byQty ? p.quantity : p.revenue) / max * 100,
    }));
  });

  // ── Ventas por sucursal (barras horizontales) ───────────────────────
  branchBars = computed<BarItem[]>(() => {
    const list = this.stats()?.salesByBranch ?? [];
    const max = Math.max(...list.map(b => b.total), 1);
    return list.map(b => ({
      label: b.branchName,
      value: b.total,
      barPercent: b.total / max * 100,
    }));
  });

  // ── Ventas por forma de pago (dona) ────────────────────────────────
  private readonly donutRadius = 40;
  private readonly circumference = 2 * Math.PI * this.donutRadius;

  paymentSegments = computed<DonutSegment[]>(() => {
    const list = this.stats()?.salesByPaymentType ?? [];
    const total = list.reduce((sum, p) => sum + p.total, 0);
    if (total <= 0) return [];
    let offset = 0;
    return list.map(p => {
      const percent = (p.total / total) * 100;
      const length = (percent / 100) * this.circumference;
      const segment: DonutSegment = {
        label: this.paymentLabels[p.paymentType] ?? p.paymentType,
        value: p.total,
        percent,
        color: this.paymentColors[p.paymentType] ?? '#6366f1',
        dasharray: `${length.toFixed(2)} ${(this.circumference - length).toFixed(2)}`,
        dashoffset: `${(-offset).toFixed(2)}`,
      };
      offset += length;
      return segment;
    });
  });

  paymentTotal = computed(() => (this.stats()?.salesByPaymentType ?? []).reduce((s, p) => s + p.total, 0));

  ngOnInit(): void {
    const cId = this.appState.commerce()?.id;
    if (!cId) { this.loading.set(false); return; }
    this.loading.set(true);
    this.svc.getByCommerce(cId).subscribe({
      next: d => { this.stats.set(d); this.loading.set(false); },
      error: e => {
        this.error.set(e.error?.message ?? 'No se pudieron cargar las estadísticas');
        this.loading.set(false);
      },
    });
  }
}