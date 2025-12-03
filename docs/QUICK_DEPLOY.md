# 🚀 دليل النشر السريع - Deploy to Production

## الخيارات المتاحة للنشر المجاني

### ✨ الخيار الموصى به: Railway.app (الأسهل)

**المميزات:**
- نشر Frontend + Backend + Database معاً
- 500 ساعة مجانية شهرياً
- رابط فوري بعد النشر
- دعم Docker
- سهل جداً

**الخطوات:**

#### 1. إنشاء حساب على Railway

```bash
# قم بزيارة
https://railway.app

# سجل باستخدام GitHub
```

#### 2. تثبيت Railway CLI (اختياري)

```bash
# باستخدام npm
npm install -g @railway/cli

# تسجيل الدخول
railway login
```

#### 3. النشر من GitHub

1. اذهب إلى https://railway.app/new
2. اختر "Deploy from GitHub repo"
3. اختر مستودع `Learning`
4. Railway سيكتشف المشروع تلقائياً

#### 4. إضافة قاعدة البيانات

```bash
# في لوحة التحكم Railway
1. انقر على "New" → "Database" → "PostgreSQL"
2. سيتم إنشاء قاعدة البيانات تلقائياً
3. Railway سيضيف DATABASE_URL تلقائياً
```

#### 5. إعداد متغيرات البيئة

في لوحة التحكم Railway → Variables:

```env
NODE_ENV=production
JWT_SECRET=أنشئ_سر_قوي_هنا_64_حرف
JWT_REFRESH_SECRET=أنشئ_سر_مختلف_هنا_64_حرف
OPENAI_API_KEY=sk-your-openai-key

# Frontend URL (سيتم توفيره بعد النشر)
CORS_ORIGIN=https://your-app.railway.app
NEXT_PUBLIC_API_URL=https://your-backend.railway.app

# OAuth (اختياري)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

#### 6. رابط المنصة

بعد النشر، ستحصل على:
```
Frontend: https://your-app-name.railway.app
Backend: https://your-backend.railway.app
```

---

## 🎯 الخيار الثاني: Vercel (Frontend) + Render (Backend)

### A. نشر Frontend على Vercel

#### 1. إنشاء حساب Vercel

```bash
# زيارة
https://vercel.com

# تسجيل الدخول بـ GitHub
```

#### 2. نشر Frontend

```bash
# من مجلد Frontend
cd frontend

# تثبيت Vercel CLI
npm install -g vercel

# النشر
vercel

# اتبع التعليمات:
# - اختر Yes للمشروع الجديد
# - Root: ./frontend
# - Build Command: npm run build
# - Output Directory: .next
```

#### 3. إعداد متغيرات البيئة في Vercel

في لوحة التحكم → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXTAUTH_URL=https://your-app.vercel.app
NEXTAUTH_SECRET=أنشئ_سر_قوي
```

### B. نشر Backend على Render

#### 1. إنشاء حساب Render

```bash
https://render.com
```

#### 2. إنشاء Web Service

1. انقر "New +" → "Web Service"
2. ربط GitHub repository
3. إعدادات:
   - **Name**: codelearn-backend
   - **Environment**: Docker
   - **Region**: اختر أقرب منطقة
   - **Branch**: main
   - **Dockerfile Path**: backend/Dockerfile

#### 3. إضافة PostgreSQL

1. انقر "New +" → "PostgreSQL"
2. النسخة المجانية كافية للبداية
3. انسخ "Internal Database URL"

#### 4. متغيرات البيئة في Render

```env
DATABASE_URL=postgresql://... (من PostgreSQL)
NODE_ENV=production
JWT_SECRET=سر_قوي_64_حرف
JWT_REFRESH_SECRET=سر_مختلف_64_حرف
OPENAI_API_KEY=sk-your-key
CORS_ORIGIN=https://your-app.vercel.app
```

#### 5. تشغيل Migrations

في Render → Shell:

```bash
cd backend
npx prisma migrate deploy
npx prisma db seed
```

---

## 🔥 الخيار الأسرع: Deployment Script تلقائي

لقد أنشأت لك سكريبت نشر تلقائي!

### استخدام السكريبت

```bash
# امنح الصلاحيات
chmod +x scripts/deploy.sh

# نشر على Railway
./scripts/deploy.sh railway

# أو نشر على Render
./scripts/deploy.sh render
```

---

## 📱 الروابط بعد النشر

بعد إتمام النشر، ستحصل على:

### Railway
```
✅ Frontend: https://codelearn-frontend.railway.app
✅ Backend: https://codelearn-backend.railway.app
✅ Database: متصلة تلقائياً
```

### Vercel + Render
```
✅ Frontend: https://codelearn.vercel.app
✅ Backend: https://codelearn.onrender.com
✅ Database: Render PostgreSQL
```

---

## 🔧 بعد النشر

### 1. اختبار المنصة

```bash
# زيارة الرابط
https://your-app.railway.app

# تسجيل الدخول
Email: student@codelearn.com
Password: student123
```

### 2. إنشاء مفاتيح قوية

```bash
# إنشاء JWT Secret قوي
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# استخدمه في متغيرات البيئة
```

### 3. إعداد OAuth (اختياري)

#### Google OAuth:
1. https://console.cloud.google.com
2. إنشاء OAuth Client
3. Authorized redirect URIs:
   ```
   https://your-app.railway.app/api/auth/callback/google
   ```

#### GitHub OAuth:
1. https://github.com/settings/developers
2. New OAuth App
3. Authorization callback URL:
   ```
   https://your-app.railway.app/api/auth/callback/github
   ```

---

## ⚡ استكشاف الأخطاء

### Backend لا يعمل

```bash
# تحقق من Logs في Railway/Render
# تأكد من:
✅ DATABASE_URL موجود
✅ JWT_SECRET موجود
✅ Port صحيح (Railway يستخدم PORT env variable)
```

### Frontend لا يتصل بـ Backend

```bash
# تحقق من:
✅ NEXT_PUBLIC_API_URL صحيح
✅ CORS_ORIGIN يطابق رابط Frontend
✅ Backend يعمل ويمكن الوصول إليه
```

### Database Migration فشل

```bash
# في Railway/Render Shell:
cd backend
npx prisma migrate reset --force
npx prisma migrate deploy
npx prisma db seed
```

---

## 📊 مقارنة الخيارات

| الميزة | Railway | Vercel + Render | Heroku |
|--------|---------|-----------------|--------|
| **السهولة** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ |
| **المجانية** | 500 ساعة | مجاني | مدفوع |
| **السرعة** | سريع | سريع جداً | متوسط |
| **Database** | مدمج | منفصل | إضافة |
| **الموصى به** | ✅ نعم | ✅ نعم | ❌ مدفوع |

---

## 🎁 نصائح مهمة

### 1. استخدم المتغيرات البيئية الصحيحة

```env
# للإنتاج - NEVER استخدم القيم الافتراضية!
JWT_SECRET="استخدم_سر_قوي_64_حرف_على_الأقل"
DATABASE_URL="من_Railway_أو_Render"
```

### 2. تفعيل HTTPS

```bash
# Railway و Vercel و Render يوفرون HTTPS تلقائياً
# لا حاجة لإعداد إضافي!
```

### 3. مراقبة الأداء

```bash
# في Railway Dashboard:
- تحقق من CPU/Memory usage
- راقب Logs
- تحقق من Database connections
```

### 4. Backup قاعدة البيانات

```bash
# Railway يوفر backups تلقائية
# أو استخدم:
railway db backup
```

---

## 🚀 البدء الآن!

### الطريقة الأسهل (موصى بها):

```bash
# 1. إنشاء حساب على Railway
https://railway.app

# 2. New Project → Deploy from GitHub

# 3. اختر repository: Learning

# 4. إضافة PostgreSQL من Dashboard

# 5. إضافة متغيرات البيئة

# 6. انتظر 3-5 دقائق للنشر

# 7. احصل على رابطك!
https://your-project.railway.app
```

---

## 📞 الدعم

إذا واجهت أي مشكلة:

1. **تحقق من Logs**:
   - Railway: Dashboard → Deployments → Logs
   - Render: Dashboard → Logs
   - Vercel: Dashboard → Deployments → Function Logs

2. **الأخطاء الشائعة**:
   - Database connection: تحقق من DATABASE_URL
   - Build failed: تحقق من package.json
   - 404 errors: تحقق من routes

3. **الموارد**:
   - Railway Docs: https://docs.railway.app
   - Render Docs: https://render.com/docs
   - Vercel Docs: https://vercel.com/docs

---

## ✅ Checklist قبل النشر

- [ ] تم إنشاء حساب Railway/Render/Vercel
- [ ] تم ربط GitHub repository
- [ ] تم إضافة قاعدة البيانات
- [ ] تم إعداد متغيرات البيئة
- [ ] تم إنشاء JWT secrets قوية
- [ ] تم اختبار الرابط المحلي
- [ ] تم تشغيل migrations
- [ ] تم seed البيانات الأولية

---

**الآن أنت جاهز للنشر! 🎉**

اختر Railway للبدء السريع، أو Vercel + Render للأداء الأفضل.

**رابطك سيكون جاهزاً خلال 5 دقائق!** ⚡
