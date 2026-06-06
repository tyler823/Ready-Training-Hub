# Ready Training — Native App Handoff Brief

This document is for the developer who will wrap the existing Ready Training web app
with **Capacitor** and publish it to the **Apple App Store** and **Google Play**.

The web app is already live and must keep working unchanged. Your job is the native
shell + the store submissions. Nothing in this repo requires a web build step — it is
plain static HTML/CSS/JS.

---

## a. App + stack overview

**Hosting:** Static site on **GitHub Pages**, custom domain **readytraining.app**
(`CNAME` file). `_redirects` is a leftover Netlify-style file; the live host is GitHub
Pages.

**Files (what each is):**

| File | Role |
|------|------|
| `platform.html` | **THE APP.** ~640 KB. Title "Ready \| Training Platform". Contains the login/signup overlay, all training modules, quizzes, dashboards. This is what an authenticated user uses day to day. |
| `index.html` | **Marketing homepage.** Title "Ready - Train Your Restoration Crew to Win". Public landing/sales page. |
| `app.js` | All app logic (~325 KB): Firebase init, App Check, Memberstack auth gating, Firestore progress sync, quizzes, upgrade modal. |
| `styles.css` | App styles. |
| `sw.js` | Service worker (network-first, offline fallback). |
| `manifest.json` | PWA manifest (currently `start_url: "/"`). |
| `help-center.html`, `privacy-policy.html`, `terms-of-service.html`, `blog-*.html`, `blog/` | Static content/marketing pages. |

**Stack:**
- **Auth/membership:** Memberstack v2 (loaded via `<script>` in `platform.html`).
- **Database:** Firebase **Firestore** (compat SDK 10.8.0 via gstatic CDN).
- **Bot protection:** Firebase **App Check** with **reCAPTCHA v3** (monitoring only).
- **CSS:** **Tailwind via CDN** (`https://cdn.tailwindcss.com` in `platform.html`) — no
  local Tailwind build.
- No bundler, no framework, no build step. Everything loads from CDNs + static files.

---

## b. Recommended entry point

The installed native app should open to the **product/login page — `platform.html`**,
**not** the marketing homepage (`index.html`). Someone who downloaded the app from a
store wants the product, not the sales pitch.

- `platform.html` already shows a login/signup overlay when no member is present, and
  `app.js` redirects unauthenticated users to `https://readytraining.app`. (See the
  Memberstack gotcha below — that redirect needs review for the webview.)
- The existing `manifest.json` uses `start_url: "/"` (homepage) for the PWA, but it also
  defines a shortcut to `/platform.html`. For the native app, target `platform.html`.

**DEV to confirm:** entry page = `platform.html`.

---

## c. Bundle vs. `server.url` decision

Capacitor can run in two modes. Choose one in `capacitor.config.ts`.

**1. Bundle mode (server.url left commented out) — RECOMMENDED**
- Web assets are copied into the app binary (`webDir`) and served from the
  `capacitor://` / `https://localhost` native origin.
- Pros: works offline, faster first paint, app isn't a blank screen if the site is down,
  reads more like a "real app" to reviewers.
- Cons: you must re-sync and resubmit to ship web changes; **third-party origins
  (Memberstack, Firestore, App Check, Tailwind CDN) must explicitly allow the native
  origin** (see gotchas).
- If you bundle, copy only the needed files into a clean `www/` folder (`platform.html`,
  `app.js`, `styles.css`, `sw.js`, `manifest.json`, icons) and point `webDir` there —
  don't ship the marketing/blog pages inside the binary.

**2. Remote mode (`server.url: 'https://readytraining.app'`)**
- The webview just loads the live site.
- Pros: web changes ship instantly, no resubmission, origin matches the existing site so
  Memberstack/Firebase "just work."
- Cons: no offline; **a bare website wrapper is the #1 cause of App Store rejection.**

**Apple Guideline 4.2 ("minimum functionality"):** Apple rejects apps that are just a
repackaged website with no native value. **Regardless of which mode you choose, add at
least one genuine native feature — push notifications — so the app clears 4.2.** (Status
bar theming, splash screen, and deep links help too.)

**Recommendation:** Bundle mode with a dedicated `www/` folder **+ push notifications**.
You get offline support and native value while keeping the live site as the source of
truth for content you choose to load remotely.

**DEV to confirm:** bundle vs. `server.url`.

---

## d. Integration gotchas you MUST handle

### Memberstack (auth) — domain-bound
- App ID: `app_cmli7jujr01wd0ss1bjvffot9`
- Custom Memberstack domain in use: `https://memberstack-client.readytraining.app`
- Memberstack scripts are loaded in `platform.html`; login/signup/Google-OAuth and the
  upgrade flow all go through `window.$memberstackDom`.
- **Memberstack is domain-bound.** In a native webview the page origin is NOT
  `readytraining.app` — it's `capacitor://localhost` (iOS) / `https://localhost`
  (Android) in bundle mode. You must **add the Capacitor app origin(s) to Memberstack's
  allowed/authorized domains**, or auth calls will be rejected.
- **Verify inside the webview:** email/password login, signup, **Google OAuth login**
  (`loginWithProvider({ provider: 'google' })` — OAuth redirects often break in webviews;
  may need the in-app browser / `@capacitor/browser` or a deep-link return), and the
  **post-login redirect** behavior. Note `app.js` redirects unauthenticated users to
  `https://readytraining.app` — decide whether that should stay or route to a bundled
  login view. Cookies/redirects are the usual failure points.

### Firestore — no Firebase Auth
- Project: `ready-training-hub` (config in `app.js` top). Firestore compat SDK 10.8.0.
- **Keep `experimentalForceLongPolling: true`** (set in `app.js`:
  `db.settings({ experimentalForceLongPolling: true, experimentalAutoDetectLongPolling: false })`).
  This is what makes Firestore work reliably in restricted/webview network environments —
  do not remove it.
- Data path: `companies/{companyCode}/members/{memberId}` (progress, certs, roles).
- **There is NO Firebase Auth.** Identity comes from Memberstack, not Firebase, so in
  Firestore security rules **`request.auth` is `null`.** Rules are currently permissive
  to allow this. Don't write native code assuming a Firebase user exists.
- Ensure the native app origin is **authorized** in Firebase (Firestore is origin/App
  Check gated, see below).

### App Check — current provider is WEB-ONLY
- Current setup (`app.js`): `firebase.appCheck().activate('6LcrMoEsAAAAAC_N03emlSYAUcbFLkaOT_qNHBVO', true)`
  — that's the **reCAPTCHA v3 site key**, with auto-refresh on.
- **reCAPTCHA v3 is web-only. It does not work in native iOS/Android apps.**
- Native apps require platform attestation providers:
  - **iOS:** App Attest (or DeviceCheck) — register the app in Firebase, enable the
    provider, wire `AppCheck` in native/JS for the native target.
  - **Android:** Play Integrity — register the app's SHA-256 signing key in Firebase,
    enable the provider.
- **Enforcement is currently OFF (monitoring mode)** in the Firebase console, so the
  native app will NOT be blocked today even with the wrong provider. **But before anyone
  turns enforcement ON, the native App Check providers must be set up**, or the native
  app's Firestore calls will start getting rejected.

### Subscriptions — do NOT use in-app purchase
- Upgrades/subscriptions are handled by **Memberstack → Stripe** web checkout. In
  `app.js`, `handleUpgrade()` calls `window.$memberstackDom.openPlans()` /
  `openAccount()` (fallback opens `https://readytraining.app`).
- Plan IDs (for reference / gating in `app.js`):
  - Solo: `pln_ready-solo-4845d0ug3`
  - Team: `pln_ready-team-o41x001dz`
  - Pro/Coaching (Enterprise): `pln_ready-pro-coaching-kr45e0udm`
  - (`data-ms-membership` attributes in `platform.html` use `ready-solo`, `ready-team`,
    `ready-pro`.)
- **Do NOT route this through Apple/Google in-app purchase.** It's a multi-platform web
  subscription. Instead, open the upgrade/subscribe/checkout CTAs in the **EXTERNAL
  system browser** (use `@capacitor/browser`'s `Browser.open(...)`, not the in-app
  webview), per the stores' external-purchase rules.
- The business is **US-based**, where external purchase links are currently permitted.
  Store-side, **register Apple's External Purchase Link entitlement** and follow Google
  Play's external-offers / link-out requirements. Make sure upgrade buttons in the
  webview are intercepted and handed to the external browser.

### Push notifications (native value + engagement)
- Add `@capacitor/push-notifications` and wire **APNs (iOS)** + **FCM (Android)**. Since
  the project already uses Firebase, **FCM is the natural choice** (project
  `ready-training-hub`, `messagingSenderId: 789732882977`). This is also what satisfies
  Apple Guideline 4.2 (see section c).

### Service worker (`sw.js`)
- The site registers a network-first service worker that precaches `/platform.html` and
  falls back to it offline. It explicitly skips Memberstack requests.
- **Verify it doesn't interfere when assets are served from the native origin.** Service
  worker scope/paths (`/platform.html`, `/`) assume a root web origin. In bundle mode the
  origin and base path differ — the SW may double-cache against Capacitor's own caching
  or serve stale assets. Test offline + update behavior; consider disabling/scoping the
  SW for the native build if it conflicts.

### Standard native setup
- App icons (all required sizes), splash screen (`@capacitor/splash-screen`; bg `#0a0118`
  preset in config), status bar styling (`@capacitor/status-bar`; theme `#7c3aed`), safe
  areas / notch handling (CSS `env(safe-area-inset-*)`), and deep links / Universal Links
  + Android App Links for `readytraining.app` (also helps OAuth return flows).

---

## e. Exact commands the dev runs

> macOS + Xcode required for iOS. Android needs Android Studio + JDK.

```bash
# 1. Install JS dependencies (creates package-lock.json; does not touch native)
npm install

# 2. Add native platforms (generates ios/ and android/)
npx cap add ios
npx cap add android

# 3. Copy web assets + plugins into the native projects
npx cap sync

# 4. Open the native IDEs
npx cap open ios       # Xcode
npx cap open android   # Android Studio
```

Then, **on the developer's own machine** (not in this environment):
- **iOS:** in Xcode set signing team + bundle ID, add capabilities (Push Notifications,
  App Attest), build, archive, and submit via **App Store Connect**. Register the
  External Purchase Link entitlement.
- **Android:** in Android Studio set the application ID + signing config, register the
  SHA-256 in Firebase (Play Integrity), build a signed AAB, and submit via **Play
  Console**.

---

## f. Decisions for the dev to confirm

1. **Bundle identifier (`appId`)** — currently placeholder `app.readytraining` in
   `capacitor.config.ts`. Pick the real reverse-DNS ID and use it consistently across
   iOS, Android, Firebase, and App Check.
2. **`webDir` vs. `server.url`** — bundle the assets (recommended, use a clean `www/`
   folder) or load the live site remotely. Set/uncomment in `capacitor.config.ts`.
3. **Entry point** — confirm the app opens to `platform.html` (the product/login), not
   `index.html` (marketing).

---

## Files added in this handoff (new files only)

- `package.json` — Capacitor + plugin dependencies (name `ready-training`).
- `capacitor.config.ts` — `appId`, `appName`, `webDir` (commented guidance), commented
  `server.url` option.
- `.gitignore` — ignores `node_modules/`; note on committing `ios/`/`android/`.
- `HANDOFF.md` — this brief.

**No existing web file was modified** (`platform.html`, `index.html`, `app.js`,
`styles.css`, `sw.js`, `manifest.json` are untouched). The live GitHub Pages site is
unaffected.
