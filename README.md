# Ứng Dụng Quản Lý Công Việc (Task Management App)
## Báo Cáo Tiến Độ: Tuần 1 & 2
### Triển khai & Kiểm thử Backend
**Ngày báo cáo**: 30/01/2026
**Trạng thái**: Hoàn thành (Completed)
**Người thực hiện**: Nguyễn Sỹ Đồng

---

### Tóm tắt (Executive Summary)
Trong 2 tuần đầu tiên, đội ngũ đã tập trung xây dựng nền tảng **Backend** vững chắc cho ứng dụng. Hệ thống được xây dựng trên kiến trúc **MERN Stack**, ưu tiên khả năng mở rộng (scalability) và tính năng thời gian thực (real-time) ngay từ cốt lõi. Hiện tại, Server đã sẵn sàng với đầy đủ API cho việc xác thực và quản lý công việc, cùng với hệ thống Socket.io hoạt động ổn định.
<!-- slide -->
# 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống tuân theo mô hình **Client-Server** với giao tiếp thời gian thực hai chiều.

### Tech Stack
-   **Runtime Environment**: Node.js
-   **Framework**: Express.js (RESTful API)
-   **Database**: MongoDB (Lưu trữ NoSQL linh hoạt)
-   **ODM**: Mongoose v8.0 (Mô hình hóa dữ liệu)
-   **Real-time Engine**: Socket.io v4.7 (Giao tiếp WebSocket)
-   **Security**: JWT (JSON Web Tokens) & Bcrypt (Mã hóa mật khẩu)

### Luồng Dữ Liệu (Data Flow)
1.  **REST API**: Xử lý các yêu cầu CRUD (Create, Read, Update, Delete) cho Users, Boards, Columns, Cards.
2.  **WebSocket**: Đồng bộ hóa trạng thái giao diện người dùng ngay lập tức (ví dụ: khi kéo thả thẻ).
3.  **Middleware**: `auth`, `errorHandling` đảm bảo tính bảo mật và ổn định.
<!-- slide -->
# 2. Tuần 1: Thiết Lập & Cơ Sở Dữ Liệu

**Mục tiêu**: Xây dựng khung dự án và thiết kế Schema chuẩn xác.

### 2.1 Cấu Trúc Dự Án (Project Structure)
Tổ chức thư mục theo hướng module hóa để dễ bảo trì:
-   `src/config/`: Cấu hình Database, Environment variables.
-   `src/controllers/`: Logic xử lý nghiệp vụ.
-   `src/models/`: Định nghĩa Mongoose Schemas.
-   `src/routes/`: Định tuyến API endpoints.
-   `src/sockets/`: Xử lý sự kiện Real-time.
-   `src/middleware/`: Xác thực và xử lý lỗi tập trung.

### 2.2 Thiết Kế Cơ Sở Dữ Liệu (Database Design)
Các quan hệ (Relationships) được thiết lập chặt chẽ thông qua `ObjectId`.

#### **A. User Model** (`User.js`)
-   `username`: Tên đăng nhập (Unique, Required).
-   `email`: Email xác thực (Unique, Validated regex).
-   `password`: Lưu dưới dạng Hash (Bcrypt).
-   `avatar`: Đường dẫn ảnh đại diện.

#### **B. Board Model** (`Board.js`)
-   `title`: Tên bảng công việc.
-   `owner`: Liên kết tới **User** (Người tạo).
-   `members`: Danh sách **User** được cấp quyền truy cập.
-   `background`: Màu sắc hoặc hình nền bảng.

#### **C. Card & Column Models**
-   **Column Schema**: `title`, `boardId`, `order` (Vị trí sắp xếp).
-   **Card Schema**:
    -   `title`, `description`: Nội dung chính.
    -   `columnId`: Cột chứa thẻ.
    -   `boardId`: Denormalization để truy vấn nhanh.
    -   `assignees`: Danh sách người được giao việc.
    -   `dueDate`: Hạn chót.
    -   `order`: Thứ tự thẻ trong cột.
<!-- slide -->
# 3. Tuần 2: Phát Triển API & Bảo Mật

**Mục tiêu**: Hoàn thiện các chức năng nghiệp vụ cốt lõi.

### 3.1 Xác Thực & Phân Quyền (Authentication)
Sử dụng chiến lược **JWT (JSON Web Token)** để bảo vệ tài nguyên.
-   **Đăng ký/Đăng nhập**: Mã hóa mật khẩu, cấp phát Token có thời hạn.
-   **Middleware `protect`**: Kiểm tra header `Authorization: Bearer <token>` trước khi cho phép truy cập private routes.

### 3.2 Bảng Tổng Hợp API (API Endpoints Summary)

| Phân hệ | Method | Endpoint | Mô tả chi tiết |
| :--- | :--- | :--- | :--- |
| **Auth** | POST | `/api/auth/register` | Đăng ký tài khoản mới & trả về Token |
| | POST | `/api/auth/login` | Đăng nhập & trả về Token |
| | GET | `/api/auth/me` | Lấy thông tin user hiện tại |
| **Boards** | GET | `/api/boards` | Lấy danh sách bảng của User |
| | POST | `/api/boards` | Tạo bảng mới |
| | GET | `/api/boards/:id` | Xem chi tiết bảng (kèm Columns/Cards) |
| | PUT | `/api/boards/:id` | Cập nhật thông tin bảng |
| | POST | `/api/boards/:id/members` | Thêm thành viên vào bảng |
| **Cards** | POST | `/api/cards` | Tạo thẻ công việc mới |
| | PUT | `/api/cards/:id/move` | **[Quan trọng]** Di chuyển thẻ giữa các cột |

<!-- slide -->
# 4. Tính Năng Thời Gian Thực (Real-time)

Hệ thống Socket.io hoạt động song song với REST API để đảm bảo trải nghiệm mượt mà.

### Cơ Chế Hoạt Động
-   **Namespaces/Rooms**: Mỗi `boardId` được coi là một "Room". Khi user mở bảng, Client emit `join-board`.
-   **Authentication**: Socket handshake cũng yêu cầu JWT để xác thực danh tính người kết nối.

### Các Sự Kiện Chính
1.  **`join-board`**: User tham gia vào room của bảng cụ thể.
2.  **`card:moved`**: Khi User A kéo thả thẻ, Server nhận event và broadcast vị trí mới cho tất cả Users khác trong room.
3.  **`card:created` / `card:updated`**: Đồng bộ dữ liệu thẻ tức thì không cần reload trang.
4.  **`column:added`**: Cột mới xuất hiện ngay lập tức trên màn hình thành viên khác.

<!-- slide -->
# 5. Kết Quả Kiểm Thử (Verification)

Đã thực hiện kiểm thử thủ công (Manual Testing) toàn diện:

### ✅ Kết nối Database
-   MongoDB kết nối thành công qua Mongoose.
-   Schema Validation hoạt động đúng (báo lỗi khi thiếu required fields).

### ✅ API Testing (Postman)
-   Đăng ký/Đăng nhập: Token được sinh ra chính xác.
-   CRUD Board: Tạo bảng, thêm thành viên thành công.
-   Bảo mật: Truy cập route `/api/boards` không có Token bị từ chối (401 Unauthorized).

### ✅ Socket Testing
-   Client giả lập kết nối thành công với Token.
-   User gia nhập đúng room.
-   Sự kiện `card:moved` được emit và nhận phản hồi đúng định dạng.

<!-- slide -->
# 6. Kế Hoạch Tuần Tiếp Theo (Tuần 3)

**Trọng tâm**: Phát triển Frontend (React.js) và Tích hợp.

1.  **Khởi tạo UI**:
    -   Thiết lập dự án React với TailwindCSS (nếu cần) hoặc CSS Modules.
    -   Cấu hình React Router cho điều hướng.
2.  **Authentication Pages**:
    -   Giao diện Login / Register đẹp mắt.
    -   Xử lý lưu trữ Token (LocalStorage/Cookie).
3.  **Dashboard & Kanban View**:
    -   Hiển thị danh sách bảng.
    -   Xây dựng giao diện Drag & Drop (sử dụng thư viện như `dnd-kit` hoặc `react-beautiful-dnd`).
4.  **Tích hợp**:
    -   Kết nối Axios với Backend API.
    -   Lắng nghe sự kiện Socket.io để cập nhật UI.
