declare namespace NodeJS {
  export interface ProcessEnv {
    /**
     * API Key for the Onboard API
     * @deprecated
     */
    readonly NEXT_PUBLIC_APP_ONBOARD_APIKEY: string;

    /**
     * API Key for the Ankr API
     * @description Use this key to access the Ankr API 
     * to get user EVM Assets List
     */
    readonly NEXT_PUBLIC_APP_ANKR_APIKEY: string;

    /**
     * APP Version 
     */
    readonly NEXT_PUBLIC_APP_VERSION: string;

    /**
     * APP Build Date
     */
    readonly NEXT_PUBLIC_APP_BUILD_DATE: string;

    /**
     * APP Environment Production enabled
     */
    readonly NEXT_PUBLIC_APP_IS_PROD: string;

    /**
     * APP Environment is Offline. 
     * @description This is used for development purposes. 
     * If this is enabled, the app will not make any API calls and 
     * will use the mock data instead.
     */
    readonly NEXT_PUBLIC_APP_IS_LOCAL: string;

    /**
     * API Key for the Zerion API
     * @description Use this key to access the Zerion API
     * to get User EVM Wallet History transactions
     */
    readonly NEXT_PUBLIC_APP_ZERION_APIKEY: string;

    /**
     * API Key for the Coingecko API
     * @description Use this key to access the Coingecko API
     * to get the latest token prices
     */
    readonly NEXT_PUBLIC_APP_COINGECKO_APIKEY: string;

    /**
     * FIREBASE Configurations for the Firebase SDK
     * @description Following are the configurations required for the Firebase SDK
     */
    readonly NEXT_PUBLIC_APP_FIREBASE_APIKEY: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_AUTHDOMAIN: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_PROJECTID: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_STORAGEBUCKET: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_MESSAGINGSENDERID: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_APPID: string;
    readonly NEXT_PUBLIC_APP_FIREBASE_DATABASEURL: string;

  }
}