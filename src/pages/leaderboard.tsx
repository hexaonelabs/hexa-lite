"use client";
import React, { useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  setupIonicReact,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonText,
  IonAvatar,
  IonImg,
  IonSkeletonText,
} from "@ionic/react";
import dynamic from "next/dynamic";
import { StatusBar, Style } from "@capacitor/status-bar";
import { FooterComponent } from "@/components/FooterComponent";
import { getReadableValue } from "@/utils/getReadableValue";
import { getLeaderboardDatas } from "@/servcies/datas.service";

interface LeaderboardData {
  leaderboardData: { address: string; points: number }[];
}

const Leaderboard: React.FC = () => {
  const [datas, setDatas] = React.useState<{address: string; totalPoints: string;}[]|null>(null);
  useEffect(() => {
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addListener(async (status) => {
        console.log(
          `[INFO] Dark mode is ${status.matches ? "enabled" : "disabled"}`
        );
        try {
          await StatusBar.setStyle({
            style: status.matches ? Style.Dark : Style.Light,
          });
        } catch {}
      });
  }, []);
  useEffect(() => {
    getLeaderboardDatas()
    .then((response) => {
        if (response?.data) {
          setDatas(()=> response.data);
        } else {
          setDatas(()=> []);
        }
    })
    .catch((error) => {});
  }, []);
  return (
    <IonPage>
      <IonContent className="leaderboardPage ion-no-padding ">
     
          <IonGrid
            className="ion-no-padding ion-padding-top"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: " space-between",
            }}
          >
            <IonRow className="ion-margin-vertical ion-padding-top ion-padding-horizontal">
              <IonCol
                sizeSm="12"
                sizeMd="8"
                offsetMd="2"
                sizeLg="4"
                offsetLg="4"
                class="ion-text-center ion-margin-top ion-padding-top"
              >
                <a href="/" >
                  <IonImg
                    style={{
                      width: "124px",
                      height: "124px",
                      margin: "auto",
                    }}
                    src={"./assets/images/logo.svg"}
                  ></IonImg>
                </a>
                  <div className="ion-padding-vertical ">
                    <IonText>
                      <h1>Leaderboard</h1>
                      <p>
                        <small>
                          The leaderboard is based on the amount of points you
                          have earned by using the dApp. 
                          The more points you have, the higher you
                          are on the leaderboard.
                        </small>
                      </p>
                    </IonText>
                  </div>
              </IonCol>
              <IonCol
                className="ion-text-center"
                size="12"
                sizeMd="8"
                offsetMd="2"
                sizeLg="4"
                offsetLg="4"
              >
                
                  <IonList
                    className="ion-margin-top "
                    style={{
                      borderRadius: "32px",
                    }}
                  >
                    <IonItem
                      lines="none"
                      style={{
                        "--background": "rgba(var(--ion-color-light-rgb), 0.95)",
                      }}
                    >
                      <IonText color="medium" slot="start">
                        <small>Rank</small>
                      </IonText>
                      <IonText color="medium" slot="start">
                        <small>Address</small>
                      </IonText>
                      <IonText color="medium" slot="end">
                        <small>Points</small>
                      </IonText>
                    </IonItem>
                    {datas === null && (
                      <IonItem
                        lines="none"
                        style={{
                          "--background":
                            "rgba(var(--ion-color-light-rgb), 0.05)",
                        }}
                      >
                        <IonSkeletonText
                          animated
                          style={{
                            width: "100%",
                            display: "inline-block",
                            margin: "1.5rem 0"
                          }} />
                      </IonItem>
                    )}
                    {datas !== null && datas.map((entry, index) => (
                      <IonItem
                        key={index}
                        style={{
                          "--background":
                            "rgba(var(--ion-color-light-rgb), 0.05)",
                        }}
                      >
                        <IonAvatar
                          slot="start"
                          style={{
                            fontSize: index <= 2 ? "1.8rem" : "1rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: "bold",
                          }}
                        >
                          {index === 0 && <>🥇</>}
                          {index === 1 && <>🥈</>}
                          {index === 2 && <>🥉</>}
                          {index > 2 && <IonText>{index + 1}</IonText>}
                        </IonAvatar>
                        <IonLabel>
                          <h2>{entry.address}</h2>
                        </IonLabel>
                        <pre slot="end">{getReadableValue(entry.totalPoints)}</pre>
                      </IonItem>
                    ))}
                  </IonList>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol>
                <IonButton
                  color="gradient"
                  expand="block"
                  fill="clear"
                  size="small"
                  routerLink="/"
                  routerDirection="back"
                >
                  back to dApp
                </IonButton>
              </IonCol>
            </IonRow>
            {/* Footer Section */}
            <FooterComponent />
          </IonGrid>
      </IonContent>
    </IonPage>
  );
};

setupIonicReact({ mode: "ios" });

const LeaderboardDynamic = dynamic(() => Promise.resolve(Leaderboard), {
  ssr: false,
});

export default LeaderboardDynamic;
