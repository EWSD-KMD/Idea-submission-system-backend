# University Ideas System Backend

This project is a secure, web-enabled role-based system for collecting improvement ideas from staff at a large University. It uses Node.js, Express, PostgreSQL, and Prisma ORM to implement a robust Role-Based Access Control (RBAC) system.

## Features

- **Role-Based Access Control (RBAC):**  
  Manage roles, menus, and permissions with standardized API responses.
- **CRUD Endpoints:**  
  Create, read, update, and delete roles.
- **Pagination:**  
  The GET endpoint supports pagination with a default limit of 5 per page.
- **Standardized Responses:**  
  All API responses follow a consistent format.
- **Aggregated Routes:**  
  Routes are organized using an index route to simplify imports.

## Prerequisites

- [Node.js](https://nodejs.org/) (v14 or above)
- [PostgreSQL](https://www.postgresql.org/) (v10 or above)
- [npm](https://www.npmjs.com/)

## Installation

1. **Clone the repository:**

   
```bash
   git clone [<repository-url>](https://github.com/EWSD-KMD/Idea-submission-system-backend.git)
   cd university-ideas
```

2. **Install dependencies:**

```bash
    npm install
```

2. **Environment Setup:**

Create a .env  file in the root directory of your project (at the same level as package.json). Add your PostgreSQL connection string. For example:

```bash
    DATABASE_URL="postgresql://username:password@localhost:5432/database_name?schema=public"
```

Note:
Replace username, password, localhost, 5432, and database_name with your actual database details.
If your username or password contains special characters, ensure they are URL-encoded.


## Database Setup with Prisma

Generate the Prisma Client:
```bash
    npx prisma generate
    Run the initial migration to create your database schema:
    npx prisma migrate dev --name init
    Running the Application
```

Start the development server with:


```bash
    npm run dev
```
By default, the server listens on port 3000 (or the port specified in the PORT environment variable).

## Testing the API

You can test the endpoints using tools like VS Code REST Client or Postman. An example file (request.rest) is included in the project to help you get started.

Project Structure

```bash
Idea-submission-system-backend/
├── prisma/
│   └── schema.prisma       # Prisma schema definition
├── controllers/
│   └── xxxController.js    # CRUD logic using response utilities
├── routes/
│   ├── index.js            # Aggregated route definitions
│   │   └── xxxRoutes.js    # specific routes
├── utils/
│   └── response.js         # Standardized response utility (using exports.)
└── index.js                # Main server file
├── .env                    # Environment configuration file
├── package.json
└── request.rest            # Example API requests for testing
```
