# Target User & Core Goal

The application is a **Personal Task & Habit Manager** designed for individual use. 
It helps organize one-off tasks with granular sub-tasks, sorts them using tags/categories, and tracks daily recurring activities using a calendar-based statistical view. It will be accessible as an easily launchable Desktop Application.

## User Review Required

> [!IMPORTANT]  
> Please review the User Stories and the proposed Data Model below. Let me know if anything is missing or if you'd like to adjust how we handle Daily Tasks (habits).

> [!WARNING]  
> **The Desktop App Requirement:** Packaging a PostgreSQL database, a .NET backend, and a Next.js frontend into a single installable PC app offline is extremely complex. 
> **Alternative Local Solution:** We can write a simple `start.bat` script that sits on your desktop. When you double-click it, it silently launches your database, your .NET backend, and your Next.js frontend in the background, and opens the app window for you without needing to type any commands.
> **Alternative Web Solution:** We host the database and backend online. The frontend becomes a **PWA (Progressive Web App)** that you install directly to your PC, behaving exactly like a desktop app.
> *See Open Questions below to let me know which you prefer!*

## User Stories

### Tasks & Sub-Tasks
* **As a user**, I want to create, read, update, and delete tasks so that I can keep track of what I need to do.
* **As a user**, I want to add sub-tasks to a main task so that I can break down large projects (like building this app!) into manageable steps.
* **As a user**, I want to set priorities and deadlines for tasks so that I know what to work on first.

### Organization (Tags/Categories)
* **As a user**, I want to create tags/categories (e.g., Coding, Exercise, Casual) and assign them to tasks so that I can filter my dashboard based on context.

### Daily Tasks & Analytics (Habit Tracking)
* **As a user**, I want to designate certain tasks as "Daily Tasks" (like Duolingo or 30 mins exercise) so they reset every day.
* **As a user**, I want a calendar-based statistical view of my daily tasks so that I can see my completion history and streaks.

### Accessibility
* **As a user**, I want to double-click a shortcut on my desktop to open the app without dealing with command lines (`yarn dev` or `dotnet run`).

## Proposed technical Data Model (PostgreSQL)

### `Tasks` Table
- `Id` (UUID, Primary Key)
- `Title` (String)
- `Description` (Text)
- `Priority` (Enum: Low, Medium, High)
- `Deadline` (DateTime, Nullable)
- `IsCompleted` (Boolean)
- `CreatedAt` (DateTime)

### `SubTasks` Table
- `Id` (UUID, Primary Key)
- `TaskId` (UUID, Foreign Key -> Tasks.Id)
- `Title` (String)
- `IsCompleted` (Boolean)

### `Tags` Table
- `Id` (UUID, Primary Key)
- `Name` (String)
- `ColorHex` (String)

### `TaskTags` Table (Many-to-Many)
- `TaskId` (UUID, Foreign Key)
- `TagId` (UUID, Foreign Key)

### `DailyTasks` Table (Habits Definition)
- `Id` (UUID, Primary Key)
- `Title` (String)
- `Description` (Text)
- `CreatedAt` (DateTime)
- `IsActive` (Boolean)

### `DailyTaskLogs` Table (Habit Tracking Calendar Data)
- `Id` (UUID, Primary Key)
- `DailyTaskId` (UUID, Foreign Key -> DailyTasks.Id)
- `Date` (Date)
- `IsCompleted` (Boolean)

## Architecture & Desktop Strategy Finalized

* **Frontend**: Next.js (React), Tailwind CSS.
* **Backend**: .NET Core Web API.
* **Database**: PostgreSQL (Entity Framework Core) - running locally in the background.

**Phase 1 MVP: The ".bat" App Simulator:**
We will first focus entirely on building a robust 100% Web App using your desired Next.js and .NET stack. To provide a desktop experience without any hassle, I will create a `StartTaskManager.bat` script.
When you double-click it:
1. It silently starts your .NET Core backend in the background.
2. It silently starts your Next.js app.
3. It launches a borderless, dedicated window using Chrome/Edge's "App Mode" (`--app=http://localhost:3000`), appearing perfectly like a native PC app.

**Phase 2: True Lightweight Native Desktop App (Low Priority):**
Once the web app and database structure are 100% complete and working flawlessly, we can plan to build a secondary true C# native desktop application to drastically reduce memory usage and allow it to live natively in your system tray/background.

### Core API Endpoints
* `GET /api/tasks` & `POST /api/tasks`
* `GET /api/tasks/{id}` & `PUT /api/tasks/{id}` & `DELETE /api/tasks/{id}`
* `POST /api/tasks/{id}/subtasks` & `PUT /api/subtasks/{id}`
* `GET /api/tags` & `POST /api/tags`
* `GET /api/dailytasks` & `POST /api/dailytasks`
* `GET /api/dailytasks/calendar?month=YYYY-MM` (fetches stats for the calendar)
* `POST /api/dailytasks/{id}/log` (marks a daily task as completed for today)

## Verification Plan
1. Stand up the PostgreSQL schema as designed using Entity Framework Core.
2. Ensure we have working `.NET` controllers.
3. Scaffold initial UI based on Next.js to ensure CRUD for sub-tasks, tags, and habit calendars work.
4. Implement and test the silent local launch script to verify it feels like a native desktop app.
