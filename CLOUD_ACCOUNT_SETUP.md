# Account and cloud sync setup

The app uses Firebase Authentication (email and password) and Cloud Firestore. The app keeps its existing local copy and syncs each of the 270 grade sections into a separate, user-owned Firestore document. Firestore rules restrict each account to its own data. Firebase web configuration is public client configuration; never put a service-account key or Admin SDK secret in the website.

## Create and configure the Firebase project

1. Sign in to [Firebase Console](https://console.firebase.google.com/) with your Google account and create a project.
2. Add a **Web app** to that project. Copy its web configuration into `firebase-config.js`, replacing the four `YOUR_...` placeholders.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. Create a **Cloud Firestore** database.
5. Publish the contents of `firestore.rules` in **Firestore → Rules**. These rules only allow a signed-in user to read and write documents under their own UID.
6. Add the deployed app's domain to **Authentication → Settings → Authorized domains** (if it is not already listed).
7. Deploy the updated static app. Account creation, sign-in, password reset, and automatic cloud sync will then be available.

## Existing local data

When you create your first account, the app uploads non-empty local sections that are not yet in the account. On a device where that account already has cloud data, cloud sections are loaded and missing local sections are uploaded. If the app detects different local data for a section that already exists in the cloud, it saves a local pre-sync copy in browser storage before loading the cloud version.

Without a Firebase project configured, the account controls explain that setup is required; all current local saving continues to work. Account creation requires an internet connection. Once signed in, local changes are still stored by the app and sync when connectivity returns.

## Firebase plan

Firebase's Spark plan includes no-cost quotas for Firestore and Authentication. The app performs an initial read of the user's saved sections and writes a section after changes; usage above free quotas may require upgrading. Review current quotas and billing in Firebase before enabling the service for many users.
