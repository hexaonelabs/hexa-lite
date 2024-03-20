import { getContributors } from "@/servcies/github.service";
import {
  IonAvatar,
  IonBackButton,
  IonButton,
  IonButtons,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonIcon,
  IonPage,
  IonRow,
  IonText,
  IonToolbar,
} from "@ionic/react";
import { logoGithub, logoTwitter } from "ionicons/icons";
import { useEffect, useState } from "react";

type Team = {
  avatar: string;
  name: string;
  subStatus: string;
  post: string;
  links: {
    icon: string;
    url: string;
  }[];
};

export default function AboutContainer() {
  const [teams, setTeam] = useState<Team[]>([]);

  const mainTeams: Team[] = [
    {
      avatar: "./assets/images/0xFazio.jpeg",
      name: "FazioNico",
      subStatus: "Founder",
      post: "Chief Executive Officer",
      links: [
        {
          icon: logoTwitter,
          url: "https://x.com/0xFazio",
        },
      ],
    },
  ];

  useEffect(() => {
    getContributors("hexaonelabs", "hexa-lite")
      .then((contributors) => {
        return contributors.map((c) => {
          const main = mainTeams.find(
            (t) => c.login.toLowerCase() === t.name.toLowerCase()
          );

          return main
            ? {
                avatar: c.avatar_url,
                subStatus: main.subStatus,
                post: main.post,
                links: [
                  ...main.links,
                  {
                    icon: logoGithub,
                    url: c.html_url,
                  },
                ],
                name: main.name,
              }
            : ({
                avatar: c.avatar_url,
                name: c.login,
                subStatus: "Github contributor",
                post: "Developper",
                links: [
                  {
                    icon: logoGithub,
                    url: c.html_url,
                  },
                ],
              } as Team);
        });
      })
      .then((teamData) => {
        setTeam(() => teamData);
      });
    return () => setTeam([]);
  }, []);

  return (
    <IonPage>
      <IonHeader translucent={true}>
        <IonToolbar style={{ "--background": "transparent" }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="index" text={""} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true} className="ion-no-padding">
        <IonGrid
          className="ion-no-padding ion-padding-top"
          style={{ maxWidth: "1024px", margin: "3rem auto 0rem" }}
        >
          <IonRow
            className="ion-margin-top ion-padding-top ion-padding-horizontal ion-align-items-center ion-justify-content-center"
            style={{ minHeight: "70vh" }}
          >
            <IonCol
              size="12"
              class="ion-text-center ion-margin-top ion-padding-top"
            >
              {/* <img 
                  src="./assets/images/undraw_code_typing.svg" 
                  alt="all devices"
                  style={{margin: '1rem 0rem 2rem', maxHeight: '50vh'}}/> */}
              <IonIcon
                icon={logoGithub}
                style={{ margin: "1rem 0rem 2rem", fontSize: "30vh" }}
              />
              <IonText color="dark">
                <h1 className="ion-margin-top">
                  Build by the community, for the community
                </h1>
              </IonText>
              <IonText color="medium">
                <p>
                  Hexa Lite is build by the main team of{" "}
                  <IonText color="primary">
                    <a
                      style={{ textDecoration: "none" }}
                      rel="noopener"
                      href="https://hexaonelabs.com"
                      target="_blank"
                    >
                      HexaOne Labs
                    </a>
                  </IonText>
                  , a Swiss-based organization focused on innovation in the
                  decentralized finance sector. Our mission is straightforward:
                  to make DeFi accessible to everyone by developing products and
                  services that reduce friction and growth web3 adoption
                </p>
              </IonText>
            </IonCol>
          </IonRow>
        </IonGrid>
        <IonGrid className="ion-no-padding">
          <IonRow
            className="ion-padding-top ion-padding-horizontal ion-align-items-center ion-justify-content-center"
            style={{
              minHeight: "80vh",
              background: "#182449",
              boxShadow:
                "0px -60px 60px 0px rgba(var(--ion-color-primary-rgb), 0.15)",
            }}
          >
            <IonCol
              size="12"
              class="ion-text-center ion-margin-top ion-padding-top"
            >
              <IonText color="dark">
                <h1>Meet the main team</h1>
              </IonText>
            </IonCol>
            {teams.map((t, index) => (
              <IonCol
                key={index}
                sizeXs="12"
                sizeSm="12"
                sizeMd="6"
                sizeLg="4"
                sizeXl="4"
                class="ion-margin-top ion-padding-top ion-text-center"
              >
                <IonAvatar
                  style={{
                    width: "132px",
                    height: "132px",
                    margin: "auto",
                    border: "solid 4px var(--ion-color-primary)",
                  }}
                >
                  <img src={t.avatar} alt={t.name} />
                </IonAvatar>
                <IonText>
                  <h3>
                    {t.name}
                    <br />
                    <small>{t.subStatus}</small>
                  </h3>
                </IonText>
                <IonText>
                  <p className="ion-no-margin">{t.post}</p>
                </IonText>
                {t.links.map((l, i) => (
                  <IonButton
                    key={i}
                    fill="clear"
                    onClick={() => window.open(l.url, "_blank")}
                  >
                    <IonIcon color="dark" icon={l.icon} />
                  </IonButton>
                ))}
              </IonCol>
            ))}
            <IonCol
              size="12"
              className="ion-text-center ion-margin-bottom ion-padding-bottom"
            >
              <IonButton
                color="gradient"
                onClick={() =>
                  window.open(
                    "https://github.com/hexaonelabs/hexa-lite/pulls",
                    "_blanck"
                  )
                }
              >
                Become a contributor
              </IonButton>
              <IonText color="medium">
                <p className="ion-no-margin">
                  <small>by opening a pull request</small>
                </p>
              </IonText>
            </IonCol>

            <IonCol
              size="12"
              class="ion-text-center ion-padding-top"
              style={{ margin: "4rem auto 0" }}
            >
              <IonGrid style={{ background: "rgba(0, 0, 0, 0.5)" }}>
                <IonRow
                  className="ion-text-start ion-align-items-center"
                  style={{ margin: "auto", maxWidth: "1024px" }}
                >
                  <IonCol className="ion-padding">
                    <IonText color="dark">
                      <h1>Be a part of Gouvernance</h1>
                    </IonText>
                    <IonText color="primary">
                      <p>
                        To participate in governance using Snapshot, follow
                        these simple steps
                      </p>
                    </IonText>
                  </IonCol>
                  <IonCol size="auto" className="ion-padding">
                    <ul style={{ listStyle: "decimal", padding: "3rem 1rem" }}>
                      <li>
                        Visit the{" "}
                        <IonText color="primary">
                          <a
                            style={{ textDecoration: "none" }}
                            rel="noopener"
                            href="https://snapshot.org/#/hexaonelabs.eth"
                            target="_blank"
                          >
                            Snapshot
                          </a>
                        </IonText>{" "}
                        platform
                      </li>
                      <li>Connect your wallet</li>
                      <li>Browse through the listed proposals</li>
                      <li>
                        Cast your vote on the proposals that align with your
                        vision
                      </li>
                    </ul>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
}
