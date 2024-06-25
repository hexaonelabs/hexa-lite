import { IonText } from '@ionic/react';
import styles from './CheckIcon.module.scss';

export const CheckIcon = (props: {message?: string}) => {
  return (<>
  <svg
      width="115px"
      height="115px"
      viewBox="0 0 133 133"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g
          id={styles.check__group}
          stroke="none"
          strokeWidth="4"
          fill="none"
          fillRule="evenodd"
      >
              <circle
              id="filled__circle"
              fill="var(--ion-color-success)"
              cx="66.5"
              cy="66.5"
              r="54.5"
          />
          <circle
              id={styles.white__circle}
              fill="var(--ion-background-color)"
              cx="66.5"
              cy="66.5"
              r="55.5"
          />
          <circle
              id={styles.outline__circle}
              stroke="var(--ion-color-success)"
              strokeWidth="4"
              cx="66.5"
              cy="66.5"
              r="54.5"
          />
          <polyline
              id={styles.check__icon}
              stroke="var(--ion-background-color)"
              strokeWidth="6.5"
              points="41 70 56 85 92 49"
          />
      </g>
    </svg>
    {props.message && (<>
      <div className="ion-text-center">
        <IonText color="success">
          <p>{props.message}</p>
        </IonText>
      </div>
    </>)}
  </>)
}