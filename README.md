# Week 20: Task Management API with Authentication

## RESTful API Development and Authentication Implementation

## Introduction

- You have learned the basics of Node.js and Express.js, now let's test your knowledge of how to implement authentication with this Task Management project using JWT tokens and bcrypt password hashing.

### Task 1: Project Setup

1. Fork and Clone this project repository in your terminal
2. CD into the project base directory `cd Week20_Task_Management_NodeJS_Auth`
3. Install dependencies:
   ```bash
   npm install
   ```
4. Create a `.env` file in the root directory with your database URL and JWT secret
5. Complete the authentication middleware and routes (see tasks below)
6. Generate Prisma client and push schema to database:
   ```bash
   npm run db:generate
   npm run db:push
   ```
7. Start the server:
   ```bash
   npm run dev
   ```
8. The server will run on `http://localhost:3000`

### Task 2: MVP Requirements (Minimum Viable Product)

You need to complete the following:

#### 1. Complete Authentication Middleware - `middleware/auth.js`

**Location:** `middleware/auth.js`

The middleware file needs to be implemented to verify JWT tokens:

**Requirements:**

- Extract JWT token from `Authorization: Bearer <token>` header
- Verify the token using the JWT_SECRET
- Find the user in the database using the decoded userId
- Set `req.user` with the user data (excluding password)
- Handle token validation errors properly

#### 2. Complete User Registration - `routes/auth.js`

**Location:** `routes/auth.js` - POST /register endpoint

The registration endpoint needs to be implemented:

**Requirements:**

- Validate that email, password, and name are provided
- Check if a user with the email already exists
- Hash the password using bcrypt (12 salt rounds)
- Create the user in the database
- Generate a JWT token with userId and email
- Return user data (excluding password) and token
- Handle duplicate email errors

#### 3. Complete User Login - `routes/auth.js`

**Location:** `routes/auth.js` - POST /login endpoint

The login endpoint needs to be implemented:

**Requirements:**

- Validate that email and password are provided
- Find the user by email in the database
- Check if the user exists
- Compare the provided password with the hashed password using bcrypt
- Generate a JWT token with userId and email
- Return user data (excluding password) and token
- Handle invalid credentials errors

#### 5. Configure Environment Variables - `.env`

**Location:** `.env`

Create a `.env` file with:

```env
DATABASE_URL="your-supabase-database-connection-url"
JWT_SECRET="your-super-secret-jwt-key"
PORT=3000
```

### Task 3: Testing Your Implementation

You can use Postman or curl to test your endpoints, make sure everything is working correctly.

## Task 4: Stretch Goals

### Add Password Reset Functionality

**Objective:** Implement password reset with email verification.

**Requirements:**

1. **Create password reset endpoint** that generates a reset token
2. **Send reset email** with reset link (simulate with console.log)
3. **Create reset password endpoint** that validates reset token
4. **Update user password** in database

### Add Email Verification

**Objective:** Implement email verification for new registrations.

**Requirements:**

1. **Add email verification field** to User model
2. **Generate verification token** during registration
3. **Send verification email** (simulate with console.log)
4. **Create verification endpoint** to confirm email
5. **Update user verification status**


Good luck with your implementation! 🚀
