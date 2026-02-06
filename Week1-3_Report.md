# Ứng Dụng Quản Lý Công Việc (Task Management App)
## Báo Cáo Tiến Độ Chi Tiết: Giai Đoạn 1 (Tuần 1-3)

**Thời gian thực hiện**: 15/01/2026 - 06/02/2026
**Người thực hiện**:
1. Nguyễn Sỹ Đồng MSSV: 22010021

---

### 📋 Mục Lục
1.  [Tổng Quan Dự Án & Công Nghệ](#1-tổng-quan-dự-án--công-nghệ)
2.  [Chi Tiết Triển Khai Tuần 1: Khởi Tạo & Database](#2-tuần-1-khởi-tạo-hệ-thống--cơ-sở-dữ-liệu)
3.  [Chi Tiết Triển Khai Tuần 2: Backend API & Authentication](#3-tuần-2-backend-services--api-implementation)
4.  [Chi Tiết Triển Khai Tuần 3: Frontend - Authentication & Layout](#4-tuần-3-frontend---authentication--layout)
5.  [Phân Tích Thách Thức Kỹ Thuật (Technical Challenges)](#5-phân-tích-thách-thức-kỹ-thuật-technical-challenges)
6.  [Kết Quả Đạt Được & Kế Hoạch Tuần 4](#6-kết-quả--lộ-trình-tiếp-theo)

---

# 1. Tổng Quan Dự Án & Công Nghệ

Dự án phát triển một ứng dụng quản lý công việc theo mô hình **Kanban Board** (tương tự Trello), cho phép người dùng tạo bảng, danh sách, thẻ công việc nhằm tối ưu hóa quy trình làm việc cá nhân và nhóm.

### Kiến Trúc Hệ Thống (Architecture)
Hệ thống sử dụng kiến trúc **Decoupled Client-Server** (Client và Server tách biệt hoàn toàn), giúp khả năng mở rộng (scalability) và bảo trì (maintainability) tốt hơn so với mô hình MVC truyền thống (Server-side rendering).

| Phân Lớp | Công Nghệ | Phiên Bản | Lợi Ích Cốt Lõi |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js | v18.2 | Component-based, Virtual DOM giúp UI mượt mà. |
| | Vite | v5.0 | Build tool thế hệ mới, HMR (Hot Module Replacement) cực nhanh. |
| | Tailwind CSS | v3.4 | Utility-first CSS, giúp xây dựng giao diện nhanh, dễ tùy biến. |
| **Backend** | Node.js | v18+ | Non-blocking I/O, xử lý đồng thời lượng lớn request. |
| | Express.js | v4.18 | Framework tối giản, mạnh mẽ để xây dựng RESTful API. |
| **Database** | MongoDB | v6.0 | Dữ liệu dạng JSON linh hoạt, scalable. |
| | Mongoose | v8.0 | ODM giúp validate dữ liệu và quản lý Schema chặt chẽ. |

---

# 2. Tuần 1: Khởi Tạo Hệ Thống & Cơ Sở Dữ Liệu

### 2.1 Cấu Trúc Dự Án (Monorepo-like)
Chúng tôi chọn cấu trúc **Monorepo** (chứa cả `client` và `server` trong cùng một repository) để dễ dàng quản lý phiên bản và quy trình triển khai (Deployment).
```
project-root/
├── client/                 # React Frontend (Vite)
│   ├── public/             # Static assets
│   ├── src/                # Source code
│   └── vite.config.js      # Cấu hình Build
└── server/                 # Node.js Backend
    ├── src/
    │   ├── controllers/    # Xử lý Logic nghiệp vụ
    │   ├── models/         # Định nghĩa Schema Database
    │   ├── routes/         # Định tuyến URL
    │   └── config/         # Cấu hình hệ thống (DB, Env)
    └── package.json        # Quản lý dependencies server
```

### 2.2 Thiết Kế Database (Mongoose Schemas)
Việc thiết kế Database đúng đắn ngay từ đầu là yếu tố then chốt.
*   **User Schema**:
    *   Lưu trữ `username`, `email`, `password`.
    *   Sử dụng `bcrypt` salt rounds = 10 để mã hóa mật khẩu, đảm bảo an toàn kể cả khi DB bị lộ.
*   **Board Schema**:
    *   Quản lý danh sách thành viên (`members`) và chủ sở hữu (`owner`).
    *   Chứa mảng `columnOrder` (Array of Strings) để lưu thứ tự các cột mà không cần thay đổi dữ liệu cột.
*   **Column & Card Schema**:
    *   Quan hệ **One-to-Many**: Một Bảng có nhiều Cột, một Cột có nhiều Thẻ.
    *   Thiết kế **Two-way Referencing**: Card lưu `boardId` (để query nhanh tất cả thẻ của bảng) và Column lưu mảng `cardIds` (để sắp xếp thứ tự thẻ).

---

# 3. Tuần 2: Backend Services & API Implementation

### 3.1 Authentication & Authorization (Bảo Mật)
Hệ thống sử dụng chuẩn **JWT (JSON Web Token)** thay vì Session-based để tối ưu cho kiến trúc REST API (Stateless).
1.  **Đăng ký (Register)**: Kiểm tra email trùng lặp -> Hash mật khẩu -> Lưu vào MongoDB.
2.  **Đăng nhập (Login)**: So sánh password hash -> Tạo token có hạn 24h -> Trả về Client.
3.  **Middleware Bảo vệ (`authMiddleware`)**:
    *   Interit mọi request đến các route bảo mật (VD: `/api/boards`).
    *   Verify token từ header `Authorization: Bearer <token>`.
    *   Gắn thông tin User (`req.user`) vào request để các Controller sau đó sử dụng.

### 3.2 RESTful APIs Implementation
Các API được thiết kế tuân thủ các HTTP Methods chuẩn:
*   `POST /api/auth/register`: Tạo tài khoản mới.
*   `POST /api/auth/login`: Xác thực và cấp token.
*   `GET /api/boards`: Lấy danh sách bảng mà User là thành viên.
*   `POST /api/boards`: Tạo bảng mới (mặc định User tạo là Owner).
*   `GET /api/boards/:id`: **API Phức tạp nhất** - Sử dụng `populate()` nhiều cấp của Mongoose để lấy trọn vẹn dữ liệu: Board -> Columns -> Cards, phục vụ việc render toàn bộ bảng chỉ với 1 request.

---

# 4. Tuần 3: Frontend - Authentication & Layout

Tuần 3 tập trung vào việc hiện thực hóa các chức năng Backend lên giao diện người dùng, yêu cầu sự tỉ mỉ trong trải nghiệm người dùng (UX).

### 4.1 Khởi tạo Frontend & Design System
*   **Tại sao Vite?**: Thay vì Create-React-App, Vite giúp thời gian khởi động Server khi dev gần như tức thì, tăng hiệu suất làm việc.
*   **Tailwind CSS Integration**:
    *   Thiết lập file `tailwind.config.js` để tự động quét (scan) các class name trong thư mục `src/**/*.{js,jsx}`.
    *   Tùy biến bảng màu (Color Palette) và Typography để giao diện đồng nhất.

### 4.2 Authentication Flow (Luồng Xác Thực)
Xây dựng hệ thống quản lý trạng thái đăng nhập phía Client:
*   **AuthContext (React Context API)**:
    *   Lưu trữ trạng thái toàn cục `user` (null hoặc object) và `isAuthenticated` (true/false).
    *   Cung cấp các hàm `login()`, `logout()` cho toàn bộ ứng dụng sử dụng.
*   **Persist Login**: Khi user F5 (reload) trang, ứng dụng kiểm tra `localStorage` và tự động set lại state đăng nhập, tránh việc user bị "văng" ra ngoài.
*   **Giao diện Form**:
    *   Component `Login.jsx` và `Register.jsx` được thiết kế tối giản, hiện đại.
    *   Hiển thị thông báo lỗi chi tiết (VD: "Email đã tồn tại", "Mật khẩu sai") trả về từ Backend.

### 4.3 Dashboard & App Layout
*   **Protected Route Pattern**:
    *   Đây là một Higher-Order Component (HOC) quan trọng. Nó bọc lấy các route cần bảo vệ (Dashboard, Board).
    *   Logic: Nếu `isAuthenticated === false` -> Chuyển hướng ngay lập tức về `/login`.
*   **Dashboard View**:
    *   Grid System hiển thị danh sách các Project/Board.
    *   Nút "Create Board" mở ra Modal (Hộp thoại) nhập thông tin nhanh.
*   **Board Structure**:
    *   Chia layout thành 3 phần: Header (Tên bảng, Menu), Sidebar (Cấu hình), và Board Canvas (Nơi chứa các Cột/Thẻ).

---

# 5. Phân Tích Thách Thức Kỹ Thuật (Technical Challenges)

Trong quá trình phát triển 3 tuần đầu, nhóm đã đối mặt và giải quyết các vấn đề sau:

| Vấn đề (Issue) | Nguyên nhân (Root Cause) | Giải pháp (Solution) |
| :--- | :--- | :--- |
| **Tailwind CSS không nhận class** | Cấu hình `content` trong `tailwind.config.js` sai đường dẫn, không bao gồm thư mục `src`. | Điều chỉnh lại glob pattern `content: ["./index.html", "./src/**/*.{js,jsx}"]`. |
| **Vòng lặp chuyển hướng (Redirect Loop)** | Khi `useEffect` trong `useEffect` kiểm tra auth phụ thuộc vào state thay đổi liên tục. | Thiết lập chính xác mảng Dependency `[user, navigate]` và thêm cờ `loading` để đợi quá trình check token hoàn tất. |
| **Hiệu suất API `Get Board`** | Query lồng nhau (Nested Population) quá sâu gây chậm Server. | Chỉ lấy các trường cần thiết (`select`) và đánh Index cho các trường khóa ngoại (`boardId`, `columnId`). |

---

# 6. Kết Quả & Kế Hoạch Tuần 4

### Kết quả Giai đoạn 1 (Tuần 1-3):
*   Toàn bộ hệ thống cơ sở hạ tầng (Database, Server, API) đã đi vào hoạt động ổn định.
*   Khung sườn ứng dụng Client (Layout, Routing, Auth) đã hoàn tất.
*   Người dùng đã có thể thực hiện trọn vẹn quy trình tạo tài khoản và tạo bảng công việc.

### Công việc tiếp theo (Future Work for Week 4):
*   **Nâng cao trải nghiệm tương tác**: Triển khai tính năng **Drag & Drop (Kéo thả)** cho Card và Column. Đây là "trái tim" của ứng dụng Kanban.
*   **Tương tác thời gian thực**: Tích hợp **Socket.io** để khi User A kéo thẻ, màn hình User B cũng tự động cập nhật mà không cần F5.
*   **Hoàn thiện UI**: Thêm các trạng thái Loading skeleton, thông báo Toast (Success/Error).
