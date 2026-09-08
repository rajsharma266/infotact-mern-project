# 🚀 InfoTact Workspace

A modern **Slack-inspired real-time team collaboration platform** built using the **MERN Stack**, **TypeScript**, **Socket.IO**, and **MongoDB**.

InfoTact Workspace enables teams to collaborate efficiently through workspaces, channels, real-time messaging, member management, activity tracking, and secure authentication.

---

## 📌 Features

### 🔐 Authentication
- User Registration
- Secure Login
- JWT Authentication
- Password Hashing using bcrypt
- Protected Routes

### 🏢 Workspace Management
- Create Workspace
- Edit Workspace
- Delete Workspace
- Join Workspace using Invite Link
- Generate Invite Link
- Filter Workspaces for Authenticated User
- Transfer Workspace Ownership
- Leave Workspace
- Workspace Settings

### 👥 Member Management
- Invite Members
- Add Members
- Remove Members
- Workspace Member List
- Channel Member List
- Owner & Member Permissions

### 📁 Channel Management
- Create Public Channel
- Create Private Channel
- Delete Channel
- Channel Details
- Channel Members

### 💬 Messaging
- Real-time Messaging using Socket.IO
- Message History
- Emoji Reactions
- Pin / Unpin Messages
- Code Block Support
- Inline Code Formatting
- Rich Text Formatting
- Auto Scroll

### 📌 Pinned Messages
- Pin Important Messages
- Dedicated Pinned Panel
- Real-time Pin Updates

### 📊 Recent Activity
- Workspace Created
- Channel Created
- Member Joined
- Ownership Transferred
- Real-time Activity Feed

### 🌙 UI Features
- Dark / Light Theme
- Responsive Layout
- Beautiful Dashboard
- Modern Workspace Interface
- Animated Panels
- Mobile Friendly

---

# 🛠 Tech Stack

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM
- Axios
- Socket.IO Client
- Lucide React

## Backend

- Node.js
- Express.js
- TypeScript
- MongoDB
- Mongoose
- JWT
- bcrypt
- Socket.IO

---

# 📂 Project Structure

```
InfoTact-Workspace
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   ├── services
│   ├── contexts
│   ├── hooks
│   └── types
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── socket
│   ├── config
│   └── app.ts
│
└── README.md
```

---


# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/rajsharma266/infotact-mern-project.git
```

---

## Backend

```bash
cd backend

npm install

npm run dev
```

---

## Frontend

```bash
cd frontend

npm install

npm run dev
```

---

# Environment Variables

Backend `.env`

```env
PORT=4000

MONGO_URI=your_mongodb_uri

JWT_SECRET=your_secret_key
```

---

# API Endpoints

## Authentication

```
POST    /api/users/register
POST    /api/users/login
GET     /api/users/profile
```

---

## Workspace

```
POST    /api/workspaces
GET     /api/workspaces
PUT     /api/workspaces/:id
DELETE  /api/workspaces/:id
POST    /api/workspaces/join
```

---

## Channel

```
POST    /api/channels
GET     /api/channels/workspace/:workspaceId
DELETE  /api/channels/:id
```

---

## Messages

```
POST    /api/messages
GET     /api/messages/channel/:channelId
PATCH   /api/messages/:id/pin
PATCH   /api/messages/:id/react
DELETE  /api/messages/:id
```

---

## Activity

```
GET /api/activities/:workspaceId
```

---

# Socket Events

## Client → Server

```
join_channel
leave_channel
typing
stop_typing
send_message
```

---

## Server → Client

```
message_created
message_deleted
message_updated
typing_started
typing_stopped
activity_created
```

---

# Security

- JWT Authentication
- Protected Routes
- Password Hashing using bcrypt
- Role-based Authorization
- Secure MongoDB Queries
- Input Validation
- Error Handling Middleware

---

# Future Enhancements

- File Sharing
- Voice Messages
- Video Calling
- Threaded Conversations
- Read Receipts
- Notifications
- Redis Integration
- Docker Deployment
- Kubernetes Deployment
- CI/CD Pipeline

---

# Author

**Supriya Nayak**

B.Tech Computer Science Engineering

MERN Stack Developer

---

# License

This project is licensed under the MIT License.