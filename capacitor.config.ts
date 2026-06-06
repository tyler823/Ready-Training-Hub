import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  // DEV: This is a placeholder. Confirm/replace with the real bundle identifier you
  // register in the Apple Developer portal and Google Play Console (reverse-DNS, e.g.
  // 'app.readytraining' or 'com.yourcompany.readytraining'). It must match across iOS,
  // Android, Firebase app registration, and App Check provider setup.
  appId: 'app.readytraining',

  appName: 'Ready Training',

  // DEV — webDir is the folder Capacitor copies into the native app as the bundled web
  // assets. There is NO build step in this repo: the site is plain static files served
  // from the repo root. If you bundle (recommended below), point webDir at the folder
  // that contains the app's entry page (platform.html) plus app.js, styles.css, sw.js,
  // manifest.json. The repo root currently serves that role, so '.' works, but you will
  // likely want to copy the needed files into a clean 'www/' folder so you are not
  // shipping the marketing pages and blog inside the binary. See HANDOFF.md → "Entry
  // point" and "Bundle vs. server.url".
  webDir: '.',

  // ---------------------------------------------------------------------------------
  // BUNDLE vs. REMOTE (server.url) — pick ONE strategy. See HANDOFF.md for the full
  // tradeoff. Leaving server.url commented out = BUNDLE mode (assets shipped in the
  // binary, served from the capacitor:// origin). Uncomment to load the LIVE site
  // instead (thin remote wrapper). NOTE: a bare remote wrapper risks Apple Guideline
  // 4.2 "minimum functionality" rejection — ship native features (push notifications)
  // regardless of which mode you choose.
  // ---------------------------------------------------------------------------------
  // server: {
  //   url: 'https://readytraining.app',
  //   cleartext: false
  // },

  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      backgroundColor: '#0a0118'
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    }
  }
};

export default config;
