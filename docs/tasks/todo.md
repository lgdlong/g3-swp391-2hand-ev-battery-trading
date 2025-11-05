# TODO List - 2nd-hand EV Battery Trading Platform

**Last Updated**: November 5, 2025  
**Project Status**: 68.3% Complete (28/41 tasks)

---

## 🔴 HIGH PRIORITY (Critical for MVP)

### Transaction & Payment System
- [ ] **FR-M16a**: Fix bugs in Deposit Payment (Seller Listing)
  - Status: Implemented but needs bug fixes
  - Issues: Review and fix existing bugs in deposit payment flow
  - Files: `apps/api/src/modules/wallets/`, payment-related services

- [ ] **FR-M16b**: Simplify Fee Capture system
  - Status: Needs simplification
  - Task: Review current implementation and simplify the fee capture logic
  - Files: Payment services, wallet deduction logic

- [ ] **FR-M16c**: Review and maintain Refund Policy
  - Status: Keep existing logic
  - Task: Document current refund policy and ensure it's working correctly
  - Files: Refund-related services

- [ ] **FR-M17**: PDF Contract Generation
  - Status: Keep & update
  - Task: Complete PDF contract generation for transactions
  - Tech: Consider using libraries like PDFKit or Puppeteer
  - Files: Create new contract service module

- [ ] **FR-M18**: View and Download Contract History
  - Status: Not implemented
  - Task: API endpoint and UI to view/download transaction contracts
  - Dependencies: FR-M17 must be completed first

### Wallet Management
- [ ] **FR-W3**: Withdraw Money from Wallet
  - Status: Not implemented
  - Task: Implement withdrawal feature with bank account verification
  - Security: Add proper validation and approval workflow
  - Files: `apps/api/src/modules/wallets/`, frontend wallet pages

### Admin Dashboard
- [ ] **FR-A6**: Update Dashboard Statistics
  - Status: Needs update
  - Task: Refresh statistics with current business metrics
  - Metrics: Posts, users, transactions, revenue
  - Files: `apps/web/app/(dashboard)/admin/`, admin services

---

## 🟡 MEDIUM PRIORITY (Important for Launch)

### Post-Sale Support
- [ ] **FR-M19**: Complete Rating System UI
  - Status: API exists, UI pending
  - Task: Build frontend UI for rating sellers
  - Components: Rating modal, rating display on seller profile
  - Files: `apps/web/app/(public)/posts/[id]/`, rating components
  - API: Already implemented at `apps/api/src/modules/ratings/`

- [ ] **FR-M22**: Confirm Transaction (Both Parties)
  - Status: Not implemented
  - Task: Double confirmation system for completed transactions
  - Flow: Buyer confirms receipt → Seller confirms completion
  - Files: New transaction confirmation module

- [ ] **FR-M20**: Report Transaction or User (Fraud Report)
  - Status: Not implemented
  - Task: Reporting system for suspicious activities
  - Features: Report reasons, admin review, evidence upload
  - Files: New reporting module

- [ ] **FR-M23**: Fraud Signals Detection
  - Status: Not implemented
  - Task: Implement fraud detection rules
  - Logic: Multiple flags, suspicious patterns, auto-alerts
  - Files: Fraud detection service

- [ ] **FR-M24**: Seller Reputation System
  - Status: Not implemented
  - Task: Calculate and display seller reputation score
  - Based on: Ratings, successful transactions, response time
  - Files: Reputation calculation service

### Wallet Management
- [ ] **FR-W5**: Link Bank Account
  - Status: Not implemented
  - Task: Bank account linking for withdrawals
  - Security: Verification process required
  - Files: Bank account entity, wallet service extension

---

## 🟢 LOW PRIORITY (Nice to Have / Future Features)

### Search & Comparison
- [ ] **FR-M13**: Compare Multiple Posts (≤ 3 posts)
  - Status: Not implemented
  - Task: Side-by-side comparison of post specifications
  - UI: Comparison table with key specs
  - Files: New comparison page component

- [ ] **FR-M15**: Auction/Bidding System
  - Status: Not implemented
  - Task: Implement auction functionality for posts
  - Complexity: High - requires real-time bidding
  - Files: New auction module (backend + frontend)

### AI & Analytics
- [ ] **FR-M9**: AI/Rule-based Price Suggestion
  - Status: Not implemented (stretch goal)
  - Task: Price recommendation based on market data
  - Approach: ML model or rule-based algorithm
  - Files: New pricing service

- [ ] **FR-A4**: Admin Case Management
  - Status: Not implemented
  - Task: System to manage reported cases and disputes
  - Features: Case tracking, resolution workflow
  - Files: New case management module

- [ ] **FR-A7**: Advanced Reporting & Analytics
  - Status: Not implemented (stretch goal)
  - Task: Revenue reports, product analytics, trends
  - Features: Monthly revenue, hot products, user analytics
  - Files: Analytics service, report generation

---

## 📋 CHECKLIST BY MODULE

### Backend (NestJS)
- [ ] Wallet withdrawal endpoint
- [ ] PDF contract generation service
- [ ] Contract history endpoints
- [ ] Transaction confirmation flow
- [ ] Fraud reporting endpoints
- [ ] Reputation calculation service
- [ ] Bank account linking API

### Frontend (Next.js)
- [ ] Rating system UI components
- [ ] Withdraw money modal/page
- [ ] Contract download interface
- [ ] Transaction confirmation UI
- [ ] Report modal/form
- [ ] Comparison page
- [ ] Updated admin dashboard

### Database
- [ ] Contract storage table
- [ ] Bank account table
- [ ] Transaction confirmation fields
- [ ] Fraud report table
- [ ] Reputation score fields

---

## 🎯 SPRINT SUGGESTIONS

### Sprint 1: Critical Payments & Contracts (2 weeks)
- Fix deposit payment bugs
- Implement wallet withdrawal
- PDF contract generation
- Contract history viewing

### Sprint 2: Post-Sale Features (2 weeks)
- Complete rating system UI
- Transaction confirmation
- Fraud reporting
- Update admin dashboard

### Sprint 3: Enhancement & Polish (1-2 weeks)
- Seller reputation system
- Bank account linking
- Comparison feature
- Advanced analytics (if time permits)

---

## 📝 NOTES

### Implementation Tips
1. **Wallet Withdrawal**: Consider using PayOS for disbursements or manual bank transfer approval
2. **PDF Contracts**: Use `@react-pdf/renderer` or `puppeteer` for PDF generation
3. **Fraud Detection**: Start with simple rule-based system before ML
4. **Reputation Score**: Weight recent transactions higher than old ones

### Testing Checklist
- [ ] Payment flows end-to-end testing
- [ ] Wallet withdrawal security testing
- [ ] PDF contract generation testing
- [ ] Transaction confirmation edge cases
- [ ] Fraud report workflow testing

### Documentation Needed
- [ ] Payment system architecture diagram
- [ ] Wallet withdrawal flow documentation
- [ ] Contract template design
- [ ] Fraud detection rules documentation
- [ ] API documentation updates

---

## ✅ COMPLETED FEATURES (Reference)

**For completed features, see `tasks.md`**

Major completed modules:
- Authentication (Email, Google OAuth)
- Post Management (Create, Edit, Delete for EV/Battery)
- Search & Filter System
- Bookmark System
- Admin Post Approval/Rejection
- Admin User Management (Ban, Role Change)
- Post Verification System
- Wallet Topup (PayOS Integration)
- Real-time Chat (WebSocket)
- Transaction History

---

**Total Remaining**: 13 tasks (6 High, 5 Medium, 2 Low priority + stretch goals)
