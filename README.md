# Expense Tracker Application

A full-stack personal finance tool designed with production-readiness in mind. It handles real-world scenarios such as unreliable networks, duplicate submissions, and data precision.

## Key Features & Acceptance Criteria Met
- Create, view, filter (by category & date), and sort (by date) expenses.
- Calculates dynamic totals based on the active filters.
- **Robust API**: Handles duplicate submissions safely using Idempotency Keys and automatically retries failed requests using exponential backoff.

## Key Design Decisions

### 1. Money Handling (Data Correctness)
**Decision:** Store all monetary values as integer cents in the database (e.g., `₹10.50` is stored as `1050`).
**Why:** Floating-point arithmetic in JavaScript (and standard databases) can lead to precision loss (e.g., `0.1 + 0.2 = 0.30000000000000004`). By converting inputs to cents on the frontend before sending them to the API, and storing them as integers in the database, we guarantee 100% precision. The values are only formatted back into decimals for the UI.

### 2. Network Reliability & Duplicate Prevention (Idempotency)
**Decision:** Implemented an `X-Idempotency-Key` header for the `POST /api/expenses` route. 
**Why:** In real-world conditions on mobile devices or slow networks, users often double-click "Submit" or the browser retries a request. 
- **Frontend**: The `expenseClient.js` generates a unique UUID for every new form submission and uses exponential backoff to retry if the server drops the connection.
- **Backend**: The Express server intercepts the idempotency key, checks if it exists in the `ProcessedRequests` collection, and if so, returns the previously cached response instead of creating a duplicate expense.

### 3. Persistence Choice (MongoDB / Mongoose)
**Decision:** Used MongoDB as the database.
**Why:** MongoDB allows for rapid iteration and flexible schemas. By utilizing Mongoose, we enforce strict validation rules at the application layer (e.g., minimum amount constraints, enum validation for categories, and required fields), preventing bad data from being persisted.

### 4. Client-side vs Server-side Filtering
**Decision:** We implemented both! The backend API fully supports query parameters (`?category=food&sort=date_asc`) as requested. However, to provide a lightning-fast "command center" feel, the React frontend fetches the user's data and performs filtering, sorting, and aggregations entirely locally using `useMemo`. This prevents unnecessary round-trips to the server when the user is just exploring their data.

### 5. Authentication (Added Feature)
**Decision:** Added JWT-based authentication.
**Why:** A personal finance tool is highly sensitive. The application includes a full login/signup flow, hashing passwords with `bcryptjs`, and securing routes so users can only access their own expenses (`user_id` mapping).

## Trade-offs & Timebox Considerations
- **Testing:** Due to time constraints, comprehensive E2E tests (like Cypress or Playwright) were omitted.
- **Pagination:** If a user has thousands of expenses, the current "fetch all and filter locally" approach would become memory-heavy. In a truly scaled production app, we would implement cursor-based pagination and push the filtering fully back to the database.

## Setup Instructions

### Backend
1. `cd Backend`
2. Create a `.env` file with: `MONGODB_URI=mongodb://localhost:27017/expense-tracker` and `JWT_SECRET=your_secret`
3. `npm install`
4. `node index.js` (Runs on port 3001)

### Frontend
1. `cd Frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

Enjoy managing your finances!
