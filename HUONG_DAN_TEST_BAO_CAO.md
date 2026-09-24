# 📋 HƯỚNG DẪN TEST TỪNG BƯỚC CHO BÁO CÁO

> **Repo:** https://github.com/VoTatThien/product-api
> **Project local:** `C:\Users\PC\.gemini\antigravity\scratch\product-api`

> [!IMPORTANT]
> Mở **VS Code** → mở thư mục `C:\Users\PC\.gemini\antigravity\scratch\product-api`
> Mở Terminal (Ctrl + `) → đảm bảo Docker Desktop đang chạy.

---

## 📌 BƯỚC 2: Tạo repository trên GitHub

### Thao tác:
1. Mở trình duyệt → vào https://github.com/VoTatThien/product-api

### 📸 Chụp ảnh:
- Trang chính repo hiển thị danh sách files và commit

---

## 📌 BƯỚC 3: Clone bằng Git Bash trong VS Code

### Thao tác:
1. Trong VS Code → mở Terminal → bấm mũi tên ▼ bên cạnh dấu **+** → chọn **Git Bash**
2. Gõ lệnh:

```bash
git clone https://github.com/VoTatThien/product-api.git
```

```bash
cd product-api
```

```bash
ls -la
```

### 📸 Chụp ảnh:
- Terminal Git Bash hiển thị clone thành công + danh sách files

---

## 📌 BƯỚC 4: Kết nối Docker Desktop với VS Code

### Thao tác:
1. Mở **Docker Desktop** → đảm bảo đang chạy (icon xanh lá ở thanh taskbar)
2. Trong VS Code → sidebar trái → click icon **Docker** (hình con cá voi)
3. Sẽ thấy danh sách Containers, Images, Volumes

### 📸 Chụp 2 ảnh:
- Ảnh 1: Docker Desktop đang chạy
- Ảnh 2: VS Code hiển thị Docker extension với containers

---

## 📌 BƯỚC 5: Tạo container MongoDB `nammongodb`

### Thao tác:
Mở terminal **PowerShell** trong VS Code, chạy:

```powershell
docker ps --filter "name=nammongodb" --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"
```

### Kết quả mong đợi:
```
NAMES        IMAGE     STATUS                   PORTS
nammongodb   mongo:7   Up 7 minutes (healthy)   0.0.0.0:27018->27017/tcp
```

### Nếu chưa có container, chạy lệnh tạo:
```powershell
docker run -d --name nammongodb -p 27018:27017 mongo:7
```

### 📸 Chụp ảnh:
- Terminal hiển thị container nammongodb đang chạy

---

## 📌 BƯỚC 6: Test CRUD API

> [!NOTE]
> API đang chạy trên Docker Compose ở `http://localhost:3000`
> Nếu cần restart: `docker compose up -d --build`

### 6.1 — Health Check

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

**Kết quả:**
```
StatusCode: 200
Content: {"status":"OK","service":"product-api","database":"connected","timestamp":"..."}
```

📸 **Chụp ảnh**

---

### 6.2 — CREATE (Tạo sản phẩm)

```powershell
$body = '{"pid":"P001","pname":"Laptop Dell XPS 15","price":1500,"quantity":10}'
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Body $body -ContentType "application/json" -UseBasicParsing
```

**Kết quả:** `StatusCode: 201`

```powershell
$body2 = '{"pid":"P002","pname":"MacBook Pro M3","price":2500,"quantity":5}'
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -Method POST -Body $body2 -ContentType "application/json" -UseBasicParsing
```

**Kết quả:** `StatusCode: 201`

📸 **Chụp ảnh:** 2 lệnh POST trả về 201

---

### 6.3 — READ (Đọc sản phẩm)

**Lấy tất cả:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing
```

**Kết quả:** `StatusCode: 200` + mảng chứa sản phẩm

**Lấy theo pid:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/products/P001" -UseBasicParsing
```

**Kết quả:** `StatusCode: 200` + thông tin P001

📸 **Chụp ảnh**

---

### 6.4 — UPDATE (Cập nhật sản phẩm)

```powershell
$ubody = '{"pname":"Dell XPS 15 (Updated)","price":1800,"quantity":15}'
Invoke-WebRequest -Uri "http://localhost:3000/api/products/P001" -Method PUT -Body $ubody -ContentType "application/json" -UseBasicParsing
```

**Kết quả:** `StatusCode: 200` + price đổi thành 1800, quantity đổi thành 15

📸 **Chụp ảnh**

---

### 6.5 — DELETE (Xóa sản phẩm)

```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/products/P002" -Method DELETE -UseBasicParsing
```

**Kết quả:** `StatusCode: 200` + `{"message":"Product deleted successfully"}`

**Kiểm tra lại sau khi xóa:**
```powershell
Invoke-WebRequest -Uri "http://localhost:3000/api/products" -UseBasicParsing
```

**Kết quả:** Chỉ còn P001 (đã cập nhật), không còn P002

📸 **Chụp ảnh:** Lệnh DELETE + GET ALL sau khi xóa

---

## 📌 BƯỚC 7: Dockerize (Dockerfile)

### Thao tác:
```powershell
docker images --filter "reference=product-api*" --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}"
```

**Kết quả:**
```
REPOSITORY                TAG       SIZE
product-api-product-api   latest    154MB
product-api               latest    154MB
```

### Xem nội dung Dockerfile:
```powershell
cat Dockerfile
```

📸 **Chụp 2 ảnh:**
- Ảnh 1: Docker image đã build
- Ảnh 2: Nội dung Dockerfile

---

## 📌 BƯỚC 8: Docker Compose

### Thao tác:
```powershell
docker compose ps
```

**Kết quả:**
```
NAME          IMAGE                     SERVICE       STATUS                   PORTS
nammongodb    mongo:7                   nammongodb    Up X minutes (healthy)   0.0.0.0:27018->27017/tcp
product-api   product-api-product-api   product-api   Up X minutes (healthy)   0.0.0.0:3000->3000/tcp
```

### Xem nội dung docker-compose.yml:
```powershell
cat docker-compose.yml
```

📸 **Chụp 2 ảnh:**
- Ảnh 1: `docker compose ps` hiển thị 2 services healthy
- Ảnh 2: Nội dung docker-compose.yml

---

## 📌 BƯỚC 9: Healthcheck MongoDB + Product API

### Thao tác:
```powershell
Write-Host "=== MongoDB Healthcheck ==="
docker inspect nammongodb --format "{{.State.Health.Status}}"

Write-Host "=== Product API Healthcheck ==="
docker inspect product-api --format "{{.State.Health.Status}}"

Write-Host "=== API Health Endpoint ==="
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

**Kết quả mong đợi:**
```
=== MongoDB Healthcheck ===
healthy
=== Product API Healthcheck ===
healthy
=== API Health Endpoint ===
StatusCode: 200
Content: {"status":"OK","service":"product-api","database":"connected",...}
```

📸 **Chụp ảnh:** Cả 3 kết quả healthy

---

## 📌 BƯỚC 10: CI Pipeline (productci.yml)

### Thao tác:
1. Mở trình duyệt → https://github.com/VoTatThien/product-api/actions
2. Click vào workflow run **"Product API - CI Pipeline"**
3. Click vào job **"Lint, Build & Test"** để xem chi tiết các steps

### Xem file CI trên GitHub:
- https://github.com/VoTatThien/product-api/blob/main/.github/workflows/productci.yml

### Hoặc xem local:
```powershell
cat .github/workflows/productci.yml
```

📸 **Chụp 3 ảnh:**
- Ảnh 1: Trang Actions hiển thị workflow
- Ảnh 2: Chi tiết các steps (test pass, build pass, healthcheck pass)
- Ảnh 3: Nội dung file productci.yml

---

## 📌 BƯỚC 11: Jest CRUD Tests

### Thao tác:
```powershell
$env:NODE_ENV="test"
$env:MONGO_URI="mongodb://admin:admin123@localhost:27018/productdb_test?authSource=admin"
npx jest --forceExit --detectOpenHandles --verbose
```

### Kết quả mong đợi (14/14 PASS):
```
PASS tests/product.test.js
  Product API CRUD Tests
    POST /api/products
      √ should create a new product (117 ms)
      √ should return 400 if pid already exists (29 ms)
      √ should return 400 if required fields are missing (26 ms)
      √ should return 400 if price is negative (21 ms)
    GET /api/products
      √ should return an empty array when no products exist (17 ms)
      √ should return all products (27 ms)
    GET /api/products/:pid
      √ should return a single product by pid (21 ms)
      √ should return 404 if product not found (16 ms)
    PUT /api/products/:pid
      √ should update an existing product (28 ms)
      √ should return 404 if product to update not found (18 ms)
      √ should return 400 if update data is invalid (17 ms)
    DELETE /api/products/:pid
      √ should delete an existing product (30 ms)
      √ should return 404 if product to delete not found (16 ms)
    GET /health
      √ should return health status (14 ms)

Test Suites: 1 passed, 1 total
Tests:       14 passed, 14 total
```

📸 **Chụp ảnh:** Toàn bộ output 14/14 PASS

---

## 📌 BƯỚC 12: CD với Docker Hub

### Thao tác:

#### 12.1 — Tạo Docker Hub Access Token:
1. Mở https://hub.docker.com → đăng nhập
2. Vào **Account Settings** → **Security** → **New Access Token**
3. Đặt tên: `product-api-github` → Generate
4. **Copy token** (chỉ hiển thị 1 lần!)

#### 12.2 — Thêm GitHub Secrets:
1. Mở https://github.com/VoTatThien/product-api/settings/secrets/actions
2. Click **"New repository secret"**
3. Thêm secret thứ nhất:
   - **Name:** `DOCKERHUB_USERNAME`
   - **Value:** username Docker Hub của bạn
4. Thêm secret thứ hai:
   - **Name:** `DOCKERHUB_TOKEN`
   - **Value:** Access Token vừa copy

#### 12.3 — Trigger CD:
```powershell
git add -A
git commit -m "ci: trigger CD pipeline"
git push origin main
```

#### 12.4 — Xem kết quả:
1. Mở https://github.com/VoTatThien/product-api/actions
2. Chờ workflow **"Product API - CD Pipeline"** chạy xong
3. Kiểm tra Docker Hub: `https://hub.docker.com/r/<username>/product-api`

📸 **Chụp 4 ảnh:**
- Ảnh 1: GitHub Secrets đã thêm (DOCKERHUB_USERNAME + DOCKERHUB_TOKEN)
- Ảnh 2: CD workflow đang chạy/thành công trên GitHub Actions
- Ảnh 3: Chi tiết job CI pass + job CD pass
- Ảnh 4: Docker Hub hiển thị image product-api

---

## 📌 BƯỚC 13: docker-compose-prod.yaml

### Thao tác:
```powershell
cat docker-compose-prod.yaml
```

### Sau khi CD push image lên Docker Hub, test chạy prod:
```powershell
# Dừng compose dev
docker compose down

# Chạy compose prod (thay <username> bằng Docker Hub username thực)
$env:DOCKERHUB_USERNAME="<your-dockerhub-username>"
docker compose -f docker-compose-prod.yaml up -d

# Kiểm tra
docker compose -f docker-compose-prod.yaml ps
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```

📸 **Chụp 2 ảnh:**
- Ảnh 1: Nội dung docker-compose-prod.yaml
- Ảnh 2: `docker compose -f docker-compose-prod.yaml ps` chạy thành công

---

## 📌 BƯỚC 14: Tự động hóa CD

### Thao tác:
Xem file cd.yml → job `deploy-local` sử dụng **self-hosted runner**

```powershell
cat .github/workflows/cd.yml
```

### Giải thích luồng tự động:
```
Developer push code lên main
        ↓
GitHub Actions CI (test + healthcheck)
        ↓ (pass)
GitHub Actions CD (build + push Docker Hub)
        ↓ (pass)  
Self-hosted Runner (pull image + deploy local)
        ↓
Container chạy trên Local Docker Engine
```

📸 **Chụp 2 ảnh:**
- Ảnh 1: File cd.yml hiển thị 3 jobs (ci → cd → deploy-local)
- Ảnh 2: GitHub Actions hiển thị pipeline 3 jobs liên kết

---

## ⚡ LỆNH KHÔI PHỤC NHANH

Nếu Docker tắt hoặc cần restart lại toàn bộ:

```powershell
# 1. Mở Docker Desktop
Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"

# 2. Đợi 30 giây rồi chạy compose
Start-Sleep -Seconds 30
docker compose up -d --build

# 3. Đợi healthy rồi test
Start-Sleep -Seconds 20
docker compose ps
Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing
```
