import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { toggleDarkPalette } from '@app/app.utils';

bootstrapApplication(AppComponent, appConfig)
.then(()=> {
  // Use localstorage to check if the user has already set a preference
  const theme = localStorage.getItem('theme');
  if (theme) {
    toggleDarkPalette(theme === 'dark');
  }
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
  if (!theme) toggleDarkPalette(prefersDark.matches);
  // Use matchMedia to check the user preference
  // Listen for changes to the prefers-color-scheme media query
  prefersDark.addEventListener('change', (mediaQuery) => toggleDarkPalette(mediaQuery.matches));
})
  .catch((err) => console.error(err));
