# Zannypay — A PalmPay-style Mobile Wallet

A polished React Native (Expo) fintech app: wallet balance, bank transfers, bill/airtime
payments, invoicing, virtual cards, rewards, analytics, transaction history, PIN + biometric
login, and onboarding — connected to a real backend API over HTTPS.

## ⚠️ Important: what this is and isn't

The UI, navigation, and wallet logic in this app talk to a real backend endpoint
(`EXPO_PUBLIC_API_URL`, defaulting to `https://zannypay-backend.onrender.com/api/v1`) for
authentication, balance, and transactions. If that backend isn't deployed/running yet, auth
calls will fail — this app is the front-end half of a real product, not a mocked demo.

A few screens are still intentionally front-end-only placeholders until their backend
counterparts exist:
- **Virtual Card** (`CardScreen.js`) shows a static demo card number — wire it up to your card
  issuance provider (e.g. Sudo Africa, Union54) before relying on it for real transactions.
- **Developer Console** (`DeveloperConsoleScreen.js`) shows illustrative logs and a generated
  key string for UI purposes — it is not connected to any real API-key or webhook system yet.
- **Rewards** (`RewardsScreen.js`) tracks daily check-in points locally per-device/per-user via
  AsyncStorage — move this server-side if points should be redeemable for real value.

To take this to a fully licensed, live money-moving product you'd still need, in rough order:

1. **A business entity** and, depending on your country, a money-transmitter/e-money license
   (or partner with someone who already holds one).
2. **A licensed payment gateway** as your rails — e.g. Paystack or Flutterwave (Nigeria/Africa),
   Stripe (US/EU). Both offer free sandbox/test-mode accounts.
3. **KYC/AML** — identity verification (BVN/NIN checks in Nigeria, or ID verification services
   elsewhere) before letting users hold/move real balances.
4. **Security hardening** — the backend should never trust client-submitted balances; rate
   limiting, fraud monitoring, and a security audit before handling real funds.

## Tech stack

- **Expo (React Native, SDK 54)** — cross-platform, works in Snack or on-device via Expo Go.
- **React Navigation** — stack + bottom tabs.
- **A real backend API** (NestJS-shaped responses assumed) for auth, wallet balance, and
  transactions, called from `src/services/apiClient.js`.
- **AsyncStorage** — local cache/offline-first layer, so the app is usable and shows the last
  known balance/history even with no connection.
- **expo-secure-store** — JWT auth token storage, and (optionally) an on-device PIN used only
  to unlock biometric login.
- **expo-local-authentication** — Face ID / Touch ID / fingerprint login.
- **expo-linear-gradient**, **@expo/vector-icons** — the visual polish.

## Offline behavior

If a transfer or bill payment is submitted with no connection, `apiClient.js`:
1. Queues the exact request in `SyncEngine` (backed by AsyncStorage) so it can be replayed
   automatically the next time the app opens with connectivity.
2. Offers an immediate USSD dial-code fallback so the user isn't blocked right now.

## Running it — free options

### Option A: Expo Snack (fastest, zero install)
1. Go to https://snack.expo.dev
2. Create a new Snack, then delete its default files.
3. Recreate this folder structure inside Snack (upload each file's content — Snack supports
   multi-file projects and folders).
4. Add the dependencies listed in `package.json` via Snack's "Add dependency" search.
5. Preview live on the Snack web player, or scan the QR with the **Expo Go** app on your phone.

> Snack note: `app.json` intentionally has no `owner` field and no `extra.eas.projectId` —
> both break Snack's import/bundling. If you need EAS builds later (outside Snack), add
> `extra.eas.projectId` back with value `34764801-f60a-4128-b8a0-393da61c1d35`, and set
> `owner` to your Expo account username.

### Option B: On-device via Userland + Expo Go
1. Inside Userland (Ubuntu), install Node.js (v18+) and npm.
2. `npm install -g expo-cli` (or just use `npx expo`).
3. Copy this whole `zannypay` folder into your Userland filesystem.
4. `cd zannypay && npm install`
5. `npx expo start --tunnel` (tunnel mode avoids local network/firewall issues from Userland).
6. Install **Expo Go** from the Play Store on the same phone, scan the QR code shown in the
   terminal.

### Option C: Full local dev later (more resources)
Same as Option B minus `--tunnel` — use `--lan` or plain `npx expo start` on the same Wi-Fi.

## Project structure

```
zannypay/
├── App.js                          # entry point, ErrorBoundary + offline sync kickoff
├── app.json                        # Expo config (no owner/eas fields — see Snack note above)
├── assets/                         # app icon, splash, adaptive icon, favicon
├── package.json
├── src/
│   ├── context/WalletContext.js    # auth + wallet state, talks to apiClient
│   ├── services/
│   │   ├── apiClient.js            # HTTP calls to the backend, USSD fallback, offline queue
│   │   ├── SyncEngine.js           # persists + replays requests made while offline
│   │   └── SecureStorage.js        # encrypted on-device storage (biometric PIN unlock)
│   ├── navigation/AppNavigator.js
│   ├── screens/
│   │   ├── SplashScreen.js, OnboardingScreen.js
│   │   ├── SignupScreen.js, LoginScreen.js      # PIN pad + biometric unlock
│   │   ├── DashboardScreen.js                   # home/wallet, pull-to-refresh
│   │   ├── TransferScreen.js, BillsScreen.js, InvoiceScreen.js
│   │   ├── CardScreen.js, AnalyticsScreen.js, RewardsScreen.js
│   │   ├── HistoryScreen.js, TransactionDetailScreen.js
│   │   ├── ProfileScreen.js, SupportScreen.js, DeveloperConsoleScreen.js
│   ├── components/                 # Card, GradientButton, TransactionRow, FundModal, ErrorBoundary
│   ├── theme/colors.js              # single source of truth for brand colors
│   └── utils/                       # formatting + storage helpers
```

## What to change first when you're ready to go further

1. Deploy the real backend at the URL in `EXPO_PUBLIC_API_URL` (or point it at yours) with
   `/auth/signup`, `/auth/login`, `/user/me`, `/transactions/transfer`, `/transactions/bills`,
   and `/transactions/fund` endpoints.
2. Replace the client-side PIN check assumption with server-side hashed-PIN or OTP verification
   — the client should never be the source of truth for whether a PIN is correct.
3. Connect `CardScreen.js` to a real virtual card issuance API.
4. Add a real KYC step to `SignupScreen.js` before activating a wallet.

## Branding note

This is intentionally **not** branded as "PalmPay" (name/logo) to avoid trademark issues —
it's called "Zannypay" as a placeholder. Swap in your own name, logo, and color palette in
`src/theme/colors.js`, `app.json`, and `assets/`.
