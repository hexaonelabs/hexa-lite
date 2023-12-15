declare namespace NodeJS {
  export interface ProcessEnv {
    readonly NEXT_PUBLIC_APP_ONBOARD_APIKEY: string;

    readonly NEXT_PUBLIC_APP_ANKR_APIKEY: string;

    readonly NEXT_PUBLIC_APP_VERSION: string;

    readonly NEXT_PUBLIC_APP_BUILD_DATE: string;

    readonly NEXT_PUBLIC_APP_IS_PROD: string;
  }
}