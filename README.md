# Lawlytics — AI-Powered Public Consultation Platform

> *"Bridging the gap between citizens and government in the law-making process."*

Lawlytics is a full-stack web application where citizens can submit feedback on government legislation, and AI automatically analyzes the sentiment of every comment — giving policymakers data-driven insights to make better decisions.

---

## Table of Contents

- [About the Project](#about-the-project)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Project](#running-the-project)
- [API Endpoints](#api-endpoints)
- [AI Features](#ai-features)
- [Screenshots](#screenshots)

---

## About the Project

In a democratic country like India, citizens have the right to give their opinion on laws before they are passed. But the process is slow, manual and inefficient. Government officials have to manually read thousands of comments — which takes weeks.

**Lawlytics solves this by:**
- Providing a dedicated platform for public consultation on legislation
- Using AI to automatically classify every comment as Positive, Negative or Neutral
- Summarizing hundreds of comments into key points using LSA algorithm
- Giving admins a complete visual dashboard with charts, word clouds and exportable reports

---

## Features

### For Citizens
- Browse all open/closed consultations
- Filter by category, ministry, deadline, status
- Comment on specific provisions/clauses of a bill
- Upload attachments with comments
- Track personal comments and AI sentiment results
- Get notified when new bills are uploaded
- Get deadline reminders (3 days before closing)

### For Admin
- Upload legislation with PDF and provisions
- View real-time sentiment dashboard
- Sentiment breakdown by provision and stakeholder type
- AI-generated summary of all comments
- Keyword word cloud visualization
- Auto-flagged provisions (>50% negative comments)
- Export full reports as Excel or PDF

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React.js | User interface |
| Vite | Build tool |
| Tailwind CSS | Styling |
| React Router v7 | Navigation |
| Axios | API calls |
| Recharts | Charts and graphs |
| date-fns | Date formatting |
| jsPDF + html2canvas | Client-side PDF |

### Backend
| Technology | Purpose |
|---|---|
| Python | Programming language |
| Flask | REST API framework |
| Flask-JWT-Extended | Authentication |
| Flask-CORS | Cross origin requests |
| SQLAlchemy | ORM |
| PostgreSQL | Database |
| python-dotenv | Environment variables |

### AI / ML
| Technology | Purpose |
|---|---|
| HuggingFace Transformers | Sentiment analysis |
| cardiffnlp/twitter-roberta-base-sentiment-latest | Pre-trained NLP model |
| Sumy (LSA) | Text summarization |
| NLTK | Tokenization |

### Export
| Technology | Purpose |
|---|---|
| openpyxl | Excel report generation |
| ReportLab | PDF report generation |

---

## Project Structure

```
Ai-senti-sum/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   │   └── models.py        # Database models
│   │   ├── routes/
│   │   │   ├── auth.py          # Authentication routes
│   │   │   ├── legislation.py   # Legislation CRUD
│   │   │   ├── comments.py      # Comment submission
│   │   │   ├── admin.py         # Admin dashboard & exports
│   │   │   ├── notifications.py # Notification routes
│   │   │   └── profile.py       # User profile
│   │   ├── utils/
│   │   │   ├── sentiment.py     # AI sentiment analysis
│   │   │   ├── summariser.py    # Text summarization
│   │   │   ├── deadline.py      # Deadline notifications
│   │   │   └── seed.py          # Default admin seeding
│   │   ├── extensions.py        # SQLAlchemy instance
│   │   └── __init__.py          # App factory
│   ├── uploads/                 # Uploaded PDFs
│   ├── .env                     # Environment variables
│   ├── requirements.txt         # Python dependencies
│   └── run.py                   # Entry point
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── axios.js         # Axios instance
    │   ├── components/
    │   │   ├── AdminSidebar.jsx
    │   │   ├── UserSidebar.jsx
    │   │   ├── Navbar.jsx
    │   │   ├── TopBar.jsx
    │   │   ├── LegislationCard.jsx
    │   │   ├── SentimentStrip.jsx
    │   │   ├── WordCloud.jsx
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx  # Global auth state
    │   ├── pages/
    │   │   ├── admin/
    │   │   │   ├── AdminDashboard.jsx
    │   │   │   ├── UploadLegislation.jsx
    │   │   │   ├── CommentsDashboard.jsx
    │   │   │   ├── SentimentAnalysis.jsx
    │   │   │   ├── SentimentDetail.jsx
    │   │   │   └── SummaryReport.jsx
    │   │   └── user/
    │   │       ├── Home.jsx
    │   │       ├── LegislationDetail.jsx
    │   │       ├── MyComments.jsx
    │   │       ├── ActiveConsultations.jsx
    │   │       ├── Notifications.jsx
    │   │       └── Profile.jsx
    │   ├── utils/
    │   │   └── helpers.jsx      # Shared utility functions
    │   ├── App.jsx               # Routes
    │   ├── main.jsx              # Entry point
    │   └── index.css             # Global styles
    ├── .env                      # Frontend env variables
    ├── package.json
    ├── tailwind.config.js
    └── vite.config.js
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- pip
- npm

---

## Environment Variables

### Backend — `backend/.env`
```
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=postgresql://username:password@localhost:5432/dbname
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=10485760
```

### Frontend — `frontend/.env`
```
VITE_API_URL=http://localhost:5000/api
```

---

## Running the Project

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/lawlytics.git
cd lawlytics
```

### 2. Setup Backend
```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt

# Setup .env file
cp .env.example .env
# Edit .env with your database credentials

# Run the server
python run.py
```

Backend runs at → `http://localhost:5000`

### 3. Setup Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend runs at → `http://localhost:5173`

---

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register new user |
| POST | `/login` | Login and get JWT token |
| POST | `/forgot-password` | Password reset |
| GET | `/me` | Get current user |

### Legislation — `/api/legislations`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all legislations |
| GET | `/<id>` | Get single legislation with provisions |
| POST | `/` | Create legislation (admin only) |
| PUT | `/<id>` | Update legislation (admin only) |
| DELETE | `/<id>` | Delete legislation (admin only) |

### Comments — `/api/comments`
| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Submit comment (AI analyzed) |
| GET | `/my` | Get my comments |
| GET | `/legislation/<id>` | Get comments for legislation |

### Admin — `/api/admin`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/dashboard` | Dashboard metrics |
| GET | `/comments` | All comments with filters |
| GET | `/sentiment/<id>` | Sentiment analysis for legislation |
| GET | `/report/<id>` | Summary report |
| GET | `/export/excel` | Export as Excel |
| GET | `/export/pdf` | Export as PDF |

### Notifications — `/api/notifications`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get all notifications |
| GET | `/unread-count` | Get unread count |
| PUT | `/<id>/read` | Mark as read |
| PUT | `/read-all` | Mark all as read |

### Profile — `/api/profile`
| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | Get profile |
| PUT | `/` | Update profile |
| PUT | `/change-password` | Change password |

---

## AI Features

### Sentiment Analysis
- **Model:** `cardiffnlp/twitter-roberta-base-sentiment-latest`
- **Library:** HuggingFace Transformers
- **Input:** Comment text (max 512 characters)
- **Output:** Positive / Negative / Neutral + Confidence score
- **When:** Runs automatically on every comment submission

### Text Summarization
- **Algorithm:** LSA (Latent Semantic Analysis)
- **Library:** Sumy + NLTK
- **Input:** All comments for a legislation
- **Output:** 5 sentence summary
- **When:** Runs when admin views sentiment detail

### Keyword Extraction
- **Method:** Word frequency analysis
- **Input:** All comments for a legislation
- **Output:** Top 50 keywords with frequency count
- **Display:** Word Cloud visualization

---

## Default Admin Credentials

```
Email:    admin@lawlytics.gov.in
Password: admin123
```

> Admin account is automatically created when the server starts for the first time.

---

## License

This project is built for academic purposes.

---

## Team

Built with ❤️ for the Government of India's Digital Public Consultation Initiative.
