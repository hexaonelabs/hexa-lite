import { isPlatform } from "@ionic/react";

export const isMobilePWADevice =
localStorage.getItem("hexa-lite_is-pwa") ||
Boolean(isPlatform("pwa")) ||
Boolean(isPlatform("electron")) ||
Boolean(isPlatform("mobile")) || 
Boolean(isPlatform("mobileweb"));
