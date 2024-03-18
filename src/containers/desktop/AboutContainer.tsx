import { IonAvatar, IonButton, IonCol, IonContent, IonGrid, IonIcon, IonPage, IonRow, IonText } from "@ionic/react";
import { logoTwitter } from "ionicons/icons";

export function AboutContainer() {

  const teams = [
    {
      avatar: '',
      name: 'Fazio Nicolas',
      sumbStatus: 'Founder',
      post: 'Chief Executive Officer',
      links: [
        {
          icon: logoTwitter,
          url: './assets/images/0xFazio.jpeg'
        }
      ]
    }
  ]
  return (
    <IonPage>
      <IonContent className="ion-no-padding ">
     
          <IonGrid
            className="ion-no-padding ion-padding-top"
            style={{
              display: "flex",
              flexDirection: "column",
              height: "100%",
              justifyContent: " space-between",
            }}
          >
            <IonRow className="ion-margin-vertical ion-padding-top ion-padding-horizontal ion-align-items-center ion-justify-content-center">
              <IonCol
                sizeSm="12"
                sizeMd="5"
                sizeLg="5"
                sizeXl="5"
                class="ion-text-start ion-margin-top ion-padding-top"
              >
                <IonText color="dark">
                  <h1>
                    Built by the community, for the community
                  </h1>
                </IonText>
                <IonText color="medium">
                  <p>
                    Our mission is developing products and services that reduce friction and growth web3 adoption.
                  </p>
                </IonText>
              </IonCol>
              <IonCol
                sizeSm="12"
                sizeMd="7"
                sizeLg="7"
                sizeXl="7"
                class="ion-text-start ion-margin-top ion-padding-top"
              >
                image
              </IonCol>
            </IonRow>

            <IonRow className="ion-margin-vertical ion-padding-top ion-padding-horizontal ion-align-items-center ion-justify-content-center">
              <IonCol
                size="12"
                class="ion-text-start ion-margin-top ion-padding-top"
              >
                <IonText color="dark">
                  <h1>
                    Meet the team
                  </h1>
                </IonText>
              </IonCol>
              {teams.map(t => (
                <IonCol
                  sizeSm="12"
                  sizeMd="6"
                  sizeLg="4"
                  sizeXl="4"
                  class="ion-margin-top ion-padding-top ion-text-center"
                >
                  <IonAvatar>
                    <img src={t.avatar} alt={t.name} />
                  </IonAvatar>
                  <IonText>
                    <h3>
                      {t.name}<br/>
                      <small>{t.sumbStatus}</small>
                    </h3>
                  </IonText>
                  <IonText>
                    <p>
                      {t.post}
                    </p>
                  </IonText>
                  {t.links.map(l => (
                    <IonButton fill="clear" onClick={()=> window.open(l.url, '_blank')}>
                      <IonIcon icon={l.icon} />
                    </IonButton>
                  ))}
                </IonCol>
              ))}
            </IonRow>
          </IonGrid>
        </IonContent>
      </IonPage>
  );
}