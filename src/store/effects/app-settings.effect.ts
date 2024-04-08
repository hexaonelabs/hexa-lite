import { patchAppSettings } from "../actions";

export const initializeAppSettings = async () => {
  const settings = localStorage.getItem('hexa-lite_app_settings');
  if (settings) {
    try {
      const parsedSettings = JSON.parse(settings);
      patchAppSettings(parsedSettings);
    } catch (error) {
      throw new Error('Failed to parse app settings');
    }
  }
}