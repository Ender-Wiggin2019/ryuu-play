// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

const apiUrl = typeof window !== 'undefined'
  ? window.location.origin
  : 'http://127.0.0.1:12021';

export const environment = {
  apiUrl,
  timeout: 5000,
  production: false,
  apiVersion: 4,
  defaultPageSize: 50,
  allowServerChange: true,
  refreshTokenInterval: 60 * 60 * 1000,
  enableImageCache: false,
  defaultLanguage: 'zh',
  languages: { en: 'English', zh: '中文' }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
