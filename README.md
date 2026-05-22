# 🌿 Food Garden — Full-Stack Restaurant Website

A full-stack restaurant management platform built with **Node.js**, **Express**, **MongoDB**, and vanilla **HTML/CSS/JavaScript**. Features a customer-facing website with online reservations and a powerful admin dashboard.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## ✨ Features

### Customer-Facing Website
- 🏠 **Homepage** — Hero section, featured dishes, reviews, Instagram gallery
- 🍽 **Menu** — Categorized dishes with filtering (Starters, Mains, Tandoor, Desserts)
- 📖 **About** — Restaurant story, timeline, chef profile, gallery
- 📞 **Contact** — Contact form, Google Maps embed, social links
- 📅 **Reservations** — Multi-field booking form with occasion selection

### Backend API
- RESTful API for reservations, contact messages, and menu management
- Session-based admin authentication
- Server-side email notifications via Nodemailer
- MongoDB database with Mongoose ODM

### Admin Dashboard
- 📊 **Dashboard** — Real-time stats (today's reservations, unread messages, menu items)
- 📅 **Reservations** — View, confirm, cancel, and delete bookings
- 💬 **Messages** — Read/unread tracking, topic filtering
- 🍽 **Menu Management** — Full CRUD with categories, badges, availability toggle

---

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/Food-Garden.git
cd Food-Garden

# 2. Install dependencies
npm install

# 3. Start the server (uses in-memory MongoDB by default!)
node server.js
```

The server starts at **http://localhost:3000** — no database setup required!

| Page | URL |
|------|-----|
| Homepage | http://localhost:3000 |
| Menu | http://localhost:3000/menu.html |
| Book a Table | http://localhost:3000/reserve.html |
| Contact | http://localhost:3000/contact.html |
| **Admin Dashboard** | http://localhost:3000/admin.html |

**Admin Login:** `admin` / `admin123`

---

## 📁 Project Structure

```
Food-Garden/
├── server.js                # Express server entry point
├── package.json             # Dependencies & scripts
├── .env                     # Environment config (create from .env.example)
├── config/
│   └── db.js                # MongoDB connection (auto in-memory fallback)
├── models/
│   ├── Reservation.js       # Reservation schema
│   ├── Contact.js           # Contact message schema
│   └── MenuItem.js          # Menu item schema
├── routes/
│   ├── reservations.js      # Reservation CRUD API
│   ├── contacts.js          # Contact message API
│   └── menu.js              # Menu item API
├── middleware/
│   └── auth.js              # Admin session authentication
├── utils/
│   └── mailer.js            # Nodemailer email templates
└── public/                  # Frontend files
    ├── index.html           # Homepage
    ├── menu.html            # Menu page
    ├── about.html           # About page
    ├── contact.html         # Contact page
    ├── reserve.html         # Reservation page
    ├── admin.html           # Admin dashboard
    ├── css/                 # Stylesheets
    ├── js/                  # Client-side JavaScript
    └── assets/              # Images & media
```

---

## 🔌 API Endpoints

### Public
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/reservations` | Create a reservation |
| `POST` | `/api/contacts` | Submit a contact message |
| `GET` | `/api/menu` | Get all menu items |

### Admin (requires login)
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `POST` | `/api/admin/logout` | Admin logout |
| `GET` | `/api/reservations` | List all reservations |
| `PATCH` | `/api/reservations/:id` | Update status |
| `DELETE` | `/api/reservations/:id` | Delete reservation |
| `GET` | `/api/contacts` | List all messages |
| `PATCH` | `/api/contacts/:id` | Mark as read |
| `DELETE` | `/api/contacts/:id` | Delete message |
| `POST` | `/api/menu` | Add menu item |
| `PATCH` | `/api/menu/:id` | Update menu item |
| `DELETE` | `/api/menu/:id` | Delete menu item |

---

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/foodgarden
SESSION_SECRET=your-secret-key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

> **Note:** If `MONGODB_URI` is not set, the app automatically uses an in-memory MongoDB instance (data resets on restart).

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** MongoDB with Mongoose
- **Auth:** Express-session
- **Email:** Nodemailer (Gmail SMTP)
- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Fonts:** Google Fonts (Playfair Display, Inter)
- **Icons:** Font Awesome 6

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
