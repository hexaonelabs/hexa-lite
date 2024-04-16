import styles from './CrossIcon.module.scss';

export const CrossIcon = (props: {message: string}) => {
  return (
    <>
      <svg
        className={styles.cross__svg}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 52 52"
      >
        <circle className={styles.cross__circle} cx="26" cy="26" r="25" fill="none" />
        <path
          className={styles.cross__path + ' ' + styles.cross__path__right}
          fill="none"
          d="M16,16 l20,20"
        />
        <path
          className={styles.cross__path + ' ' + styles.cross__path__right}
          fill="none"
          d="M16,36 l20,-20"
        />
      </svg>
      <p className={styles.cross__message}>{props.message}</p>
    </>
  );
};
