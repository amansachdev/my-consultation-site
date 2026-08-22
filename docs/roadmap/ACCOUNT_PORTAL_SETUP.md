# Optional Account Portal Setup

The public site does not require authentication. This feature adds optional Google sign-in through Firebase Authentication and a serverless Azure Functions API under `/api`.

## Azure application settings

Configure these settings on the Antaran Static Web App. Do not commit values to the repository.

```text
COSMOS_DB_ENDPOINT=https://<account>.documents.azure.com:443/
COSMOS_DB_KEY=<cosmos-key>
COSMOS_DB_DATABASE=antaran
GOOGLE_FORM_RESPONSE_URL=https://docs.google.com/forms/d/e/<form-id>/formResponse
```

Example CLI shape:

```bash
az staticwebapp appsettings set \
  --name <static-web-app-name> \
  --resource-group <resource-group> \
  --setting-names \
    COSMOS_DB_ENDPOINT="https://<account>.documents.azure.com:443/" \
    COSMOS_DB_KEY="<cosmos-key>" \
    COSMOS_DB_DATABASE="antaran" \
    GOOGLE_FORM_RESPONSE_URL="https://docs.google.com/forms/d/e/<form-id>/formResponse"
```

## Cosmos DB containers

Create these containers in the `antaran` database before enabling persistence:

| Container | Partition key | Purpose |
|-----------|---------------|---------|
| `profiles` | `/userId` | Patient profile data |
| `bookingRequests` | `/userId` | Signed-in booking requests and statuses |
| `assessments` | `/userId` | Explicitly consented PHQ-9/GAD-7 responses and scores |
| `consents` | `/userId` | Consent version and timestamp records |

Use a serverless Cosmos DB account and an India region for production patient data, subject to the final hosting decision in `Q-TECH-07`.

## Firebase Google sign-in

Create a Firebase Web App in the Google Cloud/Firebase project and enable Google under Authentication > Sign-in method. Add these values as GitHub Actions secrets so the Vite build can initialize Firebase:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

Add `antaran.online` and the Azure Static Web Apps hostname to Firebase Authentication > Settings > Authorized domains. First-time Google sign-in creates the optional account. No public route is protected.

The API verifies Firebase ID tokens with these Azure Static Web App settings:

- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY` (service-account private key; preserve newlines as `\\n` in the setting)

Never expose the Firebase Admin service-account key in frontend code or GitHub Actions logs.

## Production gates

Before enabling Cosmos persistence for real patients:

- Replace the account-storage and assessment-storage consent copy with Legal-approved wording.
- Confirm DPDP/privacy notice links and consent-retention requirements.
- Confirm clinical approval of assessment risk thresholds and crisis-resource copy.
- Verify the Google Form response endpoint in a non-production environment.
- Configure cost and usage alerts for Cosmos DB.
- Confirm access logs do not include assessment responses, booking messages, or other sensitive values.
