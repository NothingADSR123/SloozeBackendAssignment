# Easy Testing Guide - Using JSON Files

This is the EASIEST way to test the API on Windows PowerShell.

## Step-by-Step Testing

### 1. Register Admin
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "@test-data/register-admin.json"
```

### 2. Register Manager (India)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "@test-data/register-manager-india.json"
```

### 3. Register Member (India)
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "@test-data/register-member-india.json"
```

### 4. Login as Admin
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "@test-data/login-admin.json"
```
**COPY THE TOKEN FROM RESPONSE!**

Example response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### 5. Login as Manager
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "@test-data/login-manager-india.json"
```
**COPY THE TOKEN!**

### 6. Login as Member
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "@test-data/login-member-india.json"
```
**COPY THE TOKEN!**

---

## Now Test with Tokens

Replace `YOUR_TOKEN` with the actual token you copied.

### 7. Create Order (as Member)
```powershell
curl.exe -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_MEMBER_TOKEN" -d "@test-data/create-order.json"
```
**COPY THE ORDER ID (_id field) FROM RESPONSE!**

### 8. View All Orders
```powershell
curl.exe -X GET http://localhost:5000/api/orders -H "Authorization: Bearer YOUR_MEMBER_TOKEN"
```

### 9. Try to Place Order as Member (SHOULD FAIL ❌)
Replace `ORDER_ID` with the actual order ID:
```powershell
curl.exe -X POST http://localhost:5000/api/orders/ORDER_ID/place -H "Authorization: Bearer YOUR_MEMBER_TOKEN"
```
**Expected: "Access denied. Members cannot place orders."**

### 10. Place Order as Manager (SHOULD SUCCEED ✅)
```powershell
curl.exe -X POST http://localhost:5000/api/orders/ORDER_ID/place -H "Authorization: Bearer YOUR_MANAGER_TOKEN"
```
**Expected: Status changes to "PLACED"**

### 11. Try to Update Payment as Manager (SHOULD FAIL ❌)
```powershell
curl.exe -X PATCH http://localhost:5000/api/orders/ORDER_ID/payment -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_MANAGER_TOKEN" -d "@test-data/update-payment.json"
```
**Expected: "Access denied. Only Admin can update payment method."**

### 12. Update Payment as Admin (SHOULD SUCCEED ✅)
```powershell
curl.exe -X PATCH http://localhost:5000/api/orders/ORDER_ID/payment -H "Content-Type: application/json" -H "Authorization: Bearer YOUR_ADMIN_TOKEN" -d "@test-data/update-payment.json"
```

### 13. Cancel Order as Admin
```powershell
curl.exe -X POST http://localhost:5000/api/orders/ORDER_ID/cancel -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 14. View All Orders as Admin (sees all countries)
```powershell
curl.exe -X GET http://localhost:5000/api/orders -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## Testing Country-Based Access Control

### 15. Register Manager USA
```powershell
curl.exe -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "@test-data/register-manager-usa.json"
```

### 16. Login as Manager USA
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"manager.usa@example.com\",\"password\":\"manager123\"}"
```
Or create a file `test-data/login-manager-usa.json`:
```json
{
  "email": "manager.usa@example.com",
  "password": "manager123"
}
```
Then:
```powershell
curl.exe -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "@test-data/login-manager-usa.json"
```

### 17. Create Order as USA Manager
```powershell
curl.exe -X POST http://localhost:5000/api/orders -H "Content-Type: application/json" -H "Authorization: Bearer USA_MANAGER_TOKEN" -d "@test-data/create-order.json"
```

### 18. Verify Country Filtering
```powershell
# India Manager sees only India orders
curl.exe -X GET http://localhost:5000/api/orders -H "Authorization: Bearer INDIA_MANAGER_TOKEN"

# USA Manager sees only America orders
curl.exe -X GET http://localhost:5000/api/orders -H "Authorization: Bearer USA_MANAGER_TOKEN"

# Admin sees ALL orders from both countries
curl.exe -X GET http://localhost:5000/api/orders -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## Quick Summary

✅ **What Works:**
- All roles can register and login
- All roles can create orders
- All roles can view restaurants (filtered by country)
- Admin & Manager can place orders
- Admin & Manager can cancel orders
- Only Admin can update payment methods
- Managers & Members only see their country's data
- Admin sees everything

❌ **What Should Fail:**
- Member trying to place order
- Member trying to cancel order
- Manager trying to update payment method
- Manager trying to access other country's data

---

## Health Check
```powershell
curl.exe -X GET http://localhost:5000/api/health
```

---

## Tips

1. **Save your tokens** - Write them down or save to a text file
2. **Save order IDs** - You'll need them for place/cancel/update operations
3. **Check responses** - Look for "success": true or false
4. **Use @ symbol** - The `@` before filename tells curl to read from file

---

## If You Still Have Issues

Use PowerShell's native `Invoke-RestMethod`:

```powershell
# Register Admin
$body = Get-Content test-data/register-admin.json -Raw
Invoke-RestMethod -Uri "http://localhost:5000/api/auth/register" -Method Post -Body $body -ContentType "application/json"

# Login
$body = Get-Content test-data/login-admin.json -Raw
$response = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method Post -Body $body -ContentType "application/json"
$token = $response.data.token
Write-Host "Token: $token"

# Create Order
$headers = @{ Authorization = "Bearer $token" }
$body = Get-Content test-data/create-order.json -Raw
$order = Invoke-RestMethod -Uri "http://localhost:5000/api/orders" -Method Post -Headers $headers -Body $body -ContentType "application/json"
$orderId = $order.data._id
Write-Host "Order ID: $orderId"

# Place Order
Invoke-RestMethod -Uri "http://localhost:5000/api/orders/$orderId/place" -Method Post -Headers $headers
```
