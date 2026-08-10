# Google Play submission notes — UDUFood

Use this when filling Play Console. Keep in sync with `src/constants/storeReview.ts` and `src/constants/legal.ts`.

---

## 1. Host legal pages (required before submit)

Deploy the HTML files in this folder:

| File | Publish at |
|------|------------|
| `legal/privacy.html` | `https://udufood.com/privacy` |
| `legal/terms.html` | `https://udufood.com/terms` |

Play Console → App content → Privacy policy → paste the privacy URL.

---

## 2. App access (reviewer login)

Play Console → App content → App access → “All or some functionality is restricted”.

| Role | Phone (SG) | OTP |
|------|------------|-----|
| Receiver | `90000001` (full: `+6590000001`) | `1234` |
| Restaurant | `90000002` (full: `+6590000002`) | `1234` |

**Backend requirement:** these numbers must be pre-seeded and must accept OTP `1234` without SMS. The app skips `/auth/otp/send/` for these phones only.

Instructions for reviewers:

1. Open UDUFood → Login  
2. Country: Singapore  
3. Enter `90000001` (Receiver) or `90000002` (Restaurant)  
4. Enter OTP `1234`  
5. Explore browse / claim / restaurant manage flows  

---

## 3. Data Safety (declare accurately)

Typical declarations for this app:

| Data type | Collected | Shared | Purpose |
|-----------|-----------|--------|---------|
| Phone number | Yes | No | Account / SMS OTP |
| Name | Yes | Limited (claim pickup) | Account |
| Approximate / precise location | Yes | No | Nearby meals, 500 m claim check |
| Photos | Yes (if user uploads) | No | Profile / menu |
| App activity | Yes | No | Claims history |

- Data encrypted in transit: **Yes** (HTTPS)  
- Users can request deletion: **Yes** (in-app Delete account + email)  
- Do **not** declare push notifications or payment data until those features ship  

---

## 4. Permissions (Play form / review)

| Permission | Why |
|------------|-----|
| Camera | QR claim scan, profile / menu photos |
| Location (foreground) | Nearby listings + proximity check |

Not used (blocked in `app.json`): microphone, background location.

---

## 5. Build upload

```bash
eas build --platform android --profile production
```

Production profile outputs an **AAB** (`app-bundle`) pointed at `https://api.udufood.com/api/v1`.

---

## 6. Still manual in Play Console

- [ ] Store listing (title, short/full description, screenshots, feature graphic)  
- [ ] Content rating questionnaire  
- [ ] Target audience / age  
- [ ] Ads declaration (No, unless you add ads)  
- [ ] Internal / closed testing track before production  
