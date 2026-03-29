# Testing After Deployment

## Quick Health Check

Once deployed, replace `http://localhost:5000` with your deployed URL (e.g., `https://your-app.herokuapp.com` or `https://your-domain.com`)

### 1. Health Check
```bash
curl https://your-deployed-url.com/api/health
```
**Expected:** `{"success":true,"message":"Server is running",...}`

---

## Complete Deployment Test

### Step 1: Register Admin
```bash
curl -X POST https://your-deployed-url.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@example.com","password":"admin123","role":"Admin","country":"India"}'
```

### Step 2: Login
```bash
curl -X POST https://your-deployed-url.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```
**Copy the token from response**

### Step 3: Create Order
```bash
curl -X POST https://your-deployed-url.com/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"items":[{"name":"Test Item","price":100,"quantity":1}]}'
```
**Copy the order ID**

### Step 4: Place Order
```bash
curl -X POST https://your-deployed-url.com/api/orders/ORDER_ID/place \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 5: Get Orders
```bash
curl -X GET https://your-deployed-url.com/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## What to Check After Deployment

✅ **Must Work:**
1. Health endpoint returns 200
2. User registration works
3. Login returns JWT token
4. Protected routes require authentication
5. Role-based access control works
6. Country filtering works
7. Database connection is successful

❌ **Common Issues:**

### Issue 1: 500 Server Error
- **Cause:** MongoDB connection failed
- **Fix:** Check `MONGODB_URI` in environment variables

### Issue 2: 401 Unauthorized
- **Cause:** JWT secret mismatch or missing
- **Fix:** Ensure `JWT_SECRET` is set in production environment

### Issue 3: CORS Errors (if testing from browser)
- **Cause:** CORS not configured for your domain
- **Fix:** Update CORS settings in `src/server.js`

### Issue 4: Routes return 404
- **Cause:** Base URL incorrect
- **Fix:** Ensure you're using `/api/` prefix in all routes

---

## Environment Variables Checklist

Before deploying, ensure these are set:

```env
PORT=5000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food-ordering
JWT_SECRET=your_production_secret_key_min_32_chars
JWT_EXPIRE=7d
NODE_ENV=production
```

---

## Deployment Platforms

### Heroku
```bash
# Set environment variables
heroku config:set MONGODB_URI="your_mongodb_uri"
heroku config:set JWT_SECRET="your_secret"
heroku config:set NODE_ENV=production

# Deploy
git push heroku main

# Test
curl https://your-app.herokuapp.com/api/health
```

### Render
1. Connect GitHub repo
2. Set environment variables in dashboard
3. Deploy automatically
4. Test: `curl https://your-app.onrender.com/api/health`

### Railway
1. Connect GitHub repo
2. Add environment variables
3. Deploy
4. Test: `curl https://your-app.railway.app/api/health`

### AWS/DigitalOcean/VPS
1. SSH into server
2. Clone repo
3. Create `.env` file with production values
4. Run `npm install`
5. Use PM2 to keep app running:
```bash
npm install -g pm2
pm2 start src/server.js --name food-ordering-api
pm2 save
pm2 startup
```

---

## Quick Test Script

Save this as `test-deployment.sh`:

```bash
#!/bin/bash

BASE_URL="https://your-deployed-url.com"

echo "Testing Health..."
curl $BASE_URL/api/health

echo "\n\nRegistering Admin..."
REGISTER_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Admin","email":"test@example.com","password":"test123","role":"Admin","country":"India"}')
echo $REGISTER_RESPONSE

echo "\n\nLogging in..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}')
echo $LOGIN_RESPONSE

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "\n\nToken: $TOKEN"

echo "\n\nCreating Order..."
ORDER_RESPONSE=$(curl -s -X POST $BASE_URL/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"items":[{"name":"Test","price":100,"quantity":1}]}')
echo $ORDER_RESPONSE

echo "\n\nAll tests completed!"
```

Run: `bash test-deployment.sh`

---

## Monitoring After Deployment

### Check Logs
- **Heroku:** `heroku logs --tail`
- **Render:** View logs in dashboard
- **PM2:** `pm2 logs food-ordering-api`

### Monitor Uptime
- Use services like UptimeRobot or Pingdom
- Set up alerts for downtime

### Database Monitoring
- Check MongoDB Atlas metrics
- Monitor connection count
- Check query performance



## Quick Verification Commands

```bash
# Replace YOUR_URL with actual deployed URL

# 1. Health
curl https://YOUR_URL/api/health

# 2. Register
curl -X POST https://YOUR_URL/api/auth/register -H "Content-Type: application/json" -d '{"name":"Admin","email":"admin@test.com","password":"admin123","role":"Admin","country":"India"}'

# 3. Login
curl -X POST https://YOUR_URL/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@test.com","password":"admin123"}'

# 4. Create Order (use token from step 3)
curl -X POST https://YOUR_URL/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer TOKEN" -d '{"items":[{"name":"Test","price":100,"quantity":1}]}'

# 5. Get Orders
curl -X GET https://YOUR_URL/api/orders -H "Authorization: Bearer TOKEN"
```

If all 5 commands work, your deployment is successful! ✅
