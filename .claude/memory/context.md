# Project Context
> Last updated: 2026-05-20 by /r-memory scan

- **Product Name**: NanoLoan
- **Purpose**: Digital lending platform providing instant loans to customers in Bangladesh with bank account integration
- **Target Users**: Bangladeshi residents with bank accounts, aged 18+, smartphone users
- **Current Phase**: Core feature development - auth, KYC, bank accounts, loan eligibility completed
- **What Success Looks Like**: Users can complete KYC verification, link bank accounts, check loan eligibility, and receive loan disbursements within 24 hours
- **What Must Never Break**:
  - Authentication flow (login, registration, token refresh)
  - KYC verification (ID capture, OCR, facial recognition)
  - Bank account linking and transaction history
  - Loan application and disbursement flow
- **Known Technical Debt**:
  - Firebase implementation incomplete (Firestore, Messaging not fully integrated)
  - Some screens pending implementation (`/bank/accounts`, `/loans/*` screens created but not fully wired)
  - Error handling could be more granular (field-level vs form-level)
  - No offline mode or request queueing for failed API calls
  - ML Kit OCR needs error handling for poor quality images
