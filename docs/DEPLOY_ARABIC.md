# 🚀 دليل النشر السريع بالعربية

## الطريقة الأسهل: Railway.app (موصى بها) ⭐

### لماذا Railway؟
- ✅ **مجاني**: 500 ساعة شهرياً
- ✅ **سهل**: نشر بضغطة زر واحدة
- ✅ **سريع**: رابطك جاهز خلال 5 دقائق
- ✅ **متكامل**: Frontend + Backend + Database معاً

---

## 📋 الخطوات (5 دقائق فقط!)

### 1️⃣ إنشاء حساب على Railway

```bash
# اذهب إلى
https://railway.app

# اضغط "Start a New Project"
# سجل الدخول باستخدام GitHub
```

### 2️⃣ نشر المشروع

```bash
# في Railway Dashboard:
1. اضغط "New Project"
2. اختر "Deploy from GitHub repo"
3. اختر repository: "Learning"
4. Railway سيبدأ النشر تلقائياً!
```

### 3️⃣ إضافة قاعدة البيانات PostgreSQL

```bash
# في نفس Project:
1. اضغط "+ New"
2. اختر "Database"
3. اختر "Add PostgreSQL"
4. انتظر دقيقة - سيتم الإنشاء تلقائياً
```

### 4️⃣ ربط Backend بقاعدة البيانات

```bash
# في Backend Service:
1. اضغط على "backend"
2. اذهب إلى "Variables"
3. Railway أضاف DATABASE_URL تلقائياً ✓
```

### 5️⃣ إضافة المتغيرات المهمة

في Backend → Variables، أضف:

```env
NODE_ENV=production
JWT_SECRET=أنشئ_سر_قوي_هنا_استخدم_64_حرف_على_الأقل
JWT_REFRESH_SECRET=أنشئ_سر_مختلف_64_حرف
OPENAI_API_KEY=sk-proj-your-openai-key-here
```

**لإنشاء سر قوي:**
```bash
# افتح Terminal واكتب:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6️⃣ الحصول على الرابط

```bash
# في Railway Dashboard:
1. اضغط على "Settings"
2. في قسم "Networking":
   - اضغط "Generate Domain"
3. انسخ الرابط!

ستحصل على رابط مثل:
https://learning-production-xxxx.up.railway.app
```

### 7️⃣ تحديث CORS

```bash
# ارجع لـ Variables وأضف:
CORS_ORIGIN=https://your-frontend-url.railway.app
NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
```

### 8️⃣ إعداد قاعدة البيانات (مرة واحدة فقط)

```bash
# في Railway → Backend → Settings:
1. اذهب إلى "Deploy"
2. في "Custom Start Command":
   npx prisma migrate deploy && npx prisma db seed && npm run start:prod
```

---

## ✅ جاهز! 🎉

الآن يمكنك زيارة رابط المنصة:
```
https://your-app.railway.app
```

**بيانات الدخول التجريبية:**
```
البريد: student@codelearn.com
الرقم السري: student123
```

---

## 🎯 الطريقة البديلة: Vercel (Frontend فقط)

### لماذا Vercel؟
- ✅ **مجاني 100%**
- ✅ **سرعة فائقة**
- ✅ **مثالي للـ Frontend**

### الخطوات:

#### 1. النشر على Vercel

```bash
# اذهب إلى
https://vercel.com

# اضغط "Add New" → "Project"
# اختر repository: "Learning"
# Root Directory: ./frontend
# اضغط "Deploy"
```

#### 2. إعداد المتغيرات

```bash
# في Vercel → Settings → Environment Variables:
NEXT_PUBLIC_API_URL=https://your-backend-url
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=أنشئ_سر_قوي
```

#### 3. Backend على Render

```bash
# اذهب إلى
https://render.com

# New → Web Service
# Connect GitHub
# اختر: backend/Dockerfile
# أضف Environment Variables
```

---

## 🔧 الإعدادات المتقدمة (اختياري)

### إضافة Google OAuth

```bash
# 1. اذهب إلى
https://console.cloud.google.com

# 2. إنشاء مشروع جديد
# 3. APIs & Services → OAuth consent screen
# 4. Credentials → Create OAuth Client ID
# 5. Application type: Web application

# 6. Authorized redirect URIs:
https://your-app.railway.app/api/auth/callback/google

# 7. احصل على:
Client ID: xxx.apps.googleusercontent.com
Client Secret: xxx

# 8. أضفهم في Railway Variables:
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
```

### إضافة GitHub OAuth

```bash
# 1. اذهب إلى
https://github.com/settings/developers

# 2. New OAuth App
# 3. املأ:
Homepage URL: https://your-app.railway.app
Authorization callback URL: https://your-app.railway.app/api/auth/callback/github

# 4. احصل على Client ID & Secret
# 5. أضفهم في Variables
```

---

## 🐛 حل المشاكل الشائعة

### المنصة لا تعمل؟

```bash
# تحقق من:
✓ DATABASE_URL موجود في Variables
✓ JWT_SECRET موجود
✓ Migrations تم تشغيلها
✓ Build نجح بدون أخطاء

# للتحقق من Logs:
Railway → Service → Deployments → View Logs
```

### Frontend لا يتصل بـ Backend؟

```bash
# تأكد من:
✓ NEXT_PUBLIC_API_URL صحيح
✓ CORS_ORIGIN يطابق رابط Frontend
✓ Backend يعمل ويرد على الطلبات

# اختبر Backend:
https://your-backend.railway.app/health
# يجب أن يرد: {"status": "ok"}
```

### Build فشل؟

```bash
# الأخطاء الشائعة:
❌ Missing dependencies → npm install في كلا المجلدين
❌ TypeScript errors → تحقق من tsconfig.json
❌ Missing env vars → أضف كل المتغيرات المطلوبة

# لإعادة المحاولة:
Railway → Service → Deploy → Redeploy
```

### Database Connection Error؟

```bash
# تأكد من:
✓ PostgreSQL service يعمل
✓ DATABASE_URL موجود في Variables
✓ Backend و Database في نفس Project

# لإعادة تشغيل Migrations:
Railway → Backend → Shell:
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

---

## 📊 مقارنة المنصات

| الميزة | Railway | Vercel | Render |
|--------|---------|--------|---------|
| **المجانية** | 500 ساعة | ✅ مجاني | ✅ مجاني |
| **السهولة** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐ |
| **السرعة** | سريع | سريع جداً | متوسط |
| **Database** | ✅ مدمج | ❌ منفصل | ✅ مدمج |
| **Backend** | ✅ نعم | ❌ لا | ✅ نعم |
| **الموصى به** | ✅✅✅ | Frontend فقط | Backend فقط |

---

## 🎁 نصائح مهمة

### 1. استخدم Secrets قوية

```bash
# ❌ ضعيف
JWT_SECRET="mysecret"

# ✅ قوي
JWT_SECRET="a1b2c3d4e5f6...64 أحرف عشوائية"

# لإنشاء سر قوي:
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. راقب الاستخدام

```bash
# Railway Dashboard → Usage:
- تحقق من الساعات المتبقية
- راقب Database size
- تحقق من عدد الـ Requests
```

### 3. Backup قاعدة البيانات

```bash
# Railway → PostgreSQL → Settings:
- فعّل Automated Backups
- أو استخدم:
railway db backup
```

### 4. تفعيل HTTPS (تلقائي!)

```bash
# Railway و Vercel يوفرون HTTPS تلقائياً
# لا حاجة لإعداد إضافي
# كل الروابط تبدأ بـ https://
```

---

## 🚀 الخطوات التالية بعد النشر

### 1. اختبر جميع الميزات

```bash
✓ تسجيل الدخول
✓ استعراض المسارات التعليمية
✓ فتح درس
✓ كتابة كود وتنفيذه
✓ حل تحدي
✓ التحدث مع الـ Chatbot
✓ تحميل شهادة
```

### 2. أضف محتوى جديد

```bash
# سجل دخول كـ Instructor:
Email: instructor@codelearn.com
Password: instructor123

# ثم:
- أنشئ مسار تعليمي جديد
- أضف دروس
- صمم تحديات
```

### 3. خصص التصميم

```bash
# عدل ألوان المنصة:
frontend/tailwind.config.ts

# غير الشعار:
frontend/public/logo.png

# عدل النصوص:
frontend/app/page.tsx
```

### 4. راقب الأداء

```bash
# Railway Dashboard:
- Metrics: CPU, Memory, Network
- Logs: تتبع الأخطاء
- Deployments: سجل النشر
```

---

## ✅ Checklist النشر الكامل

- [ ] ✅ تم إنشاء حساب Railway
- [ ] ✅ تم ربط GitHub repository
- [ ] ✅ تم إضافة PostgreSQL
- [ ] ✅ تم إضافة جميع Environment Variables
- [ ] ✅ تم توليد JWT secrets قوية
- [ ] ✅ تم تشغيل Database migrations
- [ ] ✅ تم seed البيانات الأولية
- [ ] ✅ تم الحصول على رابط المنصة
- [ ] ✅ تم اختبار تسجيل الدخول
- [ ] ✅ تم اختبار جميع الميزات
- [ ] ✅ تم إعداد OAuth (اختياري)
- [ ] ✅ تم إضافة OPENAI_API_KEY للـ Chatbot

---

## 🎯 الأسئلة الشائعة

### س: كم تكلفة النشر؟

**ج:** مجاني تماماً! Railway يوفر 500 ساعة/شهر مجاناً، وهذا كافٍ لآلاف الزوار.

### س: هل يمكن ربط دومين خاص؟

**ج:** نعم! في Railway → Settings → Custom Domains:
```
أضف: www.yoursite.com
```

### س: كيف أحدث الكود؟

**ج:** فقط اعمل Push لـ GitHub:
```bash
git add .
git commit -m "تحديث"
git push
# Railway سيعيد النشر تلقائياً!
```

### س: ماذا لو انتهت الساعات المجانية؟

**ج:** خيارات:
1. الترقية لخطة مدفوعة ($5/شهر)
2. الانتقال لـ Render (مجاني بدون حد)
3. استخدام Vercel للـ Frontend

### س: هل البيانات آمنة؟

**ج:** نعم! Railway يوفر:
- ✅ HTTPS encryption
- ✅ Database backups
- ✅ Private networking
- ✅ Secrets management

---

## 📞 الدعم والمساعدة

### إذا واجهت مشكلة:

1. **تحقق من Logs**:
```bash
Railway → Service → Logs
```

2. **ابحث في الوثائق**:
```bash
Railway Docs: https://docs.railway.app
```

3. **Discord Support**:
```bash
Railway Discord: https://discord.gg/railway
```

---

## 🎉 خلصنا!

الآن منصتك التعليمية جاهزة ومنشورة على الإنترنت!

**شارك رابطك:**
```
https://your-app.railway.app
```

**بالتوفيق! 🚀**

---

**ملاحظة مهمة:**
لا تنسى إضافة `OPENAI_API_KEY` إذا كنت تريد تفعيل الـ AI Chatbot!

```bash
# احصل على API Key من:
https://platform.openai.com/api-keys

# ثم أضفه في Railway Variables:
OPENAI_API_KEY=sk-proj-your-key-here
```
