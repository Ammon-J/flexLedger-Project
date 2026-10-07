# FlexLedger

## Project Description
FlexLedger is a full-stack web application built for independent delivery drivers to track exact mileage, fuel costs, and vehicle maintenance. Designed with tax season in mind, the app aggregates this data to simplify calculating annual write-offs. It features offline support via Service Workers, ensuring drivers can log expenses even in cellular dead zones.

## Technologies Used
* **Frontend:** Astro (styled with Tailwind CSS) for a lightweight, highly responsive user interface and PWA support.
* **Backend:** Node.js with Express to handle API routing, authentication, and offline sync resolution.
* **Database:** MongoDB (via Atlas) to store flexible, document-based records of shifts and maintenance.

## Team Members & Contributions
* **[Team 1]** - Backend architecture, database schema, and authentication routes.
* **[Team 2]** - Frontend development, responsive design, and PWA Service Worker integration.
* *(Note: All members actively contribute to GitHub via feature branches and pull requests).*

## Project Management & Agile Workflow
* **Version Control:** Git and GitHub.
* **Issue Tracking:** Development progress and sprint planning are managed on our [Trello Board Link].
* **Sprint Cycle:** We operate on weekly sprints with defined goals. Weekly planning and retrospective notes can be found in the `docs/sprints` folder or under GitHub Issues tagged `agile-notes`.

## Setup and Installation Instructions
1. Clone the repository: `git clone [URL]`
2. Navigate to the project directory: `cd flexledger`
3. Install dependencies: `npm install`
4. Create a `.env` file in the root directory and add your environment variables:
   * `MONGODB_URI=your_mongodb_connection_string` (or use `MONGO_URI`)
   * `MONGODB_DB=flexledger` (optional; defaults to `flexledger`)
   * `API_PORT=3001` (optional; defaults to `3001`)
5. Start both the API and Astro frontend: `npm run dev`
6. Access the application at the URL printed by Astro (normally `http://localhost:4321`).

The development command starts the API and Astro frontend together. Astro proxies `/api`
requests to the API on port `3001`. To run only the API, use `npm run api`. In production,
configure the frontend host or reverse proxy to route `/api` to the Express API.
If MongoDB is not configured, the API still starts, but registration and login respond with
`503 Service Unavailable` and explain that `MONGODB_URI` must be set.

## API Documentation

### Auth Routes
* `POST /api/register` (also `/api/auth/register`) - Creates a new user account.
* `POST /api/login` (also `/api/auth/login`) - Authenticates a user and creates a server-side session.
* `POST /api/logout` (also `/api/auth/logout`) - Revokes the current session and clears its HttpOnly cookie.

These are POST API endpoints; opening `/api/register` directly in a browser sends a GET request
and returns `405 Method Not Allowed`. Submit the registration form or send a POST request with JSON.

Register and login accept JSON bodies with `email` and `password`; registration also requires
`firstName`, `lastName`, and `confirmPassword`, and accepts an optional `defaultVehicle`.
Successful requests return a JSON `user` object including the user's name and set an HttpOnly
session cookie. Sessions expire after seven days; the API stores only a hash of each random
session token. Users are stored in MongoDB with scrypt password hashes.

### User / Account Routes
* `GET /api/user/profile` - Retrieves the authenticated user's account information and preferences (e.g., default vehicle).
* `PUT /api/user/profile` - Updates the user's account information (e.g., name, email, or vehicle details).
* `PUT /api/user/password` - Updates the user's password.
* `DELETE /api/user/account` - Permanently deletes the user account and associated ledger data.

### Block Routes
* `POST /api/blocks` - Creates a new delivery block record.
* `GET /api/blocks` - Retrieves all blocks for the authenticated user.
* `PUT /api/blocks/:id` - Updates a specific block.
* `DELETE /api/blocks/:id` - Deletes a specific block.

### Maintenance Routes
* `POST /api/maintenance` - Creates a new maintenance record.
* `GET /api/maintenance` - Retrieves all maintenance records.
* `PUT /api/maintenance/:id` - Updates a specific maintenance record.
* `DELETE /api/maintenance/:id` - Deletes a specific maintenance record.

## Known Issues or Future Improvements
* **Known Issue:** Service Worker offline sync occasionally duplicates entries if the network toggles rapidly during form submission.
* **Future Improvement:** Implement a third-party API integration (e.g., Google Maps API) to automatically calculate `milesDriven` based on route start and end points.
* **Future Improvement:** Incorporate an OCR (Optical Character Recognition) library to automatically scan and parse paper gas receipts.