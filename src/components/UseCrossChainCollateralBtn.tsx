import React from "react";
import { IonButton, IonText } from "@ionic/react";

interface UseCrossChaineCollateralButtonProps {
  userSummaryAndIncentivesGroup: Array<{ totalCollateralUSD?: string }>;
  onlyText?: boolean;
  dismissPromptCrossModal: () => void;
}

export const UseCrossChaineCollateralButton: React.FC<
  UseCrossChaineCollateralButtonProps
> = ({ userSummaryAndIncentivesGroup, onlyText, dismissPromptCrossModal }) => {
  const totalCollateral =
    userSummaryAndIncentivesGroup
      ?.map((summary) => Number(summary?.totalCollateralUSD || 0))
      .reduce((a, b) => a + b, 0) || 0;

  if (totalCollateral <= 0) {
    return null;
  }

  if (onlyText) {
    <IonText color="primary" style={{ display: "block", cursor: "pointer" }}>
      <small onClick={() => dismissPromptCrossModal()}>
        or use cross-chain collateral
      </small>
    </IonText>;
  }

  return (
    <IonButton
      expand="block"
      fill="outline"
      color="primary"
      onClick={() => dismissPromptCrossModal()}
    >
      Use cross-chain collateral
    </IonButton>
  );
};

