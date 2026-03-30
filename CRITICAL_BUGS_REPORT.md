# 🔴 CRITICAL BUGS REPORT - Unchi Udaan Project

**Generated:** December 28, 2025
**Project:** Unchi Udaan (E-Learning Platform)
**Status:** 8 Critical Bugs Found | 12 High Priority Issues | 5 Medium Issues

---

## 🚨 CRITICAL BUGS (Must Fix Immediately)

### 1. **SQL INJECTION VULNERABILITY in authController.ts - Line 898**
**Severity:** 🔴 CRITICAL  
**File:** [server/controllers/authController.ts](server/controllers/authController.ts#L898)  
**Issue:** Raw SQL injection vulnerability in `updateNotificationPreferences()` function

```typescript
// ❌ VULNERABLE CODE
sql.raw(`UPDATE users SET ${updates.join(', ')} WHERE id = '${userId}'`)
```

**Problem:**
- `userId` is directly interpolated into SQL string without sanitization
- User could inject malicious SQL through ID manipulation
- This bypasses Drizzle ORM's parameterized query protection

**Impact:** Complete database compromise, unauthorized data access/modification

**Fix:**
```typescript
// ✅ CORRECT CODE
db.update(users)
  .set(updateObj)
  .where(eq(users.id, userId))
```

---

### 2. **RACE CONDITION in Payment Verification - paymentController.ts**
**Severity:** 🔴 CRITICAL  
**File:** [server/controllers/paymentController.ts](server/controllers/paymentController.ts#L480-L600)  
**Issue:** Double-spending vulnerability due to missing transaction atomicity

```typescript
// ❌ VULNERABLE - Multiple async operations without transaction
const [payment] = await db.select().from(payments).where(...);

// User could craft simultaneous payment verify requests
await db.insert(enrollments).values({...}); // Not atomic
await db.insert(quiz_access).values({...});  // Multiple separate queries
```

**Problem:**
- No database transaction wrapping payment verification
- An attacker can verify same payment multiple times by sending parallel requests
- Creates duplicate enrollments/access records
- Causes revenue loss

**Impact:** Financial fraud, multiple access grants for single payment

**Fix:**
```typescript
// ✅ USE DATABASE TRANSACTIONS
const transaction = db.transaction(async (tx) => {
  const [payment] = await tx.select().from(payments).where(...);
  if (payment.status === 'success') return; // Already processed
  
  // Atomically update ALL related records
  await tx.update(payments).set({status: 'success'});
  if (courseId) await tx.insert(enrollments).values({...});
  if (quizId) await tx.insert(quiz_access).values({...});
});
await transaction;
```

---

### 3. **COUPON CODE REUSE EXPLOIT - couponController.ts**
**Severity:** 🔴 CRITICAL  
**File:** [server/controllers/paymentController.ts](server/controllers/paymentController.ts#L25-L70)  
**Issue:** Missing coupon usage limit enforcement per user

```typescript
// ❌ VULNERABLE - Only checks global limit
if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
  throw new Error("Coupon usage limit reached");
}
```

**Problem:**
- No per-user coupon limit tracking
- Same user can apply same coupon to multiple courses
- `usageLimit` only tracks total uses across ALL users
- Attacker can apply 100% discount coupon to unlimited courses

**Impact:** Massive revenue loss, unlimited free access to paid content

**Fix:**
Add schema for coupon usage tracking per user:
```typescript
export const couponUsage = mysqlTable('coupon_usage', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  couponId: int('coupon_id').notNull(),
  usedAt: timestamp('used_at').defaultNow(),
});

// Then in applyCoupon():
const userUsageCount = await db
  .select({ count: sql<number>`count(*)` })
  .from(couponUsage)
  .where(and(
    eq(couponUsage.couponId, coupon.id),
    eq(couponUsage.userId, userId) // ✅ ADD THIS
  ));

if (coupon.perUserLimit && userUsageCount[0].count >= coupon.perUserLimit) {
  throw new Error("You have already used this coupon");
}
```

---

### 4. **MISSING AUTHORIZATION CHECK - Quiz Attempt Submission**
**Severity:** 🔴 CRITICAL  
**File:** [server/controllers/quizAttemptController.ts](server/controllers/quizAttemptController.ts)  
**Issue:** No verification that user has purchased/accessed quiz before submitting attempt

```typescript
// ❌ VULNERABLE - No purchase verification
export const submitQuizAttempt = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const quizId = Number(req.params.quizId);
  
  // Directly allows quiz submission without checking quiz_access table!
  // User can submit attempt for any quiz without payment
}
```

**Problem:**
- Free quizzes should check `is_free` flag
- Paid quizzes should verify `quiz_access` record
- Missing check allows unpaid users to attempt paid quizzes
- No enrollment verification for course-linked quizzes

**Impact:** Unauthorized quiz access, revenue loss, invalid results

**Fix:**
```typescript
// ✅ ADD AUTHORIZATION
const [quiz] = await db.select().from(quizzes).where(eq(quizzes.id, quizId));
if (!quiz) return res.status(404).json({...});

// Check purchase for paid quizzes
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
      message: "You must purchase this quiz first"
    });
  }
}
```

---

### 5. **HARDCODED DEFAULT SECRETS - Multiple Files**
**Severity:** 🔴 CRITICAL  
**Files:**
- [server/index.ts](server/index.ts#L79)
- [server/config/db.ts](server/config/db.ts)

```typescript
// ❌ VULNERABLE
secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production'
password: process.env.DB_PASSWORD || ''
```

**Problem:**
- Default session secret is hardcoded in source code
- If deployed without setting SESSION_SECRET env var, sessions are compromised
- Empty default database password is dangerous
- Secrets exposed in GitHub/version control

**Impact:** Session hijacking, user authentication bypass, database unauthorized access

**Fix:**
```typescript
// ✅ CORRECT - Fail if env var not set
if (!process.env.SESSION_SECRET) {
  throw new Error('❌ SESSION_SECRET environment variable is required');
}
if (!process.env.DB_PASSWORD && process.env.NODE_ENV === 'production') {
  throw new Error('❌ DB_PASSWORD environment variable is required in production');
}
```

---

### 6. **MISSING CSRF PROTECTION**
**Severity:** 🔴 CRITICAL  
**Issue:** No CSRF token validation on state-changing requests

```typescript
// ❌ VULNERABLE - No CSRF protection
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
}));

// No csrf middleware present
```

**Problem:**
- POST/PUT/DELETE requests lack CSRF token validation
- Attacker can forge requests from malicious website
- Users logged in to Unchi Udaan can be tricked into unwanted actions
- Affects payment, enrollment, profile updates, admin actions

**Impact:** Unauthorized state changes, malicious actions on behalf of users

**Fix:**
```typescript
// ✅ ADD CSRF PROTECTION
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: false });

// Protect all state-changing routes
app.post('*', csrfProtection);
app.put('*', csrfProtection);
app.delete('*', csrfProtection);
app.patch('*', csrfProtection);

// Middleware to attach CSRF token to requests
app.use((req, res, next) => {
  res.locals.csrfToken = req.csrfToken?.();
  next();
});
```

---

### 7. **INSECURE DIRECT OBJECT REFERENCES (IDOR) - Admin Course Routes**
**Severity:** 🔴 CRITICAL  
**File:** [server/routes/adminCourseRoutes.ts](server/routes/adminCourseRoutes.ts)  
**Issue:** Instructors can modify/delete courses they don't own

```typescript
// ❌ VULNERABLE - No ownership check
router.put('/courses/:id', authenticate, adminAuth, updateCourse);
// Only checks if user is admin/instructor, not if they own the course
```

**Problem:**
- Instructor A can update Instructor B's courses
- No `instructorId` verification against authenticated user
- Same issue in DELETE, PUBLISH operations

**Impact:** Course sabotage, unauthorized content modification/deletion, data integrity loss

**Fix:**
```typescript
// ✅ ADD OWNERSHIP VERIFICATION
const adminUpdateCourse = async (req: RequestWithUser, res: Response) => {
  const courseId = Number(req.params.id);
  const userId = (req as any).userId;
  const userRole = (req as any).userRole;
  
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId));
  
  if (!course) return res.status(404).json({...});
  
  // Instructor can only edit their own courses
  if (userRole === 'instructor' && course.instructorId !== userId) {
    return res.status(403).json({
      success: false,
      message: "You can only edit your own courses"
    });
  }
  
  // Admin can edit any course
  // ...continue update
};
```

---

### 8. **MISSING INPUT VALIDATION - XSS Vulnerability**
**Severity:** 🔴 CRITICAL  
**Issue:** Course/Quiz descriptions stored without sanitization

```typescript
// ❌ VULNERABLE - No HTML sanitization
const course = await db.insert(courses).values({
  title: req.body.title,        // Unsanitized
  description: req.body.description, // Could contain <script>
  syllabus: req.body.syllabus,
});
```

**Problem:**
- Course descriptions accept HTML/JS without escaping
- When displayed in client, malicious scripts execute
- Stored XSS affects all users viewing the course
- Admin dashboard vulnerable to XSS from user-generated content

**Impact:** Account hijacking, credential theft, malware distribution

**Fix:**
```typescript
// ✅ ADD SANITIZATION
import DOMPurify from 'isomorphic-dompurify';

const sanitizedDescription = DOMPurify.sanitize(req.body.description);

const course = await db.insert(courses).values({
  title: xss(req.body.title),
  description: sanitizedDescription,
});
```

---

## ⚠️ HIGH PRIORITY ISSUES

### 1. **No Rate Limiting on Authentication Endpoints**
**Severity:** 🟠 HIGH  
**File:** [server/routes/auth.routes.ts](server/routes/auth.routes.ts)  
**Problem:** Brute force attacks possible on login/register endpoints

**Fix:**
```typescript
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again later'
});

router.post('/login', loginLimiter, login);
router.post('/register', rateLimit({...}), register);
```

---

### 2. **Payment Amount Not Re-verified in Verification**
**Severity:** 🟠 HIGH  
**File:** [server/controllers/paymentController.ts](server/controllers/paymentController.ts#L500-L550)  
**Problem:** Client can send modified amount; server doesn't verify against Razorpay

```typescript
// ❌ VULNERABLE - Trust client amount
// User could modify amount in frontend before sending verification
```

**Fix:** Always fetch original amount from Razorpay or database:
```typescript
const originalOrder = await razorpay.orders.fetch(orderId);
if (parseInt(originalOrder.amount) !== parseInt(req.body.amount) * 100) {
  return res.status(400).json({success: false, message: "Amount mismatch"});
}
```

---

### 3. **Missing Pagination Security - DOS Vector**
**Severity:** 🟠 HIGH  
**Files:** Multiple (adminCourseController, quizController, etc.)  
**Problem:** Unlimited offset/limit parameters can cause DOS

```typescript
// ❌ VULNERABLE
const limit = Number(req.query.limit) || 100000; // No upper bound!
const offset = Number(req.query.offset) || 0;

const results = await db.select().from(courses).limit(limit).offset(offset);
// Attacker: ?limit=999999999&offset=999999999 = huge query, DOS
```

**Fix:**
```typescript
// ✅ SAFE
const limit = Math.min(Number(req.query.limit) || 10, 100); // Cap at 100
const offset = Math.max(0, Number(req.query.offset) || 0);
```

---

### 4. **No Timeout for Long-Running Operations**
**Severity:** 🟠 HIGH  
**Issue:** PDF generation, video processing could hang indefinitely

**Fix:** Add operation timeouts:
```typescript
Promise.race([
  generatePDF(...),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('PDF generation timeout')), 30000)
  )
]);
```

---

### 5. **Stored Password Hash Not Verified**
**Severity:** 🟠 HIGH  
**File:** [server/controllers/authController.ts](server/controllers/authController.ts#L150-L200)  
**Problem:** `bcrypt.compare()` results not always checked consistently

**Fix:** Ensure ALL password verifications use bcrypt.compare:
```typescript
const isValidPassword = await bcrypt.compare(password, user.password);
if (!isValidPassword) {
  return res.status(401).json({success: false, message: 'Invalid credentials'});
}
```

---

### 6. **No Encryption for Sensitive Fields**
**Severity:** 🟠 HIGH  
**Issue:** Payment metadata, email addresses, phone numbers stored in plain text

**Fix:**
```typescript
import crypto from 'crypto';

// Encrypt sensitive fields
const encrypted = crypto
  .createCipheriv('aes-256-gcm', key, iv)
  .update(sensitiveData)
  .final();
```

---

### 7. **Missing Request Size Limits**
**Severity:** 🟠 HIGH  
**File:** [server/index.ts](server/index.ts#L69-L70)

```typescript
// ⚠️ CURRENT CODE
app.use(express.json({ limit: '10mb' })); // Could accept 10MB JSON
```

**Issue:** Large payloads can consume memory, DOS attack vector

**Fix:** Reduce limit based on actual needs:
```typescript
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ limit: '1mb' }));
```

---

### 8. **JWT Secret Too Short**
**Severity:** 🟠 HIGH  
**File:** [server/config/jwt.ts](server/config/jwt.ts)  
**Default:** `'dummy-jwt-secret'` - 15 bytes, easily crackable

**Fix:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters!');
}
```

---

### 9. **No HTTPS Enforcement**
**Severity:** 🟠 HIGH  
**Issue:** Insecure cookies transmitted over HTTP in development

**Fix:**
```typescript
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.redirect(301, `https://${req.header('host')}${req.url}`);
  }
  next();
});
```

---

### 10. **No Audit Logging for Admin Actions**
**Severity:** 🟠 HIGH  
**Issue:** No tracking of who modified/deleted courses, coupons, etc.

**Fix:** Add audit log table and track all admin actions:
```typescript
export const auditLogs = mysqlTable('audit_logs', {
  id: int('id').primaryKey().autoincrement(),
  adminId: int('admin_id').notNull(),
  action: varchar('action', {length: 255}).notNull(),
  resource: varchar('resource', {length: 100}).notNull(),
  resourceId: int('resource_id').notNull(),
  oldValues: json('old_values'),
  newValues: json('new_values'),
  timestamp: timestamp('timestamp').defaultNow(),
});
```

---

### 11. **Weak Password Reset Mechanism**
**Severity:** 🟠 HIGH  
**File:** [server/controllers/authController.ts](server/controllers/authController.ts#L500-L550)  
**Issue:** Reset token not properly secured

**Problems:**
- Token validity not checked properly
- No rate limiting on reset requests
- Token not invalidated after use

**Fix:**
```typescript
// Invalidate token after single use
await db.update(users)
  .set({
    reset_password_token: null,
    reset_password_expires: null
  })
  .where(eq(users.id, user.id));
```

---

### 12. **No Protection Against Concurrent Enrollment**
**Severity:** 🟠 HIGH  
**Issue:** User can enroll twice simultaneously

**Fix:**
```typescript
// Add UNIQUE constraint in schema
export const enrollments = mysqlTable('enrollments', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull(),
  courseId: int('course_id').notNull(),
  // ...
}, (table) => ({
  uniqueEnrollment: uniqueIndex('unique_user_course')
    .on(table.userId, table.courseId),
}));
```

---

## 🟡 MEDIUM PRIORITY ISSUES

### 1. **Unhandled Promise Rejections**
**Issue:** Some async operations don't have proper error handling  
**Fix:** Ensure all promises have `.catch()` or try/catch blocks

### 2. **Missing Database Connection Pooling Limits**
**Issue:** Connection pool could exhaust  
**Fix:** Add monitoring and implement connection pool size limits

### 3. **No Backup/Recovery Mechanism**
**Issue:** No automated database backups configured

### 4. **Missing API Response Versioning**
**Issue:** API changes could break existing clients

### 5. **Logging Exposes Sensitive Information**
**Issue:** Passwords, tokens could be logged in error messages

---

## 📋 RECOMMENDED FIXES PRIORITY ORDER

| Priority | Bug | Estimated Fix Time |
|----------|-----|-------------------|
| 🚨 P0 | SQL Injection (Bug #1) | 30 min |
| 🚨 P0 | Payment Race Condition (Bug #2) | 1 hour |
| 🚨 P0 | Coupon Exploit (Bug #3) | 45 min |
| 🚨 P0 | Missing Quiz Auth Check (Bug #4) | 30 min |
| 🚨 P0 | Hardcoded Secrets (Bug #5) | 20 min |
| 🚨 P0 | CSRF Protection (Bug #6) | 1.5 hours |
| 🚨 P0 | IDOR in Admin Routes (Bug #7) | 2 hours |
| 🚨 P0 | XSS Vulnerability (Bug #8) | 45 min |
| ⚠️ P1 | Rate Limiting | 1 hour |
| ⚠️ P1 | Payment Amount Verification | 30 min |

---

## 🛡️ SECURITY CHECKLIST

- [ ] Fix all CRITICAL bugs (#1-8)
- [ ] Implement rate limiting
- [ ] Add CSRF protection
- [ ] Add input sanitization
- [ ] Implement audit logging
- [ ] Add HTTPS enforcement
- [ ] Rotate all secrets
- [ ] Run security audit tool (OWASP ZAP)
- [ ] Penetration testing
- [ ] Code review by security expert

---

**Report Generated:** 2025-12-28  
**Next Review:** After implementing all P0 fixes
