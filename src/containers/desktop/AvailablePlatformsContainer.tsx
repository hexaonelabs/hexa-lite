import { InstallPWASteps } from "@/components/ui/InstallPWASteps";
import { IonAvatar, IonBackButton, IonButton, IonButtons, IonCol, IonContent, IonGrid, IonHeader, IonIcon, IonModal, IonPage, IonRow, IonText, IonToolbar, isPlatform } from "@ionic/react";
import { logoTwitter } from "ionicons/icons";
import { useState } from "react";

export default function AvailablePlatformsContainer() {
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

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
      <IonHeader translucent={true}>
        <IonToolbar style={{'--background': 'transparent'}}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="index" text={''} />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen={true} className="ion-no-padding">
     
          <IonGrid
            className="ion-no-padding ion-padding-top"
            style={{maxWidth: '1024px', margin: '1rem auto 4rem'}}
          >
            <IonRow className="ion-margin-vertical ion-padding-top ion-padding-horizontal ion-align-items-center ion-justify-content-center">
              <IonCol
                size="12"
                class="ion-text-center ion-margin-top ion-padding-top"
              >
                <img 
                  src="./assets/images/responsive_undraw.svg" 
                  alt="all devices"
                  style={{margin: '1rem 0rem 2rem', maxHeight: '50vh'}}/>
                <IonText color="dark">
                  <h1 className="ion-margin-top">
                    Available on Web, iOS, Android and Desktop
                  </h1>
                </IonText>
                <IonText color="medium">
                  <p>
                    Access Hexa Lite seamlessly across all your devices. Whether you're on the go with your smartphone, at your desk with your desktop computer, or relaxing at home with your tablet, our platform is available on iOS, Android, and Desktop, ensuring you never miss a beat in managing your decentralized finances
                  </p>
                </IonText>
              </IonCol>
              <IonCol size="12" className="ion-text-center ion-margin-top">
                <IonButton 
                  color="gradient"
                  className="ion-padding-horizontal"
                  onClick={()=> setIsInstallModalOpen(true)}>
                  iOS & Android install
                </IonButton>
                <IonButton 
                  onClick={()=> window.open('https://github.com/hexaonelabs/hexa-lite', '_blanck')} 
                  className="ion-padding-horizontal"
                  color="gradient">
                  Desktop download
                </IonButton>
              </IonCol>
            </IonRow>

          </IonGrid>
      </IonContent>

      <IonModal
        isOpen={isInstallModalOpen}
        onDidDismiss={()=> setIsInstallModalOpen(false)}
        className="modalAlert"
      >
        <InstallPWASteps setIsInstallModalOpen={setIsInstallModalOpen} />
      </IonModal>
    </IonPage>
  );
}