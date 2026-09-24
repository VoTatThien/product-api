# Product API 🚀

RESTful API CRUD cho Product sử dụng **Node.js**, **Express**, **Mongoose**, **MongoDB** và **Docker**.

## 📋 Mục lục

- [Tính năng](#-tính-năng)
- [Cấu trúc dự án](#-cấu-trúc-dự-án)
- [Bắt đầu nhanh](#-bắt-đầu-nhanh)
- [API Endpoints](#-api-endpoints)
- [Docker](#-docker)
- [CI/CD](#-cicd)
- [Triển khai Production](#-triển-khai-production)

## ✨ Tính năng

- CRUD đầy đủ cho Product (pid, pname, price, quantity)
- Mongoose ODM cho MongoDB
- Healthcheck cho cả MongoDB và API
- Docker & Docker Compose
- CI/CD pipeline với GitHub Actions
- Tự động deploy lên Docker Hub

## 📁 Cấu trúc dự án

```
product-api/
├── .env                         # Biến môi trường (không commit)
├── .env.example                 # Ví dụ biến môi trường
├── .dockerignore                # Ignore files khi build Docker
├── .gitignore                   # Ignore files cho Git
├── Dockerfile                   # Dockerize ứng dụng
├── docker-compose.yml           # Docker Compose (development)
├── docker-compose-prod.yaml     # Docker Compose (production - từ Docker Hub)
├── package.json
├── server.js                    # Entry point
├── config/
│   └── db.js                    # Kết nối MongoDB
├── models/
│   └── Product.js               # Mongoose model
├── controllers/
│   └── productController.js     # CRUD logic
├── routes/
│   └── productRoutes.js         # API routes
├── tests/
│   └── product.test.js          # CRUD tests (Jest + Supertest)
└── .github/
    └── workflows/
        ├── productci.yml        # CI pipeline
        └── cd.yml               # CD pipeline (Docker Hub + Deploy)
```

## 🚀 Bắt đầu nhanh

### 1. Clone repository

```bash
git clone https://github.com/<your-username>/product-api.git
cd product-api
```

### 2. Tạo container MongoDB trên Docker

```bash
docker run -d \
  --name nammongodb \
  -p 27017:27017 \
  mongo:7
```

### 3. Cài đặt dependencies

```bash
npm install
```

### 4. Cấu hình .env

```bash
cp .env.example .env
# Chỉnh sửa .env theo nhu cầu
```

### 5. Chạy ứng dụng

```bash
# Development (với nodemon)
npm run dev

# Production
npm start
```

### 6. Chạy tests

```bash
npm test
```

## 📡 API Endpoints

| Method   | Endpoint              | Mô tả                     |
|----------|-----------------------|----------------------------|
| `GET`    | `/api/products`       | Lấy tất cả sản phẩm       |
| `GET`    | `/api/products/:pid`  | Lấy sản phẩm theo pid      |
| `POST`   | `/api/products`       | Tạo sản phẩm mới           |
| `PUT`    | `/api/products/:pid`  | Cập nhật sản phẩm theo pid  |
| `DELETE` | `/api/products/:pid`  | Xóa sản phẩm theo pid       |
| `GET`    | `/health`             | Kiểm tra trạng thái API    |

### Ví dụ request body (POST/PUT):

```json
{
  "pid": "P001",
  "pname": "Laptop Dell XPS 15",
  "price": 1500,
  "quantity": 10
}
```

## 🐳 Docker

### Chạy với Docker Compose (Development)

```bash
docker compose up -d --build
```

### Kiểm tra healthcheck

```bash
# Kiểm tra trạng thái containers
docker compose ps

# Kiểm tra health API
curl http://localhost:3000/health
```

### Dừng containers

```bash
docker compose down
```

## 🔄 CI/CD

### CI Pipeline (`.github/workflows/productci.yml`)

Tự động chạy khi push/PR vào branch `main`:
1. ✅ Cài đặt dependencies
2. ✅ Chạy CRUD tests với MongoDB service
3. ✅ Build Docker image
4. ✅ Verify healthcheck

### CD Pipeline (`.github/workflows/cd.yml`)

Tự động chạy khi push vào branch `main`:
1. ✅ Chạy CI (test + healthcheck)
2. ✅ Build & push image lên Docker Hub
3. ✅ Deploy lên local Docker Engine (self-hosted runner)

### Cấu hình GitHub Secrets

Thêm các secrets sau vào repository Settings → Secrets:

| Secret              | Mô tả                          |
|---------------------|---------------------------------|
| `DOCKERHUB_USERNAME`| Docker Hub username             |
| `DOCKERHUB_TOKEN`   | Docker Hub Access Token         |
| `MONGO_USERNAME`    | MongoDB root username (optional)|
| `MONGO_PASSWORD`    | MongoDB root password (optional)|

## 🏭 Triển khai Production

### Chạy từ Docker Hub trên local Docker Engine

```bash
# Pull và chạy từ Docker Hub
DOCKERHUB_USERNAME=<your-dockerhub-username> \
docker compose -f docker-compose-prod.yaml up -d

# Kiểm tra trạng thái
docker compose -f docker-compose-prod.yaml ps

# Xem logs
docker compose -f docker-compose-prod.yaml logs -f

# Dừng
docker compose -f docker-compose-prod.yaml down
```

## 📝 License

ISC
