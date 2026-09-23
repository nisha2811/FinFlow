# FinFlow

A full-stack **FinFlow - Expense Management Suite** designed to help users manage their expenses, budgets, and financial records efficiently.

The application provides a centralized platform for tracking financial transactions, categorizing expenses, managing budgets, and gaining better visibility into personal finances.

## 🚀 Features

* 🔐 User authentication and authorization
* 👤 Secure user account management
* 💰 Income and expense tracking
* 🗂️ Expense categorization
* 📊 Financial insights and expense management
* 🧾 Receipt upload and management
* 🔍 View and manage transaction history
* 📅 Track financial activities
* 🔒 JWT-based authentication
* 📧 Email integration using SMTP
* 🌐 RESTful API architecture
* 🎨 Modern frontend user interface
* 🐳 Docker support for containerized deployment
* 🗄️ Database migration support using Alembic

## 🛠️ Tech Stack

### Backend

* Python
* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* JWT Authentication
* SMTP Email Integration

### Frontend

* React
* Vite
* JavaScript
* HTML
* CSS

### Database

* SQLite for development

### DevOps & Tools

* Docker
* Docker Compose
* Git & GitHub
* Pytest

## ⚙️ Prerequisites

Make sure you have the following installed:

* Python 3.10+
* Node.js 18+
* npm
* Git
* Docker and Docker Compose *(optional)*

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd FinFlow
```

### 2. Set up the Backend

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

**Windows:**

```bash
.venv\Scripts\activate
```

**macOS/Linux:**

```bash
source .venv/bin/activate
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory.

You can use `.env.example` as a reference:

```bash
cp .env.example .env
```

## 🗄️ Database Setup

The project uses Alembic for database migrations.

Run migrations using:

```bash
alembic upgrade head
```

For development, the application can also be configured to automatically create database tables.

## ▶️ Running the Backend

Start the FastAPI application using:

```bash
uvicorn app.main:app --reload
```

The backend will typically be available at:

```text
http://localhost:8000
```

### API Documentation

FastAPI automatically provides interactive API documentation:

```text
http://localhost:8000/docs
```

Alternative API documentation:

```text
http://localhost:8000/redoc
```

## 🎨 Running the Frontend

Navigate to the frontend directory:

```bash
cd expense-management-ui
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will typically run at:

```text
http://localhost:5173
```

## 🐳 Running with Docker

The project includes Docker configuration for containerized deployment.

Build and start the application using:

```bash
docker-compose up --build
```

To stop the containers:

```bash
docker-compose down
```

## 🧪 Running Tests

Run the backend tests using:

```bash
pytest
```
