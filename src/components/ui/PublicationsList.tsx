import { getPublications } from "@/servcies/medium.service";
import { IonButton, IonCol, IonImg, IonSpinner, IonText } from "@ionic/react";
import { useEffect, useState } from "react";

type Publication = {
  url: string;
  title: string;
  imgUrl: string;
  dateTime: number;
  short: string;
};
export const PublicationsList = () => {
  const [publications, setPublications] = useState<Publication[]>([]);

  useEffect(() => {
    getPublications().then((result) => setPublications(() => result));
  }, []);

  return publications.length <= 0 ? (
    <IonSpinner />
  ) : (
    <>
      {publications.map((p) => (
        <IonCol 
          size="12"
          size-md="6" 
          size-lg="3" 
          className="ion-padding ion-text-start PublicationItem"
          onClick={() => window.open(p.url, "_blank")}
        >
          <IonImg src={p.imgUrl} />
          <IonText>
            <h3>{p.title.replace('Hexa Lite:', '')}</h3>
          </IonText>
          <IonText color="medium">
            <p>{p.short.slice(0, 150)}... <small><IonText color="primary">[read more]</IonText></small></p>
          </IonText>
        </IonCol>
      ))}
      <IonCol 
          size="12"
          className="ion-padding ion-text-ccenter">
            <IonText>
              <IonButton 
                fill="clear"
                href="https://medium.com/@hexaonelabs">
                SEE ALL ARTICLES  
              </IonButton> 
            </IonText>
      </IonCol>
    </>
  );
};
