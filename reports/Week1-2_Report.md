````carousel
# Task Management App
## Progress Report: Weeks 1 & 2
### Backend Implementation & Verification
**Date**: January 30, 2026
**Status**: Completed
<!-- slide -->
# 1. Architecture Overview
The application follows a **MERN Stack** architecture with real-time capabilities.

- **Server**: Node.js + Express
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io
- **Security**: JWT Authentication + Bcrypt
- **API Structure**: RESTful services

**Current progress focuses entirely on the Backend (Server side).**
<!-- slide -->
# 2. Week 1: Environment Setup
**Goal**: Initialize project structure and configuration.

**Achievements**:
- Created `server` and `client` directory structure.
- Configured `package.json` for both environments.
- Set up Environment Variables (`.env`).
- Implemented `create-react-app` skeleton (ready for Wk3).

**Key Files**:
- `server/package.json`
- `server/.env`
- `server/src/index.js`
<!-- slide -->
# 3. Week 1: Database Design
**Goal**: Design and implement Data Models.

**Models Created**:
1. **User**: `username`, `email`, `password`, `avatar`
2. **Board**: `title`, `owner`, `members`, `background`
3. **Column**: `title`, `boardId`, `order`
4. **Card**: `title`, `description`, `assignees`, `dueDate`
5. **Comment**: `content`, `author`, `cardId`

**Highlights**:
- Relationships established (Refs).
- Timestamps enabled for all schemas.
<!-- slide -->
# 4. Week 1: Authentication
**Goal**: Secure the API with JWT.

**Implementation**:
- **Utils**: `jwt.js` for Token generation & verification.
- **Middleware**: `auth.js` to protect private routes.
- **Endpoints**:
    - `POST /register`: Create account & return token.
    - `POST /login`: Authenticate & return token.
    - `GET /me`: Retrieve current user details.
<!-- slide -->
# 5. Week 2: Board Management API
**Goal**: CRUD operations for Boards.

**Features**:
- **Create**: Authenticated users can create boards.
- **Read**: Fetch boards where user is Owner or Member.
- **Update**: Edit title, description, background.
- **Delete**: Owner-only deletion.
- **Members**: Add/Remove members (access control).

**Path**: `/api/boards`
<!-- slide -->
# 6. Week 2: Column & Card API
**Goal**: Task management logic.

**Features**:
- **Columns**: Create, Delete, and **Reorder**.
- **Cards**: Create, Update details, and **Move**.
- **Nested Routing**: `/api/boards/:boardId/columns` for intuitive access.
- **Logic**: Automatic ordering for new items.
<!-- slide -->
# 7. Week 2: Real-time Communication
**Goal**: Instant updates for collaboration.

**Tech**: Socket.io on port 5000.

**Events Implemented**:
- `join-board`: User enters a board room.
- `card:moved`: Drag & drop updates broadcasted to room.
- `card:created/updated/deleted`: Content sync.
- `column:updated`: Column changes sync.

**Auth**: Socket connection secured via JWT.
<!-- slide -->
# 8. API Endpoints Summary
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/register` | Register User |
| POST | `/api/auth/login` | Login User |
| GET | `/api/boards` | Get User's Boards |
| POST | `/api/boards` | Create Board |
| POST | `/api/cards` | Create Card |
| PUT | `/api/cards/:id/move` | Move Card |

*All private routes are protected.*
<!-- slide -->
# 9. Verification & Testing
**Methods Used**:
- **Manual Testing**: Verified via Postman.
- **Dependency Check**: `npm install` run successfully.
- **Connection Check**: MongoDB connects successfully.
- **Socket Check**: Handshake and Room joining logic implemented.

**Status**: Stable and Ready for Frontend Integration.
<!-- slide -->
# 10. Next Steps (Week 3)
**Focus**: Frontend Implementation (React)

1. **Authentication UI**: Login/Register Pages.
2. **Dashboard**: Display Boards list.
3. **Board View**: Kanban layout with Columns/Cards.
4. **Integration**: Connect React to Backend API & Socket.io.
````
