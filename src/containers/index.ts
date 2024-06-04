
import { lazy } from "react";

export const LeaderboardContainer = lazy(() => import("@/containers/desktop/LeaderboardContainer"));
export const WalletDesktopContainer = lazy(() => import("@/containers/desktop/WalletDesktopContainer"));
export const SwapContainer = lazy(() => import("@/containers/desktop/SwapContainer"));
export const DefiContainer = lazy(() => import("@/containers/desktop/DefiContainer"));
export const EarnContainer = lazy(() => import("@/containers/desktop/EarnContainer"));
export const AvailablePlatformsContainer = lazy(() => import("@/containers/desktop/AvailablePlatformsContainer"));
export const AboutContainer = lazy(() => import("@/containers/desktop/AboutContainer"));
export const BuyWithFiatContainer = lazy(() => import("@/containers/BuyWithFiat"));
export const WalletMobileContainer = lazy(
  () => import("@/containers/mobile/WalletMobileContainer")
);
export const WelcomeMobileContainer = lazy(
  () => import("@/containers/mobile/WelcomeMobileContainer")
  );
export const MagicMigrationContainer = lazy(()=> import('@/containers/MagicMigrationContainer'))
