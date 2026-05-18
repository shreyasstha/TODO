Enhance the existing full-stack Todo App by adding user authentication and user-specific todo management using Basic Authentication.

Tech Stack:

* Frontend: Next.js + Tailwind CSS
* Backend: Node.js + Express.js
* Database: PostgreSQL
* ORM: Prisma

Authentication Requirements:
Implement Basic Authentication where:

* A client sends a username and password encoded in Base64 format inside the Authorization header.
* Example:
  Authorization: Basic base64(username:password)

Backend Requirements:

1. Create a User model in Prisma with:

* id
* username
* password
* createdAt

2. Update the Task model:

* Add userId as a foreign key
* Each task belongs to one user

3. Authentication Middleware:

* Decode Base64 credentials from request headers
* Verify username and password from PostgreSQL database
* Protect all task routes
* Return 401 Unauthorized for invalid credentials

4. API Behavior:

* Each authenticated user should only:

  * Create their own tasks
  * View their own tasks
  * Update their own tasks
  * Delete their own tasks

5. Secure Password Storage:

* Use bcrypt to hash passwords before saving
* Compare hashed passwords during login

6. Create Authentication Routes:

* POST /register → create new user
* POST /login → validate credentials

Frontend Requirements:

1. Create:

* Login page
* Register page

2. Authentication UI:

* Username input
* Password input
* Login button
* Register button
* Logout button

3. Store credentials temporarily on frontend and send them in Authorization headers for every protected request.

4. After login:

* Redirect user to their personal todo dashboard
* Display only their own tasks

5. Add route protection:

* Prevent unauthenticated users from accessing the todo page

UI Requirements:

* Modern clean white theme
* Responsive design
* Tailwind CSS styling
* Smooth hover effects and transitions
* Empty state UI when no tasks exist

Suggested Folder Structure:

* frontend/

  * app/login
  * app/register
  * app/dashboard
  * components/
* backend/

  * routes/
  * middleware/
  * controllers/
  * prisma/

Generate:

* Prisma schema
* Express authentication middleware
* Login/register APIs
* Protected CRUD routes
* Next.js authentication pages
* Axios/fetch setup with Authorization headers
* Complete frontend and backend code
* README setup instructions
