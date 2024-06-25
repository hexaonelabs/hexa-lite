import { IonButton, IonButtons } from "@ionic/react";
import {
  ColorType,
  IChartApi,
  ISeriesApi,
  LineStyle,
  LineType,
  SeriesMarker,
  Time,
  createChart,
} from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

export interface DataItem {
  time: string|number;
  value: number;
}
type SerieIntervalType = "1D" | "1W" | "1M" | "1Y";
export type SeriesData = Map<SerieIntervalType, DataItem[]>;
export type SeriesMarkerData = Map<SerieIntervalType, SeriesMarker<Time>[]>;

export default function LightChart(props: {
  data?: DataItem[];
  seriesData?: SeriesData;
  markers?: SeriesMarkerData;
  interval?: "1D"|"1W"|"1M"|"1Y";
  handleChartEvent?: ({
    action,
    payload,
  }: {
    action: string;
    payload: unknown;
  }) => any;
  minHeight?: number;
}) {
  const { seriesData, data, interval, markers, handleChartEvent } = props;
  const chartContainerRef = useRef(null);
  const chartRef = useRef<IChartApi | null>(null);
  const [chartSeries, setChartSeries] = useState<
    ISeriesApi<"Line" | "Area", any>
  >(null as any);
  const [currentInterval, setcurrentInterval] =
    useState<SerieIntervalType>(interval || "1M");

  const setChartInterval = (interval: SerieIntervalType) => {
    if (!chartSeries) throw new Error("chartSeries not initialized");
    const value = data ? data : seriesData?.get(interval);
    if (!value)
      throw new Error("Serie value not found for this interval: " + interval);
    if (!chartRef.current) throw new Error("Chart not initialized");
    // set value & options
    chartSeries.setData(value);
    chartSeries.applyOptions({
      topColor: "rgba(0,144,255, 0.618)",
      lineStyle: LineStyle.Solid,
      lineType: LineType.Simple,
      bottomColor: "rgba(0,144,255, 0.01)",
      lineColor: "rgba(0,144,255, 1)",
      lineWidth: 3,
      baseLineWidth: 3,
    });
    // markers
    const markerValue = markers?.get(interval);
    if (chartSeries && markerValue) {
      
      chartSeries.setMarkers(markerValue);
    }
    chartRef.current.timeScale().fitContent();
    setcurrentInterval(interval);
  };

  useEffect(() => {
    if (
      chartContainerRef.current &&
      ((data?.length || 0) > 0 || (seriesData?.size || 0) > 0)
    ) {
      console.log(data);
      // remove the chart if it already exists
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }

      // create a new chart
      const chart = createChart(chartContainerRef.current, {
        width: window.innerWidth || 400,
        height: props?.minHeight || 250,
        layout: {
          background: {
            type: ColorType.Solid,
            color: "transparent",
          },
          textColor: "#d1d4dc",
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
      // store the chart instance in the ref
      chartRef.current = chart;
      // subscribe to event mouse move
      if (handleChartEvent) {
        chart.subscribeCrosshairMove((param) => {
          if (
            param.point === undefined ||
            !param.time ||
            param.point.x < 0 ||
            param.point.y < 0
          ) {
            handleChartEvent({ action: "leave", payload: undefined });
          } else {
            const dateStr = new Date(param.time.toString()).toDateString();
            const data = param.seriesData.get(series) as DataItem;
            const price = data.value;
            handleChartEvent({ action: "move", payload: { dateStr, price } });
            // console.log();
          }
        });
      }

      const series = chart.addAreaSeries();
      setChartSeries(series);

      // if (markers && series) {

      //   series.setMarkers(markers);
      // }
    }
    // clean up the chart when the component is unmounted
    return () => {
      if (chartRef.current) {
        // chartRef.current.unsubscribeCrosshairMove();
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, seriesData]);

  useEffect(() => {
    if (!chartSeries || !chartRef.current) return () => {};
    setChartInterval(interval||currentInterval);
    chartRef.current?.timeScale().fitContent();
  }, [chartSeries, chartRef.current, interval || currentInterval]);

  return (
    <>
      <div ref={chartContainerRef} />
      {(seriesData?.size || 0) > 1 && !interval? (
        <div className="ion-padding">
          <IonButtons>
            {["1D", "1W", "1M", "1Y"].map((interval: any, index: number) => (
              <IonButton
                key={index}
                color="primary"
                fill="solid"
                disabled={currentInterval === interval}
                onClick={() => setChartInterval(interval)}
              >
                <small>{interval}</small>
              </IonButton>
            ))}
          </IonButtons>
        </div>
      ) : null}
    </>
  );
}
