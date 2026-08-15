# Regulatory & Compliance Notes — India

> **This is not legal advice.** It is a technical checklist of frameworks that are likely to apply to a Pan-India telepsychiatry/telemedicine platform. A qualified Indian healthcare lawyer should review the final Terms, Privacy Policy, consent flows, and prescription policy before launch.

## Scope

- Adults 18+ in India.
- Psychiatry, psychology/therapy, and related mental-health services delivered via telemedicine.
- Initially one clinician; architecture must support onboarding of multiple registered professionals.

---

## Key frameworks

| Framework | Relevance to platform |
|-----------|----------------------|
| **Telemedicine Practice Guidelines, 2020** (Board of Governors / NMC) | Defines how teleconsultation can be conducted, consent, identification, prescribing, and documentation. |
| **National Medical Commission (NMC) Act / MCI norms** | Clinicians must be registered with NMC/state medical councils. |
| **Drugs and Cosmetics Act, 1940 & Rules** | Governs what can be prescribed, especially via telemedicine. |
| **NDPS Act, 1985** | Prohibits prescribing/scheduling of narcotic/psychotropic substances outside strict controls. |
| **DPDP Act, 2023** (awaiting full rules) | Personal data protection, consent, data principal rights, data fiduciary obligations, grievance. |
| **IT Act, 2000 (as amended)** | Reasonable security practices, SPDI Rules 2011 (until DPDP rules replace them), intermediary/grievance obligations. |
| **Clinical Establishments (Registration and Regulation) Act, 2010** | State-level registration may be required depending on operating entity and state. |
| **Mental Healthcare Act, 2017** | Rights of persons with mental illness, advance directives, nominated representatives, emergency detention rules. |
| **State telemedicine/health policies** | Some states have additional registration or operational requirements. |

---

## Telemedicine Practice Guidelines — architectural implications

1. **Patient identification and registration**
   - Capture name, age, address, email, phone, and any ID the clinician requires.
   - Verify mobile/email; age gate for 18+.

2. **Informed consent**
   - Consent must be obtained before any teleconsultation.
   - Consent to technology limitations, emergency protocols, and data use.

3. **Clinician identification**
   - Store registration number, qualifications, and contact details.
   - Verify credentials before allowing a clinician to take appointments.

4. **Mode of consultation**
   - Video is the preferred mode for first consultations; follow-ups may use video/audio/chat per guidelines.
   - The system should record mode used.

5. **Prescribing rules**
   - No prescription without a real-time consultation in most cases.
   - List O medicines may be prescribed in first consult; List A medicines only in follow-up; List B medicines generally not allowed via telemedicine.
   - **Do not** allow prescribing Schedule X / NDPS-controlled substances through the platform.
   - Prescriptions must include clinician name, registration number, patient details, date, diagnosis, medicines, dosage, and instructions.

6. **Documentation**
   - Maintain records of each consultation, consent, prescription, and communication.
   - Allow audit trails and restricted access.

---

## Data protection / DPDP Act 2023 — architectural implications

1. **Consent**
   - Explicit, informed, granular consent for data collection and processing.
   - Consent for each purpose: registration, clinical records, video, payment, marketing, analytics.
   - Easy withdrawal mechanism.

2. **Data minimization and purpose limitation**
   - Collect only what is needed.
   - Do not use health data for unrelated purposes (e.g., ads).

3. **Data principal rights**
   - Right to access, correction, erasure (where permissible), grievance redressal.
   - Build self-service flows and admin tools for these requests.

4. **Data security**
   - Encryption at rest and in transit.
   - Access controls, audit logs, breach notification process.

5. **Data localization**
   - Keep critical personal and health data in India.
   - Choose cloud regions and providers accordingly.

6. **Grievance officer**
   - Display contact details; implement ticketing workflow.

---

## Compliance checklist for engineering

Use this as a build checklist, not a substitute for legal review.

### Identity & access
- [ ] Patient age gate (18+).
- [ ] Mobile/email verification.
- [ ] Clinician credential verification (registration number, degree, KYC).
- [ ] Role-based access control (patient, clinician, admin, super-admin).
- [ ] MFA for clinicians and admins.
- [ ] Password policy and secure credential storage.

### Consent & transparency
- [ ] Terms of Use, Privacy Policy, and Consent forms reviewed by a lawyer.
- [ ] Granular consent capture at registration and before each major action.
- [ ] Consent withdrawal flow.
- [ ] Clear emergency disclaimer on every relevant screen.

### Clinical safety
- [ ] No autonomous diagnosis by software.
- [ ] Validated scales used only as decision-support.
- [ ] Risk-screening flow before every consult.
- [ ] Emergency referral directory and escalation workflow.
- [ ] Controlled-substance prescribing blocked.
- [ ] Prescription template includes required fields.

### Data security & privacy
- [ ] TLS 1.2+ everywhere.
- [ ] Database encryption at rest.
- [ ] Field-level encryption for highly sensitive fields if warranted.
- [ ] Encrypted backups with separate keys.
- [ ] Secure file upload (type/size limits, virus scanning, encryption).
- [ ] Audit logs for all access to PHI and clinical records.
- [ ] Data-retention and deletion schedules implemented.
- [ ] Breach-response runbook and notification process.

### Payments & records
- [ ] GST-compliant invoices if registered.
- [ ] Payout ledger and commission calculations auditable.
- [ ] Refund workflow aligned with published policy.

### Operations
- [ ] Grievance officer contact published.
- [ ] Support ticket workflow.
- [ ] Restricted admin access to clinical records.
- [ ] Regular security reviews and penetration testing.

---

## Open regulatory questions

| ID | Question | Owner | Status |
|----|----------|-------|--------|
| REG-01 | Final operating entity and state clinical-establishment registration | Legal / Admin | Open |
| REG-02 | Exact prescription policy and List A/B/O classification in the system | Clinician / Legal | Open |
| REG-03 | Data-retention periods for medical records and audit logs | Legal | Open |
| REG-04 | Grievance officer and response timeline commitments | Legal / Admin | Open |
| REG-05 | DPDP consent-manager wording and withdrawal flow | Legal | Open |
| REG-06 | Whether the platform needs to register as an intermediary under IT Rules | Legal | Open |

---

## Recommended next step

Engage a healthcare/technology lawyer in India to review the architecture plan, draft Terms & Privacy Policy, define the prescription policy, and confirm state-level registrations before MVP launch.
