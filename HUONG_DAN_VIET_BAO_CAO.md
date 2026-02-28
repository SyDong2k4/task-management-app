# Hướng dẫn viết Báo cáo Đồ án (15–20 trang, PDF)

Dùng tài liệu này để viết báo cáo cho **Ứng dụng Quản lý Công việc (Task Management / Kanban)** trong project này. Mỗi mục tương ứng một phần trong yêu cầu báo cáo.

---

## 1. MỞ ĐẦU (khoảng 1,5–2 trang)

### 1.1 Lý do chọn đề tài
- **Nhu cầu thực tế**: Làm việc nhóm cần công cụ quản lý công việc rõ ràng (Kanban), theo dõi tiến độ, phân công và bình luận trên từng task.
- **Tính ứng dụng**: Ứng dụng kiểu Trello/Kanban được dùng rộng rãi trong doanh nghiệp và học tập; phù hợp để học full-stack và real-time.
- **Mục tiêu học thuật**: Rèn luyện kiến trúc Client–Server, REST API, WebSocket, xác thực (JWT), phân quyền, cơ sở dữ liệu NoSQL và giao diện tương tác (kéo thả).

**Gợi ý viết**: Nêu 2–3 lý do ngắn gọn (1–2 đoạn), có thể thêm số liệu hoặc ví dụ (ví dụ: “theo [nguồn], công cụ quản lý công việc giúp tăng hiệu quả làm việc nhóm…”).

### 1.2 Mục tiêu của ứng dụng
- Cho phép **đăng ký / đăng nhập** và quản lý nhiều **bảng công việc (Board)**.
- Mỗi board có **cột (Column)** và **thẻ (Card)**; hỗ trợ **kéo thả** để sắp xếp cột và di chuyển thẻ giữa các cột.
- **Real-time**: Khi một người thay đổi (thêm/sửa/xóa/thả thẻ), người khác thấy thay đổi ngay không cần reload.
- **Phân quyền kiểu Trello**: Admin (toàn quyền), Member (sửa nội dung), Observer (chỉ xem).
- **Quản lý thành viên**: Mời/xóa thành viên, gán vai trò; bình luận trên thẻ.

**Gợi ý**: Liệt kê 5–7 mục tiêu cụ thể (có thể đánh số), mỗi mục 1–2 câu.

### 1.3 Phạm vi ứng dụng
- **Trong phạm vi**: Web app (React + Node.js), một domain/ứng dụng; quản lý Board/Column/Card/Comment; xác thực JWT; Socket.io cho real-time; phân quyền theo role trên từng board.
- **Ngoài phạm vi**: Ứng dụng mobile riêng, tích hợp Google Calendar/Jira, single sign-on (SSO), backup/restore tự động.

**Gợi ý**: 1 đoạn “Trong phạm vi” và 1 đoạn “Ngoài phạm vi” để giới hạn rõ đề tài.

---

## 2. CƠ SỞ LÝ THUYẾT (khoảng 3–4 trang)

Giải thích **ngắn gọn** các công nghệ/thuật toán đã dùng (đủ để người chấm hiểu, không cần quá sâu).

### 2.1 Kiến trúc tổng quan
- **Client–Server**: Trình duyệt (React) gọi REST API và kết nối WebSocket tới server (Node.js + Express).
- **MERN-style stack**: MongoDB, Express, React, Node.js (không dùng “MERN” nếu không dùng đủ 4; có thể ghi “React + Node.js (Express) + MongoDB”).

### 2.2 REST API là gì?
- REST (Representational State Transfer): kiến trúc API dựa trên HTTP (GET, POST, PUT, DELETE).
- Mỗi tài nguyên (User, Board, Card…) có URL; client gửi request → server trả JSON.
- **Ví dụ trong project**: `GET /api/boards` lấy danh sách board, `POST /api/cards` tạo thẻ mới.

### 2.3 JWT (JSON Web Token)
- Token dạng chuỗi mã hóa chứa thông tin (ví dụ `userId`, `username`); dùng để **xác thực** sau khi đăng nhập.
- **Luồng**: Client gửi username/password → Server kiểm tra, nếu đúng thì tạo JWT và trả về → Client lưu token (localStorage), mỗi request sau gửi kèm header `Authorization: Bearer <token>` → Server giải mã token để biết user nào đang gọi API.
- **Lợi ích**: Stateless (server không lưu session), dễ dùng cho SPA và mobile.

### 2.4 Bcrypt (mã hóa mật khẩu)
- Thuật toán **hash** mật khẩu (một chiều); không lưu mật khẩu gốc.
- Khi đăng nhập: hash mật khẩu nhập vào rồi so sánh với hash trong DB (`bcrypt.compare`).
- **Salt**: Bcrypt tự thêm “muối” để cùng một mật khẩu tạo ra hash khác nhau mỗi lần, chống tấn công dùng bảng sẵn (rainbow table).

### 2.5 WebSocket và Socket.io
- **WebSocket**: Giao thức kết nối hai chiều, liên tục; server có thể **đẩy** dữ liệu tới client mà không cần client gửi request trước.
- **Socket.io**: Thư viện triển khai WebSocket (và fallback); hỗ trợ **room** (phòng): client “join” room theo `boardId`, server “emit” event vào room → mọi client trong room nhận (đồng bộ real-time).
- **Trong project**: Khi user A kéo thẻ, server nhận API rồi `emit('card:moved', data)` vào room board → user B nhận và cập nhật giao diện ngay.

### 2.6 MongoDB và Mongoose
- **MongoDB**: Cơ sở dữ liệu NoSQL, dữ liệu lưu dạng document (JSON-like); linh hoạt schema, dễ mở rộng.
- **Mongoose**: ODM (Object-Document Mapper) cho Node.js; định nghĩa **Schema** (cấu trúc, kiểu dữ liệu, ràng buộc), thao tác CRUD qua model (ví dụ `Board.find()`, `Card.create()`).

### 2.7 React (SPA) và Vite
- **React**: Thư viện xây dựng giao diện bằng component; state thay đổi → giao diện cập nhật (virtual DOM).
- **SPA**: Single Page Application — một trang HTML, điều hướng và tải nội dung bằng JavaScript, không reload toàn trang.
- **Vite**: Công cụ build và dev server cho frontend; nhanh, hỗ trợ ES modules.

### 2.8 Kéo thả (Drag and Drop) – @dnd-kit
- **@dnd-kit**: Thư viện React cho drag & drop; cung cấp `DndContext`, `useSortable`, `SortableContext`.
- **Cách dùng**: Mỗi cột và mỗi thẻ là “sortable item”; khi kéo/thả, thư viện báo `onDragEnd` với `active` (item được kéo) và `over` (vị trí thả) → ứng dụng cập nhật state và gọi API (ví dụ `moveCard`).

### 2.9 Phân quyền theo vai trò (RBAC – Role-Based Access Control)
- Mỗi thành viên trên board có **role**: `admin`, `member`, `observer`.
- **Admin**: Cập nhật board, thêm/xóa/sửa role thành viên, xóa board.
- **Member**: Tạo/sửa/xóa cột, thẻ, bình luận.
- **Observer**: Chỉ xem (GET); không tạo/sửa/xóa.
- **Cách làm**: Server có helper (ví dụ `getBoardWithRole`, `canEdit`, `canManageBoard`); mỗi API (column, card, comment) kiểm tra role trước khi cho phép thao tác.

**Gợi ý**: Mỗi mục 2.2–2.9 khoảng 1/3–1/2 trang (đoạn văn + có thể 1 hình minh họa đơn giản nếu cần). Tổng phần “Cơ sở lý thuyết” khoảng 3–4 trang.

---

## 3. THIẾT KẾ HỆ THỐNG (khoảng 3–4 trang)

### 3.1 Sơ đồ khối (Architecture Diagram)
Vẽ **một sơ đồ** gồm:
- **Client (Browser)**: React App, Axios (HTTP), Socket.io-client.
- **Server**: Node.js + Express (REST API + Socket.io server).
- **Database**: MongoDB.
- Mũi tên: Client ↔ Server (REST + WebSocket), Server ↔ MongoDB.

**Có thể bổ sung**:
- Middleware: Auth (JWT), CORS.
- Luồng: “User đăng nhập → JWT → Gọi API / Join socket room”.

**Công cụ vẽ**: Draw.io, Lucidchart, Excalidraw, hoặc PowerPoint. Xuất ảnh rõ, chèn vào báo cáo và ghi chú thích.

### 3.2 Flowchart hoạt động của ứng dụng
Chọn **2–3 luồng chính** và vẽ flowchart:

1. **Đăng nhập / Đăng ký**
   - Bắt đầu → Nhập email + mật khẩu → Gửi POST `/api/auth/login` (hoặc register) → Server kiểm tra (sai → trả lỗi → Hiển thị lỗi; đúng → Tạo JWT, trả token) → Client lưu token, chuyển tới Dashboard.

2. **Kéo thả thẻ (Move Card)**
   - Bắt đầu → User kéo thẻ và thả (onDragEnd) → Client cập nhật UI (optimistic) → Gọi PUT `/api/cards/:id/move` với `columnId`, `order` → Server cập nhật DB → Server emit `card:moved` vào room → Các client khác nhận và cập nhật UI.

3. **Phân quyền khi mở Board**
   - User mở `/board/:id` → GET `/api/boards/:id` (kèm JWT) → Server tìm board, kiểm tra user thuộc members (hoặc owner) và lấy role → Trả board + `currentUserRole` → Client ẩn/hiện nút (Settings, Invite, Add list/card, Edit/Delete) theo role.

**Gợi ý**: Mỗi flowchart 1 trang (hoặc gộp 2 luồng nhỏ trong 1 trang), dùng hình khối chuẩn (start/end, xử lý, điều kiện, nhập/xuất).

### 3.3 Sơ đồ cơ sở dữ liệu
Thể hiện **các collection (model)** và **quan hệ**:

- **User**: username, email, password (hash), avatar. (Không vẽ password chi tiết, chỉ ghi “password (hashed)”.)
- **Board**: title, description, owner (ref User), members (array of { user (ref User), role }), background.
- **Column**: title, boardId (ref Board), order.
- **Card**: title, description, columnId (ref Column), boardId (ref Board), assignees (ref User[]), dueDate, labels, order, attachments.
- **Comment**: content, cardId (ref Card), author (ref User), createdAt.

Quan hệ: User 1–n Board (owner); Board n–n User (members); Board 1–n Column; Board 1–n Card; Column 1–n Card; Card 1–n Comment; User 1–n Comment.

**Cách vẽ**: ERD (Entity–Relationship) hoặc “collection diagram” (mỗi ô là một collection, mũi tên ref). Có thể dùng Draw.io, dbdiagram.io, hoặc bảng mô tả kèm sơ đồ đơn giản.

---

## 4. KẾT QUẢ THỰC NGHIỆM (khoảng 4–5 trang)

### 4.1 Ảnh chụp màn hình (Screenshot) các chức năng đã chạy được
Liệt kê và chụp màn hình tương ứng (đánh số ảnh, ghi chú ngắn):

| STT | Chức năng | Mô tả ảnh | Ghi chú file ảnh |
|-----|-----------|-----------|-----------------|
| 1 | Đăng ký | Form đăng ký (username, email, password) | `screenshot_01_dang_ky.png` |
| 2 | Đăng nhập | Form đăng nhập, sau khi đăng nhập thành công | `screenshot_02_dang_nhap.png` |
| 3 | Dashboard | Danh sách board, nút tạo board mới | `screenshot_03_dashboard.png` |
| 4 | Board – Kanban | Giao diện board với nhiều cột và thẻ | `screenshot_04_board_kanban.png` |
| 5 | Kéo thả thẻ | Trước/sau khi kéo thẻ sang cột khác (có thể 2 ảnh) | `screenshot_05_drag_drop.png` |
| 6 | Thêm cột / Thêm thẻ | Nút “Add list”, “Add card” và form nhập | `screenshot_06_add_column_card.png` |
| 7 | Chi tiết thẻ (Modal) | Mở một thẻ: tiêu đề, mô tả, bình luận | `screenshot_07_card_modal.png` |
| 8 | Cài đặt Board | Modal Settings: đổi tên, mô tả, màu nền, xóa board | `screenshot_08_board_settings.png` |
| 9 | Thành viên & phân quyền | Danh sách thành viên, nút Invite, chọn role (Member/Observer/Admin) | `screenshot_09_members_roles.png` |
| 10 | Real-time | Hai tab/máy: user A thêm thẻ → user B thấy thẻ mới xuất hiện (chụp 2 màn hình) | `screenshot_10_realtime.png` |

**Gợi ý**: Mỗi ảnh có caption (ví dụ: “Hình 4.1 – Giao diện đăng nhập”). Có thể gộp 2 ảnh nhỏ trong 1 figure để tiết kiệm trang.

### 4.2 Các trường hợp test (Test cases)
Bảng test case **đầu vào – hành vi mong đợi – kết quả (Pass/Fail)**. Ví dụ:

| ID | Mô tả | Đầu vào / Hành động | Kết quả mong đợi | Kết quả |
|----|--------|----------------------|------------------|---------|
| TC01 | Đăng ký – thiếu email | Gửi form không có email | Lỗi validation, thông báo “Please add an email” | Pass |
| TC02 | Đăng ký – email sai định dạng | Email = "abc" | Thông báo email không hợp lệ | Pass |
| TC03 | Đăng ký – mật khẩu &lt; 6 ký tự | Password = "12345" | Thông báo lỗi (minlength) | Pass |
| TC04 | Đăng nhập – sai mật khẩu | Email đúng, password sai | 401 / “Invalid credentials” | Pass |
| TC05 | Đăng nhập – đúng | Email + password đúng | Trả JWT, chuyển tới Dashboard | Pass |
| TC06 | Truy cập board không có token | Gọi GET /api/boards không gửi Authorization | 401 Unauthorized | Pass |
| TC07 | Observer không tạo được cột | User role observer, POST /api/boards/:id/columns | 403, “Observers cannot create columns” | Pass |
| TC08 | Observer không thấy nút Settings | User observer mở board | Nút Settings ẩn | Pass |
| TC09 | Hai user cùng kéo một thẻ | A và B kéo cùng thẻ tới 2 cột khác | Last write wins; user bị ghi đè thấy toast “Vị trí thẻ đã được cập nhật bởi thành viên khác.” | Pass |
| TC10 | Xóa thẻ | Click xóa thẻ trong modal, xác nhận | Thẻ biến mất trên board, socket broadcast cho user khác | Pass |

**Gợi ý**: Khoảng 10–15 test case; có thể thêm cột “Ghi chú” (tool test: Postman / trình duyệt). Phần này khoảng 1–1,5 trang.

### 4.3 Đánh giá độ chính xác (nếu có thể đo lường)
- **Ứng dụng quản lý công việc** chủ yếu là nghiệp vụ (CRUD, phân quyền, real-time), không phải mô hình ML nên không có “độ chính xác” theo nghĩa accuracy/precision.
- Có thể thay bằng:
  - **Độ tin cậy**: Số lần test pass / tổng test case (ví dụ 10/10 = 100%).
  - **Tính đúng nghiệp vụ**: Liệt kê ngắn (ví dụ: “Phân quyền đúng theo role trên mọi API; kéo thả đồng bộ real-time đúng với thiết kế.”).
  - **Hiệu năng đơn giản**: Ví dụ “Thời gian phản hồi API < 500ms trong môi trường local” (nếu có đo).

**Gợi ý**: 1 đoạn ngắn (nửa trang) là đủ; nếu yêu cầu bắt buộc có “độ chính xác” thì dùng “tỷ lệ test pass” hoặc “độ đúng nghiệp vụ” như trên.

---

## 5. KẾT LUẬN & HƯỚNG PHÁT TRIỂN (khoảng 1,5–2 trang)

### 5.1 Đã làm được
- Đăng ký, đăng nhập (JWT, Bcrypt).
- CRUD Board, Column, Card, Comment; kéo thả cột và thẻ (@dnd-kit).
- Real-time qua Socket.io (card:moved, card:created/deleted, column…).
- Phân quyền kiểu Trello (admin, member, observer) trên backend và ẩn/hiện nút trên frontend.
- Quản lý thành viên: mời, xóa, đổi role; chọn role khi mời (Member/Observer/Admin).
- Modal chi tiết thẻ (mô tả, bình luận); tìm kiếm user để mời; cài đặt board (tên, mô tả, nền, xóa board).
- Xử lý khi hai người cùng kéo một thẻ (last write wins + toast thông báo).

### 5.2 Chưa làm được / Hạn chế
- Chưa có ứng dụng mobile (chỉ web).
- Chưa gán assignee/labels/due date đầy đủ trên UI (model có sẵn).
- Chưa đính kèm file (attachments) thực sự (upload lên server/lưu URL).
- Chưa có thông báo (notification) tập trung (chỉ toast theo sự kiện real-time).
- Chưa tối ưu hiệu năng (lazy load, pagination) khi board rất lớn.

### 5.3 Nếu có thêm 1 tháng – Hướng phát triển
- **Upload file đính kèm**: Thẻ có attachment (ảnh, PDF); dùng multer + lưu file (local hoặc S3).
- **Thông báo**: In-app notification (danh sách “Bạn được assign vào thẻ X”, “User Y bình luận trên thẻ Z”).
- **Gán assignee & due date trên UI**: Form trong modal thẻ; hiển thị hạn và người phụ trách.
- **Tìm kiếm / lọc thẻ**: Tìm theo tên, lọc theo label/assignee/due date.
- **Tối ưu**: Virtual list cho cột nhiều thẻ; lazy load board khi có nhiều board.

**Gợi ý**: Mỗi mục 5.1–5.3 khoảng nửa trang; có thể thêm 1 bảng tóm tắt “Tính năng đã có / chưa có”.

---

## 6. BỐ CỤC ĐỀ XUẤT (Tổng 15–20 trang)

| Phần | Nội dung | Số trang gợi ý |
|------|----------|-----------------|
| 1 | Mở đầu (lý do, mục tiêu, phạm vi) | 1,5–2 |
| 2 | Cơ sở lý thuyết (công nghệ đã dùng) | 3–4 |
| 3 | Thiết kế hệ thống (sơ đồ khối, flowchart, CSDL) | 3–4 |
| 4 | Kết quả thực nghiệm (screenshot, test case, đánh giá) | 4–5 |
| 5 | Kết luận & Hướng phát triển | 1,5–2 |
|  | Mục lục, danh mục hình/bảng, tài liệu tham khảo (nếu có) | 1–2 |
|  | **Tổng** | **15–20** |

---

## 7. LƯU Ý KHI VIẾT VÀ NỘP

- **Đánh số trang**, có **mục lục**.
- **Hình ảnh**: Đánh số (Hình 1, Hình 2…), có ghi chú (caption) bên dưới.
- **Bảng**: Đánh số (Bảng 1, Bảng 2…), có tiêu đề.
- **Tài liệu tham khảo**: Nếu trích dẫn (JWT, Socket.io, Mongoose…) thì liệt kê cuối báo cáo theo chuẩn trường (IEEE, APA…).
- **PDF**: Xuất từ Word/Google Docs/Latex; kiểm tra lỗi font và lề trước khi nộp.

Chúc bạn hoàn thành báo cáo tốt.
