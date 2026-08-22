# Optional Account Portal Setup

The public site does not require authentication. This feature adds optional GitHub sign-in through Azure Static Web Apps built-in authentication and a serverless Azure Functions API under `/api`.

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

## GitHub sign-in

The frontend uses Azure Static Web Apps' built-in GitHub provider:

- `/.auth/login/github?post_login_redirect_uri=/account`
- `/.auth/me`
- `/.auth/logout?post_logout_redirect_uri=/`

First-time GitHub sign-in creates the optional account. No public route is protected.

Google custom authentication is intentionally parked for a future Standard SKU upgrade. Existing Google client settings may remain in Azure, but the provider must not be added to `staticwebapp.config.json` while the app uses the Free SKU.

## Production gates

Before enabling Cosmos persistence for real patients:

- Replace the account-storage and assessment-storage consent copy with Legal-approved wording.
- Confirm DPDP/privacy notice links and consent-retention requirements.
- Confirm clinical approval of assessment risk thresholds and crisis-resource copy.
- Verify the Google Form response endpoint in a non-production environment.
- Configure cost and usage alerts for Cosmos DB.
- Confirm access logs do not include assessment responses, booking messages, or other sensitive values.
