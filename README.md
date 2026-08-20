# Card Dispute Portal

The Card Dispute Portal is a modern, full-stack application designed for managing and reviewing banking/credit card disputes. It features a secure Spring Boot backend and a sophisticated Angular 18 frontend with role-based access control for both regular users and system administrators.

## Running Locally via Docker

The entire application (PostgreSQL database, Spring Boot API, and Angular frontend) is containerized and orchestrated via Docker Compose. The frontend is bundled and served statically by the backend in a single container.

### Prerequisites
- Docker and Docker Compose installed on your system.

### Steps to Deploy
1. Open a terminal in the root directory of the project.
2. Run the following command to build and start the application:
   ```bash
   docker compose up --build
   ```
3. Wait for the containers to start up. Flyway will automatically run database migrations and populate the database with seed data.
4. Access the application in your browser at:
   **[http://localhost:8080](http://localhost:8080)**

To stop the application, press `Ctrl+C` in the terminal or run `docker compose down`.

## Login Credentials

The application database is pre-seeded with multiple user and admin accounts for testing. 

**All accounts use the same password:** `password123`

### Standard Users
- `user1@example.com` through `user20@example.com`

### System Administrators
- `admin1@example.com` through `admin5@example.com`
- `admin@example.com`

## User Paths & Features

The application automatically routes users to the appropriate experience based on their role after logging in.

### 1. Standard User Path (`ROLE_USER`)
When logging in as a standard user, you are directed to the **User Dashboard**. 
- **View Transactions:** Users can view a complete history of their mock credit card transactions.
- **Initiate Disputes:** Users can click on any eligible transaction to open a dispute modal, where they select a reason (e.g., Fraud, Defective Goods, Overcharge) and provide supporting details.
- **Track Status:** Users can monitor the status of their active disputes. Clicking on a submitted dispute opens an interactive Timeline/Audit Trail, showing the progression of the dispute from submission to final resolution.

### 2. Administrator Path (`ROLE_ADMIN`)
When logging in as an administrator, you are directed to the **Admin Dashboard**.
- **Review Queue:** Admins see a comprehensive queue of all disputes submitted across the entire platform that require review.
- **Decision Engine:** Admins can click on a specific dispute to open the Admin Timeline view. This interface serves as a decision engine, allowing the admin to review the user's claims and transition the dispute status (e.g., move it from `SUBMITTED` to `UNDER_REVIEW`, and eventually to `RESOLVED` or `REJECTED`).
- **Audit Logging:** Every status change is securely logged in the system's `audit_log` table, establishing a clear trail of actions for compliance.
