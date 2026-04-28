# Expense Tracker - Production-Quality Implementation

A minimal expense tracking application built with focus on:
- **Idempotency**: Prevents duplicate expense creation from retries, refreshes, or double-clicks
- **Money Correctness**: Integer-based (cents) storage to avoid floating-point errors
- **Resilience**: Automatic retry logic with exponential backoff
- **Clean Architecture**: Well-organized, maintainable code structure

## Tech Stack

- **Backend**: Node.js + Express + MongoDB + Mongoose
- **Frontend**: React + Vite
- **API**: RESTful with idempotency keys (UUID v4)

## Architecture Highlights

### Idempotency Strategy
- Every mutation request (POST/PUT/DELETE) includes an `X-Idempotency-Key` header (UUID v4)
- Server caches responses by idempotency key in `ProcessedRequest` collection
- Duplicate requests return cached response without side effects
- TTL index: automatic cleanup after 24 hours

### Money Handling
- All amounts stored as **integers (cents)** in database
- Client converts USD (e.g., "10.50") → cents (1050) before sending
- Server validates amounts as integers to prevent precision errors
- Display layer converts cents → USD for UI

### API Design
```
POST   /api/expenses          - Create expense (with X-Idempotency-Key)
GET    /api/expenses          - List all expenses
GET    /api/expenses/:id      - Get single expense
DELETE /api/expenses/:id      - Delete expense (with X-Idempotency-Key)
```

### Frontend Resilience
- **Retry Logic**: Exponential backoff (1s, 2s, 4s) for transient failures
- **Optimistic Updates**: Show expense immediately, rollback on failure
- **Button Disabling**: Prevent double-click submissions
- **Error Handling**: User-friendly error messages

### Database Schema

**Expenses**
```javascript
{
  _id: ObjectId,
  description: String (required, max 200 chars),
  amount: Number (required, integer cents),
  category: String (enum: food, transport, entertainment, utilities, other),
  date: Date (required),
  createdAt: Date,
  updatedAt: Date
}
```

**ProcessedRequests** (Idempotency Cache)
```javascript
{
  _id: ObjectId,
  idempotencyKey: String (unique, indexed),
  method: String (POST/PUT/DELETE),
  endpoint: String,
  response: {
    statusCode: Number,
    body: Mixed (cached response)
  },
  createdAt: Date (TTL: 24 hours)
}
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd Backend
npm install

# Create .env file
cp .env.example .env

# Edit .env with your MongoDB URI
# MONGODB_URI=mongodb://localhost:27017/expense-tracker

# Start server
npm start
```

Server runs on `http://localhost:3001`

### Frontend Setup

```bash
cd Frontend
npm install

# Create .env file (optional - defaults to http://localhost:3001/api)
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs on `http://localhost:5173`

## Testing the Idempotency

### Via curl
```bash
# First request (creates expense)
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: abc-123" \
  -d '{
    "amount": 1050,
    "category": "food",
    "description": "Coffee",
    "date": "2024-01-15"
  }'

# Same request with same idempotency key (returns cached response, no duplicate)
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: abc-123" \
  -d '{
    "amount": 1050,
    "category": "food",
    "description": "Coffee",
    "date": "2024-01-15"
  }'

# Different idempotency key (creates new expense)
curl -X POST http://localhost:3001/api/expenses \
  -H "Content-Type: application/json" \
  -H "X-Idempotency-Key: def-456" \
  -d '{
    "amount": 1050,
    "category": "food",
    "description": "Coffee",
    "date": "2024-01-15"
  }'
```

### Via Browser
1. Add an expense in the form
2. Notice the expense appears immediately (optimistic update)
3. Try clicking "Add Expense" rapidly - only one will be created due to idempotency
4. Try refreshing the page before the response arrives - expense won't duplicate

## Error Handling

### Client-Side
- Network timeouts trigger automatic retry (up to 3 attempts)
- Display user-friendly error messages
- Form remains usable after errors

### Server-Side
- Input validation with detailed error messages
- Proper HTTP status codes (400, 404, 500)
- Global error handler
- CORS enabled for frontend origin

## Production Considerations

### What's Included (Minimal, Production-Ready)
- ✓ Idempotency implementation with TTL cleanup
- ✓ Integer-based money handling
- ✓ Input validation
- ✓ Error handling
- ✓ Retry logic with exponential backoff
- ✓ Clean separation of concerns

### What to Add (Beyond Scope)
- Authentication & authorization
- Rate limiting
- Request logging
- Database backup strategy
- Monitoring & alerting
- API documentation (Swagger/OpenAPI)
- Frontend build optimization
- E2E testing

## Notes on Design Decisions

**1. Idempotency Keys vs Etags**
- We use idempotency keys (not Etags) because:
  - Prevents duplicate creation (Etag only prevents overwrites)
  - Works naturally with POST requests
  - Standard in financial/payment APIs

**2. Integer Storage for Money**
- Avoids floating-point precision errors
- Industry standard (all financial systems do this)
- Conversion happens at boundaries (API ↔ UI)

**3. TTL Index for Cache**
- Prevents unbounded growth of ProcessedRequest collection
- 24-hour window covers most retry scenarios
- Automatic cleanup via MongoDB

**4. No Transaction Support (Yet)**
- MongoDB replica sets support ACID transactions
- Not needed for single-document operations (expenses)
- Can be added if multi-step operations are required

**5. Exponential Backoff**
- 1s, 2s, 4s delays for transient failures
- Prevents overwhelming server during outages
- Industry standard for resilient systems

## Deployment

### Backend Deployment (e.g., Heroku)
```bash
# Set environment variables
heroku config:set MONGODB_URI="..." NODE_ENV="production"

# Deploy
git push heroku main
```

### Frontend Deployment (e.g., Vercel)
```bash
# Set environment variable
VITE_API_URL=https://your-backend.herokuapp.com/api

# Deploy
vercel
```

## File Structure

```
ExpenseTracker/
├── Backend/
│   ├── index.js                 # Entry point
│   ├── models/
│   │   ├── Expense.js           # Expense schema
│   │   └── ProcessedRequest.js  # Idempotency cache
│   ├── middleware/
│   │   └── idempotency.js       # Idempotency middleware
│   ├── routes/
│   │   └── expenses.js          # API endpoints
│   ├── utils/
│   │   └── validators.js        # Input validation
│   ├── .env.example
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── api/
    │   │   └── expenseClient.js # API client with retry logic
    │   ├── components/
    │   │   ├── ExpenseForm.jsx  # Form component
    │   │   ├── ExpenseForm.css
    │   │   ├── ExpenseList.jsx  # List component
    │   │   └── ExpenseList.css
    │   ├── utils/
    │   │   └── formatting.js    # Currency/date formatting
    │   ├── App.jsx              # Main component
    │   ├── App.css
    │   ├── main.jsx
    │   └── index.css
    ├── vite.config.js
    ├── .env.example
    └── package.json
```

## Troubleshooting

**Cannot connect to MongoDB**
- Ensure MongoDB is running: `mongod`
- Check connection string in .env
- For MongoDB Atlas: whitelist your IP

**CORS errors in frontend**
- Vite proxy should handle this in dev
- For production: update CORS origin in backend

**Idempotency key not working**
- Check `ProcessedRequest` collection for stored keys
- Ensure header is exactly: `X-Idempotency-Key`

**Money precision issues**
- Always convert dollars → cents on frontend
- Verify amounts are integers before sending
- Check database stores amounts as integers

---

Built with focus on **correctness, reliability, and maintainability**. Not over-engineered, but production-ready.
