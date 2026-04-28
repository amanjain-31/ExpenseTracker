# Sunrise Ledger - Personal Finance Tracker

Sunrise Ledger is a full-stack personal finance application built to help users seamlessly record, review, and understand their expenses. Designed for real-world reliability, it securely handles edge cases like slow networks, page reloads, and duplicate submissions.

---

## 🌐 Live Demo
- **Frontend (Live Application):** [https://expense-tracker-lac-mu.vercel.app/](https://expense-tracker-lac-mu.vercel.app/)
- **Backend API:** `https://sunriseledger.onrender.com`

---

## 🚀 Core Features

- **Expense Management:** Create, view, and manage expenses with accurate dates, categories, and descriptions.
- **Dynamic Analysis:** Filter transactions by category and date ranges (Today, This Week, This Month).
- **Intelligent Sorting:** Sort expenses chronologically (newest or oldest first).
- **Live Summaries:** Instantly view the total expense amount of the currently visible/filtered list.
- **"Nice to Have" Implementations:**
  - Strict data validation (prevents negative amounts, enforces date schemas).
  - Visual category breakdown & dynamic budget tracking.
  - Comprehensive Unit Tests for data validators.
  - Interactive UI with robust loading and error states.
  - JWT Authentication & Multi-user isolation.

---

## 🧠 Architectural & Design Decisions

### 1. Persistence Mechanism: MongoDB & Mongoose
**Choice:** MongoDB (NoSQL) alongside Mongoose as an ODM.
**Reasoning:** Personal finance data relies heavily on aggregations and rapid reading/writing. MongoDB provides excellent read performance and seamless horizontal scaling. Mongoose allows us to strictly enforce data schemas at the application layer—guaranteeing that invalid categories, negative amounts, or missing descriptions are rejected before touching the database.

### 2. Money Handling & Data Correctness
**Approach:** All monetary values are handled and stored strictly as **integer cents** (e.g., `$10.50` is stored as `1050`). 
**Reasoning:** Floating-point arithmetic in JavaScript is notoriously imprecise (e.g., `0.1 + 0.2 = 0.30000000000000004`). By doing all calculations in integer cents and only converting to decimals for the UI, we guarantee 100% financial data accuracy and prevent rounding errors over time.

### 3. Handling Real-World Network Conditions (Idempotency)
**Approach:** Implemented an `X-Idempotency-Key` mechanism for the `POST /api/expenses` endpoint.
**Reasoning:** In real-world scenarios, users might accidentally double-click the "Submit" button, or mobile browsers might automatically retry a request due to a dropped connection. 
- The React frontend generates a unique UUID for every new form submission.
- The Express backend intercepts this UUID. If the database indicates this specific request was already processed, the backend safely returns the cached success response rather than charging/creating a duplicate expense.

---

## ⚖️ Trade-Offs & Timebox Considerations

Given the scope of the assignment, the following trade-offs were made:

1. **Client-Side vs. Server-Side Filtering:** 
   The backend API fully supports filtering and sorting via query parameters (e.g., `?category=food&sort=date_desc`). However, for an ultra-responsive UX, the frontend fetches the user's dataset and handles minor filtering locally. *Trade-off:* If a user accumulates tens of thousands of expenses over years, this approach consumes excess browser memory. In a large-scale production app, I would implement cursor-based pagination and rely purely on the database index for filtering.
   
2. **Testing Coverage:**
   While I implemented backend unit tests for the core data validation logic, comprehensive End-to-End (E2E) UI testing using tools like Cypress or Playwright was omitted due to time constraints.

---

## 🚫 What Was Intentionally Omitted

- **OAuth / Social Login:** To keep the focus strictly on the core CRUD expense requirements and system reliability, advanced authentication methods (like Google/GitHub login) were skipped in favor of a straightforward, secure JWT/bcrypt implementation.
- **Complex Budgeting Features:** Features like rollover budgets, multi-currency support, or custom user-defined categories were left out to maintain a minimal, polished, and bug-free core feature set.

---

## 🛠️ Setup & Local Development

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or Atlas URI)

### Backend Setup
1. Navigate to the backend directory: `cd Backend`
2. Install dependencies: `npm install`
3. Set environment variables: Create a `.env` file containing:
   ```env
   PORT=3001
   MONGODB_URI=mongodb://localhost:27017/expense-tracker
   JWT_SECRET=your_secure_secret
   ```
4. Run the server: `node index.js`
5. Run unit tests: `node --test tests/validators.test.js`

### Frontend Setup
1. Navigate to the frontend directory: `cd Frontend`
2. Install dependencies: `npm install`
3. Start the Vite development server: `npm run dev`
4. The application will be available at `http://localhost:5173`.
