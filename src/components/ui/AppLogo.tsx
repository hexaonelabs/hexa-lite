import { IonIcon, IonImg } from "@ionic/react";
import React, { useEffect, useMemo, useRef, useState } from "react";

const styleLogo = {
  padding: " 0px",
  width: "42px",
  maxWidth: "42px",
  height: "42px",
  cursor: "pointer",
};

export const AppLogo = (props: {
  width?: string;
  height?: string;
  handleClick?: () => void;
  style?: any;
}) => {
  const {
    handleClick,
    height = styleLogo.height,
    width = styleLogo.width,
    style,
  } = props;

  return (
    <>
      <div
        className="AppLogo"
        style={{
          position: "relative",
          display: "inline-block",
          ...style,
          minHeight: height,
          minWidth: width
        }}
        onClick={handleClick}
      />
      {/* <IonIcon
        style={{
          // marginRight: "0.25rem",
          // fontSize: " 0.8rem",
          minHeight: height,
          minWidth: width,
          fontSize: '42px'
        }}
        color="dark"
        src={"./assets/images/logo-uncolored.svg"}
      /> */}
    </>
  );
};
