import { LiFiWidget } from "@lifi/widget";
import dynamic from "next/dynamic";

export const LiFiWidgetDynamic = dynamic(
  () => import('@lifi/widget').then((module) => module.LiFiWidget) as any,
  {
    ssr: false,
  },
) as typeof LiFiWidget;