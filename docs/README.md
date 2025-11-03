# Project Documentation

This directory contains comprehensive documentation for the 2nd-hand EV Battery Trading Platform.

## 📚 Available Documentation

## 📚 Documentation Index

### Payment & Wallet Features
- [**Wallet Topup Flow**](./wallet-topup-flow.md) - Complete guide for wallet topup via PayOS integration

### Post Management Features
- [**Post Creation Flow**](./post-creation-flow.md) - 2-stage post creation workflow (form submission + image upload)
- **Complete flow diagram** showing post creation, publishing, and verification payment
- **Simplified payment diagram** for wallet deduction
- Database schema with 5 key tables
- API endpoint specifications with examples
- Frontend payment component documentation
- Balance validation and error handling
- Payment status state diagrams
- Testing scenarios for various edge cases

**Key Features Covered:**
- User creates post (DRAFT → PUBLISHED)
- Request verification with 50,000 VND fee
- Wallet balance validation
- Transaction atomicity and rollback
- Success/failure handling
- Insufficient balance flow

---

- **Detailed sequence diagram** (30+ steps) showing the entire payment flow
- Database schema with table structures
- API endpoint specifications with request/response examples
- Frontend component documentation
- Error handling strategies
- Security features (HMAC signatures, JWT, transactions)
- Payment status state diagrams
- Testing scenarios and edge cases
- Monitoring queries and debugging tips
- Future improvements roadmap

**Key Features Covered:**
- User initiates topup via TopupModal
- PayOS payment link generation
- Webhook processing and validation
- Automatic wallet balance updates
- Transaction recording and audit trail
- Success/failure handling

---

## 🎯 Quick Navigation

### For Developers

**Working on Payment Features?**
→ Read [Wallet Topup Flow](./wallet-topup-flow.md)

**Need API Integration Details?**
→ See [API Endpoints section](./wallet-topup-flow.md#api-endpoints)

**Database Changes?**
→ Check [Database Schema section](./wallet-topup-flow.md#database-schema)

**Testing Payment Flow?**
→ Review [Testing Scenarios](./wallet-topup-flow.md#testing-scenarios)

### For Reviewers

**Understanding the System?**
→ Start with [Overview](./wallet-topup-flow.md#overview) and [Sequence Diagram](./wallet-topup-flow.md#detailed-sequence-diagram)

**Security Concerns?**
→ See [Security Features](./wallet-topup-flow.md#security-features)

**Checking Business Logic?**
→ Review [Business Rules](./wallet-topup-flow.md#business-rules)

---

## 📖 Documentation Standards

All documentation in this folder follows these standards:

### Structure
- Overview and introduction
- Visual diagrams (Mermaid)
- Detailed explanations
- Code examples
- Error handling
- Testing guidelines

### Mermaid Diagrams
We use Mermaid for all diagrams:
- Sequence diagrams for flows
- State diagrams for status changes
- ER diagrams for database relationships
- Class diagrams for system architecture

### Code Blocks
Include language identifiers:
```typescript
// TypeScript example
```
```sql
-- SQL example
```
```json
// JSON example
```

---

## 🔧 How to View Diagrams

### In VS Code
1. Install "Markdown Preview Mermaid Support" extension
2. Open any `.md` file
3. Press `Ctrl+Shift+V` (or `Cmd+Shift+V` on Mac)
4. View rendered Mermaid diagrams

### In GitHub
- Diagrams render automatically in GitHub's markdown viewer
- No additional setup needed

### Online Tools
- [Mermaid Live Editor](https://mermaid.live/)
- Copy diagram code and paste to preview/edit

---

## 📝 Contributing to Documentation

### Adding New Documentation

1. **Create a new `.md` file** in this directory
2. **Follow the naming convention**: `feature-name-flow.md`
3. **Use the template structure**:
   - Overview
   - Sequence Diagram
   - Database Schema
   - API Endpoints
   - Error Handling
   - Testing
   - Related Docs

4. **Include Mermaid diagrams** for:
   - User flows (sequence diagrams)
   - Status changes (state diagrams)
   - System architecture

5. **Add to this README** in the appropriate section

### Updating Existing Documentation

1. **Keep it in sync** with code changes
2. **Update version** and last updated date
3. **Add to changelog** if major changes
4. **Link related PRs** in documentation

---

## 🗂️ Future Documentation

### Planned Documents

- [ ] **Wallet Management System** (`wallet-management.md`)
  - Balance tracking
  - Transaction history
  - Admin operations

- [✅] **Post Creation & Payment Flow** (`post-creation-payment-flow.md`)
  - Post creation and publishing
  - Verification payment (50,000 VND)
  - Wallet balance deduction

- [ ] **Authentication System** (`authentication-flow.md`)
  - JWT strategy
  - Google OAuth integration
  - Session management

- [ ] **Admin Dashboard** (`admin-features.md`)
  - User management
  - Content moderation
  - Payment oversight

- [ ] **Error Handling Guidelines** (`error-handling.md`)
  - Frontend error patterns
  - Backend exception handling
  - User-facing messages

- [ ] **Deployment Guide** (`deployment.md`)
  - Docker setup
  - Environment configuration
  - Database migrations

---

## 📊 Documentation Metrics

| Documentation | Diagrams | Completeness | Last Updated |
|--------------|----------|--------------|--------------|
| [Wallet Topup Flow](./wallet-topup-flow.md) | ✅ Sequence (Complete + Simplified), State | 100% | 2025-11-04 |
| [Post Creation Flow](./post-creation-flow.md) | ✅ Sequence (Complete + Simplified), State | 100% | 2025-11-04 |

**Legend:**
- ✅ Complete and reviewed
- 🚧 Work in progress
- ⚠️ Needs update
- 📝 Planned

---

## 🔗 External Resources

### Project Links
- [GitHub Repository](https://github.com/lgdlong/g3-swp391-2hand-ev-battery-trading)
- [Live Site](https://yoursite.com) *(if deployed)*
- [API Documentation](http://localhost:8000/api) (Swagger)

### Technology Documentation
- [Next.js 15 Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [TypeORM Docs](https://typeorm.io/)
- [PayOS API](https://payos.vn/docs/api)
- [Mermaid Docs](https://mermaid.js.org/)

---

## 💡 Tips for Reading Documentation

1. **Start with sequence diagrams** - They provide the best overview
2. **Follow the numbered steps** - Each step in diagrams is explained
3. **Check code examples** - They show real implementation patterns
4. **Review error scenarios** - Learn from edge cases
5. **Try the debug queries** - Hands-on database exploration

---

## 📞 Need Help?

- **Questions about docs?** Open an issue with `documentation` label
- **Found errors?** Submit a PR with corrections
- **Need clarification?** Ask in project discussions

---

**Last Updated**: November 3, 2025  
**Maintained By**: Development Team
