import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input } from '@angular/core';
import {
  ColorType,
  IChartApi,
  LineSeries,
  createChart,
} from 'lightweight-charts';

@Component({
  standalone: true,
  selector: 'app-chart',
  template: `
    <div class="row">
      <div class="col">
        <h1 class="ion-no-margin ion-padding-top">
          {{ price | currency : 'USD' }}
        </h1>
        <p class="ion-no-margin">
          <span *ngIf="symbol">{{ symbol | uppercase }} </span>
          <small> {{ time }} </small>
        </p>
      </div>
      <ng-content></ng-content>
    </div>
    <div id="chart"></div>
  `,
  styles: [
    `
      :host {
        display: block;
        width: 100%;

        div#chart {
          height: 400px;
        }

        .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: var(--ion-text-color);
        }
      }
    `,
  ],
  imports: [CommonModule],
})
export class ChartComponent {
  public price = 0;
  public time = new Date().toLocaleString();
  @Input() currentPrice = 0;
  @Input() symbol?: string;
  @Input() color: string = '#d1d4dc';

  @Input() set data(data: number[]) {
    if (this.chartElement) {
      this.chartElement.remove();
    }
    if (!this._elementRef.nativeElement) {
      return;
    }
    const el = this._elementRef.nativeElement.querySelector(
      'div#chart'
    ) as HTMLDivElement;
    if (!el) {
      return;
    }

    this.chartElement = createChart(el, {
      width: 800,
      height: 400,
      layout: {
        background: {
          type: ColorType.Solid,
          color: 'transparent',
        },
        textColor: this.color,
      },
      grid: {
        vertLines: {
          visible: false,
        },
        horzLines: {
          // color: 'rgba(42, 46, 57, 0.05)',
          visible: false,
        },
      },
      rightPriceScale: {
        borderVisible: false,
        visible: false,
      },
      timeScale: {
        borderVisible: false,
        visible: false,
      },
      crosshair: {
        horzLine: {
          // visible: false,
          style: 4,
        },
      },
      autoSize: true,
      handleScroll: false,
      handleScale: false,
    });
    function formatDataForChart(
      data: number[]
    ): { time: number; value: number }[] {
      const interval = 1000 * 60 * 30; // Intervalle de 30 minutes en millisecondes
      const startTime = Date.now() - interval * (data.length - 1);

      return data.map((value, index) => {
        const time = new Date(startTime + interval * index).getTime();
        return { time, value };
      });
    }
    const formattedData = formatDataForChart(data);
    const lineSeries = this.chartElement.addSeries(LineSeries);
    lineSeries.setData(
      // loop through the data array and return an object with the time property
      // base on past 7 days starting from now with 30 minutes interval
      formattedData as any
    );
    //  manage legend
    const updateLegend = (param: any) => {
      this.time = param.time
        ? new Date(param.time).toLocaleString()
        : new Date().toLocaleString();
      this.price =
        param.time &&
        (param.seriesData as Map<any, any>).get(lineSeries)?.value !== undefined
          ? (param.seriesData as Map<any, any>).get(lineSeries)?.value
          : this.currentPrice || data?.[data.length - 1] || 0;
    };
    this.chartElement.subscribeCrosshairMove(updateLegend);
    // use setTimeout to handle input value from other component input
    setTimeout(() => {
      this.price = this.currentPrice || data[data.length - 1] || 0;
    });
  }
  public chartElement!: IChartApi;

  constructor(private readonly _elementRef: ElementRef<HTMLElement>) {}
}
