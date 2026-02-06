# Ứng Dụng Quản Lý Công Việc (Task Management App)
## Báo Cáo Tiến Độ Chi Tiết: Giai Đoạn (Tuần 1-3)

**Thời gian thực hiện**: 15/01/2026 - 06/02/2026
**Người thực hiện**:
1. Nguyễn Sỹ Đồng MSSV: 22010021


---

### 📋 Mục Lục
1.  [Tổng Quan Dự Án & Công Nghệ](#1-tổng-quan-dự-án--công-nghệ)
2.  [Chi Tiết Triển Khai Tuần 1: Khởi Tạo & Database](#2-tuần-1-khởi-tạo-hệ-thống--cơ-sở-dữ-liệu)
3.  [Chi Tiết Triển Khai Tuần 2: Backend API & Authentication](#3-tuần-2-backend-services--api-implementation)
4.  [Chi Tiết Triển Khai Tuần 3: Frontend & Real-time Integration](#4-tuần-3-frontend-interface--real-time-core)
5.  [Vấn Đề Kỹ Thuật & Giải Pháp (Technical Challenges)](#5-thách-thức-kỹ-thuật--giải-pháp)
6.  [Kết Quả Đạt Được & Hướng Phát Triển](#6-kết-quả--lộ-trình-tiếp-theo)

---

# 1. Tổng Quan Dự Án & Công Nghệ

Dự án phát triển một ứng dụng quản lý công việc theo mô hình **Kanban Board** (tương tự Trello), cho phép người dùng tạo bảng, danh sách, thẻ công việc và tương tác thời gian thực với các thành viên khác.

### Kiến Trúc Hệ Thống (Architecture)
Hệ thống sử dụng kiến trúc **Client-Server** tách biệt (Decoupled Architecture), giao tiếp qua RESTful API cho các tác vụ chuẩn và WebSocket cho các tác vụ thời gian thực.

| Phân Lớp | Công Nghệ | Phiên Bản | Vai Trò |
| :--- | :--- | :--- | :--- |
| **Frontend** | React.js | v18.2 | Xây dựng giao diện người dùng (Single Page Application) |
| | Vite | v5.0 | Build tool siêu tốc (thay thế Webpack) |
| | Tailwind CSS | v3.4 | Utility-first CSS framework để styling nhanh chóng |
| | @dnd-kit | v6.1 | Thư viện chuyên dụng cho Drag & Drop (nhẹ, hỗ trợ touch) |
| **Backend** | Node.js | v18+ | Runtime environment |
| | Express.js | v4.18 | Web framework xử lý routing và middleware |
| | Socket.io | v4.7 | Real-time engine (WebSocket wrapper) |
| **Database** | MongoDB | v6.0 | NoSQL Database lưu trữ dữ liệu dạng Document (JSON-like) |
| | Mongoose | v8.0 | ODM (Object Data Modeling) quản lý Schema |

---

# 2. Tuần 1: Khởi Tạo Hệ Thống & Cơ Sở Dữ Liệu
**Giai đoạn nền tảng**: Quyết định cấu trúc dự án và thiết kế schema dữ liệu.

### 2.1 Cấu Trúc Dự Án (Monorepo-like)
Tổ chức code theo mô hình **MVC (Model-View-Controller)** phía Backend để dễ dàng mở rộng bảo trì.

```
project-root/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components (Reusable)
│   │   ├── services/       # API Services & Socket Logic
│   │   ├── context/        # React Context (Auth, Socket)
│   │   └── pages/          # Page Views (Login, Dashboard, Board)
└── server/                 # Node.js Backend
    ├── src/
    │   ├── config/         # DB Connection, Env Variables
    │   ├── controllers/    # Business Logic (Xử lý request)
    │   ├── models/         # Mongoose Schemas (Định nghĩa DB)
    │   ├── routes/         # Express Routes (API Endpoints)
    │   └── sockets/        # Socket.io Event Handlers
```

### 2.2 Thiết Kế Database (Mongoose Schemas)
Sử dụng MongoDB với Mongoose để tận dụng tính linh hoạt của NoSQL nhưng vẫn đảm bảo tính chặt chẽ của dữ liệu.

*   **User Schema**:
    *   Lưu trữ thông tin người dùng. `password` không lưu plain-text mà được hash bằng `bcryptjs` trước khi lưu (`pre-save hook`).
*   **Board Schema**:
    *   `columns`: Array các `ObjectId` tham chiếu đến Collection `Columns` -> Giúp xác định thứ tự của các cột trong bảng.
*   **Column & Card Schema**:
    *   Thiết kế tham chiếu ngược (Bi-directional Reference): `Column` chứa mảng `cardIds` để sắp xếp thứ tự thẻ, trong khi `Card` chứa `columnId` để biết mình thuộc cột nào.

---

# 3. Tuần 2: Backend Services & API Implementation
**Giai đoạn logic nghiệp vụ**: Xây dựng API và cơ chế bảo mật.

### 3.1 Authentication & Security (Xác thực)
*   **Cơ chế**: JWT (JSON Web Token).
*   **Luồng hoạt động**:
    1.  User đăng nhập -> Server xác thực -> Trả về `accessToken`.
    2.  Client lưu Token (localStorage/cookie).
    3.  Các request tiếp theo gửi kèm Token trong Header: `Authorization: Bearer <token>`.
*   **Middleware (`authMiddleware`)**: Chặn các request không có Token hợp lệ, bảo vệ các API private.

### 3.2 Key RESTful APIs
Chúng tôi đã triển khai đầy đủ các thao tác CRUD. Một số API quan trọng:

*   `POST /api/auth/register`: Đăng ký tài khoản.
*   `GET /api/boards`: Lấy danh sách bảng của user hiện tại.
*   `GET /api/boards/:id`: Lấy chi tiết bảng (**Sử dụng `populate` của Mongoose để lấy luôn danh sách Columns và Cards lồng nhau** - Giảm số lượng request từ Client).
*   `PUT /api/cards/reorder`: API cập nhật vị trí thẻ sau khi kéo thả.
    *   *Payload*: `{ cardId, newColumnId, newIndex, oldColumnId }`.
    *   *Logic*: Cập nhật mảng `cardIds` trong `Column` cũ và mới.

### 3.3 Socket.io Integration (Real-time Core)
Thiết lập Server Socket để lắng nghe và phát sự kiện.
*   **Room Architecture**: Mỗi Board là một "Room".
    ```javascript
    // Khi user vào bảng
    socket.on('join-board', (boardId) => {
        socket.join(boardId); // User tham gia vào room tương ứng
    });
    ```
*   **Broadcasting**: Khi có thay đổi (ví dụ: kéo thẻ), Server gửi sự kiện cho **tất cả mọi người trong Room ngoại trừ người gửi** (`socket.to(boardId).emit(...)`).

---

# 4. Tuần 3: Frontend Interface & Real-time Core
**Giai đoạn thách thức nhất**: Xử lý giao diện động và đồng bộ thời gian thực.

### 4.1 Drag & Drop với @dnd-kit
Thay vì sử dụng HTML5 Drag & Drop API (vốn hạn chế và khó tùy biến), chúng tôi chọn **@dnd-kit** vì:
*   Hỗ trợ cảm ứng (Mobile/Tablet friendly).
*   Kiến trúc hooks hiện đại (`useDraggable`, `useDroppable`).
*   Khả năng tùy biến giao diện khi đang kéo (DragOverlay).

**Chi tiết triển khai**:
*   Sử dụng `SortableContext` cho các cột (ngang) và các thẻ (dọc).
*   Thuat toán va chạm: `closestCorners` để xác định vị trí thả chính xác nhất.
*   **Optimistic Updates**: Khi người dùng thả thẻ:
    1.  **Ngay lập tức** cập nhật State của React để UI hiển thị vị trí mới -> Cảm giác "instant".
    2.  Gọi API cập nhật ngầm.
    3.  Emit sự kiện Socket để báo cho người khác.
    4.  Nếu API lỗi -> Rollback về trạng thái cũ (Cơ chế an toàn).

### 4.2 Real-time Client Integration
Tạo Custom Hook `useBoardSocket` để đóng gói logic Socket:
*   Tự động Connect khi Component Mount.
*   Tự động Disconnect/Leave Room khi Component Unmount (Tránh memory leak).
*   Lắng nghe sự kiện:
    *   `card:moved`: Nhận tọa độ mới -> Cập nhật Redux/State -> Thẻ tự động bay về vị trí mới trên màn hình người khác.

### 4.3 Styling với Tailwind CSS
Sử dụng Tailwind để style nhanh chóng theo hệ thống Design System:
*   **Responsive**: Giao diện tự thích ứng với Mobile/Desktop.
*   **Custom Config**: Đã cấu hình lại `tailwind.config.js` để quét đúng các file `.jsx` trong thư mục `src/`, khắc phục lỗi mất CSS ban đầu.
*   **Dark Mode**: (Đang phát triển nền tảng để hỗ trợ).

---

# 5. Thách Thức Kỹ Thuật & Giải Pháp

1.  **Vấn đề**: Socket connection không ổn định khi mạng yếu.
    *   *Giải pháp*: Cấu hình `reconnection: true` và hiển thị status visual (Đèn xanh/đỏ) trên UI để người dùng biết trạng thái.
2.  **Vấn đề**: "Flickering" (Nhấp nháy) khi kéo thẻ.
    *   *Giải pháp*: Sử dụng `DragOverlay` của @dnd-kit để vẽ một bản sao của thẻ đang kéo (Ghost element), trong khi thẻ gốc được ẩn đi (`opacity: 0.5`).
3.  **Vấn đề**: API lấy dữ liệu bảng quá chậm do phải query nhiều bảng (Board -> Column -> Card).
    *   *Giải pháp*: Tối ưu Mongoose Query với `populate` lồng nhau chính xác và đánh Index cho `boardId` trong Cards Collection.

---

# 6. Kết Quả & Lộ Trình Tiếp Theo

### Kết quả Tuần 1-3:
*    Hệ thống Backend vững chắc, API Clean.
*    Frontend mượt mà, không reload trang.
*    Tính năng Real-time hoạt động ổn định (độ trễ < 100ms trong mạng LAN).

### Kế hoạch Tuần 4 (Dự kiến):
*   Tính năng **Thành viên & Phân quyền**:
    *   Mời thành viên qua email.
    *   Chia quyền (Admin/Editor/Viewer).
*   **UX Improvements**:
    *   Thêm Loading Skeletons.
    *   Toast Notifications (Thông báo góc màn hình khi có lỗi/thành công).
*   **Deployment**: Đưa ứng dụng lên môi trường Production.
