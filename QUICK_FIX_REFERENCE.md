# ⚡ QUICK FIX REFERENCE GUIDE

## 🚨 Critical Bugs - One-Page Overview

### Bug #1: SQL Injection (authController.ts:898)
**Status:** 🔴 CRITICAL  
**Fix:** Replace `sql.raw()` with Drizzle ORM methods  
**File:** `server/controllers/authController.ts`  
**Lines:** 881-900  
**Time:** 30 min

```typescript
// ❌ BEFORE
sql.raw(`UPDATE users SET ${updates.join(', ')} WHERE id = '${userId}'`)

// ✅ AFTER
db.update(users).set(updateData).where(eq(users.id, userId));
```

---

### Bug #2: Payment Race Condition (paymentController.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Wrap payment verification in database transaction  
**File:** `server/controllers/paymentController.ts`  
**Lines:** 480-635  
**Time:** 1-2 hours

```typescript
// ✅ SOLUTION
const result = await poolConnection.transaction(async (tx) => {
  // All payment processing here
  // Atomic - all succeed or all fail
});
```

---

### Bug #3: Coupon Reuse Exploit (paymentController.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Add per-user coupon tracking table  
**File:** `shared/schema.ts` + `server/controllers/paymentController.ts`  
**Time:** 1 hour

```typescript
// ✅ ADD TO SCHEMA
export const couponUsage = mysqlTable('coupon_usage', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  couponId: int('coupon_id').notNull(),
  usedAt: timestamp('used_at').defaultNow(),
});

// ✅ CHECK IN applyCoupon()
const userUsageCount = await db.select({...})
  .from(couponUsage)
  .where(and(
    eq(couponUsage.couponId, coupon.id),
    eq(couponUsage.userId, userId)
  ));
```

---

### Bug #4: Missing Quiz Auth (quizAttemptController.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Add purchase verification before allowing attempt  
**File:** `server/controllers/quizAttemptController.ts`  
**Time:** 30 min

```typescript
// ✅ ADD THIS CHECK
if (!quiz.is_free) {
  const [access] = await db.select()
    .from(quiz_access)
    .where(and(
      eq(quiz_access.userId, userId),
      eq(quiz_access.quizId, quizId)
    ));
  
  if (!access) {
    return res.status(403).json({
      success: false,
      message: "Purchase required"
    });
  }
}
```

---

### Bug #5: Hardcoded Secrets (index.ts:79, db.ts:13)
**Status:** 🔴 CRITICAL  
**Fix:** Replace hardcoded values with env variable checks  
**Files:** `server/index.ts`, `server/db.ts`  
**Time:** 20 min

```typescript
// ✅ ADD VALIDATION AT TOP OF server/index.ts
const REQUIRED_ENV_VARS = [
  'DB_PASSWORD', 'JWT_SECRET', 'SESSION_SECRET'
];

const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
if (missing.length > 0) {
  console.error('Missing required env vars:', missing);
  process.exit(1);
}

// ✅ THEN USE WITHOUT DEFAULTS
secret: process.env.SESSION_SECRET!  // Fails if undefined
```

---

### Bug #6: Missing CSRF (server/index.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Install and configure CSRF middleware  
**File:** `server/index.ts`  
**Time:** 1.5 hours

```typescript
// ✅ INSTALL
npm install csurf

// ✅ ADD TO server/index.ts
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: false });

app.post('*', csrfProtection);
app.put('*', csrfProtection);
app.delete('*', csrfProtection);
app.patch('*', csrfProtection);

// ✅ ADD TOKEN TO RESPONSES
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken?.();
  next();
});
```

---

### Bug #7: IDOR in Courses (adminCourseRoutes.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Add ownership verification for instructors  
**File:** `server/controllers/adminCourseController.ts`  
**Time:** 1-2 hours

```typescript
// ✅ ADD OWNERSHIP CHECK
const [course] = await db.select().from(courses)
  .where(eq(courses.id, courseId));

if (!course) return res.status(404).json({...});

// Instructor can only edit their own courses
if (userRole === 'instructor' && course.instructorId !== userId) {
  return res.status(403).json({
    success: false,
    message: "You can only edit your own courses"
  });
}
```

---

### Bug #8: XSS Vulnerability (authController.ts, courseController.ts)
**Status:** 🔴 CRITICAL  
**Fix:** Sanitize user input before storing  
**Files:** Multiple controllers  
**Time:** 45 min

```typescript
// ✅ INSTALL
npm install isomorphic-dompurify

// ✅ USE IN CONTROLLERS
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(req.body.description);

const course = await db.insert(courses).values({
  description: sanitizedDescription,
  // ...
});
```

---

## 📋 IMPLEMENTATION CHECKLIST

### Day 1: Critical Fixes (8-9 hours total)

**Morning (3-4 hours)**
- [ ] Bug #1: SQL Injection (30 min)
- [ ] Bug #5: Hardcoded Secrets (20 min)
- [ ] Bug #4: Missing Auth (30 min)
- [ ] Bug #8: XSS Protection (45 min)
- [ ] Basic testing (30 min)

**Afternoon (4-5 hours)**
- [ ] Bug #2: Race Condition (1.5-2 hours)
- [ ] Bug #3: Coupon Exploit (1 hour)
- [ ] Bug #6: CSRF Protection (1.5 hours)
- [ ] Bug #7: IDOR Fix (1 hour)
- [ ] Integration testing (1 hour)

### Day 2: Testing & Validation (4-5 hours)

- [ ] Unit tests for each fix
- [ ] Integration tests for payment flow
- [ ] Security scanning (OWASP ZAP)
- [ ] Manual testing of affected features

### Day 3: Deployment (2-3 hours)

- [ ] Deploy to staging
- [ ] Production deployment
- [ ] Monitoring and verification

---

## 🔧 REQUIRED DEPENDENCIES

Add to `package.json`:

```json
{
  "dependencies": {
    // ... existing ...
    "csurf": "^1.11.0",
    "isomorphic-dompurify": "^1.8.0"
  }
}
```

Install:
```bash
npm install csurf isomorphic-dompurify
```

---

## 📊 TESTING COMMANDS

### Unit Test Bug Fixes
```bash
npm test -- authController.test.ts
npm test -- paymentController.test.ts
npm test -- quizAttemptController.test.ts
```

### Security Scan
```bash
npm audit
npm run security-check  # if configured
```

### Manual Testing
- Create test user account
- Test course enrollment (paid & free)
- Test quiz attempt
- Test coupon application
- Test payment flow

---

## 🚀 DEPLOYMENT STEPS

### Pre-Deployment
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run all tests
npm test

# Build
npm run build

# Security check
npm audit

# Run OWASP scan
docker run -t owasp/zap:stable zap-baseline.py -t http://localhost:5001
```

### Deployment
```bash
# Set environment variables
export JWT_SECRET="[generated secret]"
export SESSION_SECRET="[generated secret]"
export RAZORPAY_KEY_SECRET="[your secret]"

# Start application
npm start

# Verify health
curl http://localhost:5001/api/health
```

### Post-Deployment
- [ ] Monitor error logs (Sentry/DataDog)
- [ ] Check database connections
- [ ] Verify payment processing
- [ ] Test user authentication
- [ ] Monitor API response times

---

## ⚠️ ROLLBACK PLAN

If critical issues found after deployment:

```bash
# Immediately rollback to previous version
git checkout HEAD~1
npm install
npm start

# Notify stakeholders
# Investigate issue
# Fix and redeploy
```

---

## 🆘 EMERGENCY CONTACTS

If critical security issue discovered:

1. **Immediate:** Disable affected features
2. **Alert:** Notify team leads
3. **Investigate:** Assess data breach scope
4. **Communicate:** Notify affected users
5. **Fix:** Implement patch
6. **Deploy:** Roll out fix
7. **Monitor:** Watch for exploitation

---

## 📈 SUCCESS METRICS

After all fixes, verify:

- ✅ No SQLi vulnerabilities (SQLmap)
- ✅ No payment fraud paths (manual testing)
- ✅ No unauthorized access (Burp Suite)
- ✅ No XSS (OWASP ZAP)
- ✅ CSRF tokens working
- ✅ Authorization checks passing
- ✅ Zero critical CVEs (npm audit)

---

## 📚 ADDITIONAL RESOURCES

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [CWE Top 25](https://cwe.mitre.org/top25/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [NIST Cybersecurity Framework](https://www.nist.gov/cyberframework/)

---

**Last Updated:** 2025-12-28  
**Version:** 1.0  
**Status:** 🔴 CRITICAL - ACTION REQUIRED
