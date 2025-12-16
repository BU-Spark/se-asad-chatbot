# Chat Suite - AI Assistant Management Platform

## Background

**Chat Suite** is a comprehensive web platform designed to empower users to create, customize, manage, and deploy AI-powered chatbots without requiring technical expertise. Built as part of the BU Spark! DS519 Software Applications and Innovation Lab course, this project enables individuals, organizations, and businesses to quickly build and integrate branded conversational assistants into their online presence.

The platform provides an intuitive interface where users can:
- Create custom AI assistants with personalized instructions and behaviors
- Organize assistants into groups for easier management
- Generate embeddable scripts for seamless website integration
- Track comprehensive analytics on token usage, costs, and performance
- Automatically summarize conversation contexts to maintain assistant memory

This no-code/low-code solution democratizes AI assistant creation, making it accessible to non-technical users while providing powerful customization options for advanced use cases.

---

## Technical Architecture

Chat Suite is built using a modern full-stack architecture:

### Frontend
- **Next.js 15** with App Router for server-side rendering and optimal performance
- **React 19** with TypeScript for type-safe component development
- **Clerk** for user authentication and session management
- **Tailwind CSS** and custom styling for responsive UI design

### Backend & Database
- **Next.js API Routes** for serverless backend functionality
- **Supabase (PostgreSQL)** for database management, storing:
  - User profiles and authentication data
  - AI assistant configurations and instructions
  - Conversation history and messages
  - Assistant groups and organizational data
  - Analytics and token usage metrics
  - Context summaries for long conversations

### AI Integration
- **OpenRouter API** for accessing various LLM models. 
- Custom prompt engineering for assistant personality and behavior.
- Token tracking and cost calculation for usage analytics.

### Automation
- **Node-cron** for scheduled tasks
- Automated context summarization job (runs daily at 2:00 AM)
- Batch processing of conversation messages

### CI/CD
- **GitHub Actions** for continuous integration
- **ESLint** for code quality enforcement
- **Jest** and **React Testing Library** for automated testing
- Pre-commit and pre-push Git hooks for code validation

### Data Flow
1. Users authenticate via Clerk and access the platform
2. Assistant creation requests are stored in Supabase
3. User conversations with assistants call OpenRouter API
4. Messages and token usage are logged to Supabase
5. Analytics queries aggregate data from the database
6. Cron jobs periodically summarize conversations for context retention
7. Embed widget loads assistant groups via iframe integration

---

## Features

### 1. **Assistant Creation** (`/assistant/create-chatbot`)
- Intuitive form-based interface for building custom AI assistants
- Pre-built example instructions for common use cases (customer support, technical docs, content creation, etc.)
- Real-time validation and submission feedback
- Automatic tracking enablement for analytics

### 2. **Assistant Management** (`/assistant/manage`)
- View all created assistants in an organized dashboard
- Group assistants for better organization
- Generate embeddable iframe code snippets
- Copy-to-clipboard functionality for quick deployment
- Search and filter capabilities

### 3. **Analytics Dashboard** (`/analytics`)
- Real-time token usage tracking across all assistants
- Cost calculation based on LLM pricing models
- Ranked list of assistants by total tokens consumed
- Summary cards showing total tokens, estimated costs, and assistant/group counts
- Visual performance metrics

### 4. **Context Summarization (Automated)**
- Daily cron job processes conversation history
- Batches messages in groups of 5 for efficient summarization
- Stores summaries with message range metadata
- Enables assistants to maintain context across long conversations
- Incremental processing prevents duplicate summarization

### 5. **Embeddable Widget**
- Lightweight JavaScript widget for third-party websites
- Two-line script integration
- Customizable appearance and behavior
- Supports multiple assistants per website via groups

---

## Setup Instructions

Follow these steps to get the project running on a fresh machine:

### Prerequisites
- **Node.js** (v18 or higher recommended)
- **npm**
- **Git** for version control
- Accounts for external services (see below)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd <project-directory>
```

### 2. Install Dependencies
```bash
# Install main project dependencies
npm install

# Navigate to embed widget directory and build
cd embed-widget
npm install
npm run build
cd ..
```

### 3. Set Up Environment Variables

Create a `.env.local` file in the root directory with the following keys:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret

# Supabase Database
PUBLIC_SUPABASE_URL=your_supabase_project_url
SUPABASE_SECRET_KEY=your_supabase_service_role_key

# OpenRouter API
OPENROUTER_API_KEY=your_openrouter_api_key

# Application URL
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

#### Where to Get API Keys:
- **Clerk**: Sign up at [clerk.com](https://clerk.com) and create a new application
- **Supabase**: Create a project at [supabase.com](https://supabase.com) and find keys in Project Settings → API
- **OpenRouter**: Register at [openrouter.ai](https://openrouter.ai) and generate an API key

### 4. Set Up Database Schema

Your Supabase database should include the following tables:
- `users` - User profiles and authentication data
- `assistants` - AI assistant configurations
- `conversations` - Conversation metadata
- `messages` - Individual conversation messages
- `groups` - Assistant groupings
- `analytics` - Token usage and cost tracking
- `summaries` - Context summarization data

*Note: Database schema migrations or seed files should be included in the project for automatic setup.*

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

### 6. Build for Production (Optional)

```bash
npm run build
npm start
```

### 7. Run Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run linter
npm run lint
```

---

## Known Issues

### Active Bugs

#### 1. Group Deletion Count Mismatch
**Issue**: When a group is deleted from the Manage Assistants page, it visually disappears from the list, but the total group count displayed in the analytics summary cards does not decrement accordingly.

**Impact**: 
- The analytics dashboard shows an incorrect group count
- User experience is confusing when numbers don't match visible groups
- Does not affect functionality of other features


**Workaround**: Refresh the analytics page to see the updated count

**Related Files**:
- `app/assistant/manage/page.tsx` - Group deletion logic
- `app/analytics/page.tsx` - Analytics count display
- `/api/analytics` - Backend analytics aggregation

**Proposed Fix**: Update the analytics count calculation to trigger on group deletion events, or implement real-time state synchronization between management and analytics views.

---

### Future Improvements

The following areas are identified for enhancement:
- Add bulk assistant operations (delete multiple, move to group)
- Implement assistant duplication feature
- Add export functionality for conversation history
- Enhance embed widget customization options
- Implement rate limiting for API calls
- Add user role management (admin, editor, viewer)

---

## Deployment

### Current Status
The project is **not yet deployed** to a production environment but is being prepared for deployment.

### Planned Deployment Platform: Vercel

#### Why Vercel?
- Seamless Next.js integration (built by the same team)
- Automatic deployments from Git repository
- Built-in CI/CD pipeline
- Serverless function support for API routes
- Free tier for small projects
- Easy environment variable management

#### Deployment Steps (When Ready)

1. **Prepare Environment Variables**
   - Add all `.env.local` variables to Vercel project settings
   - Ensure production API keys are used (not development keys)
   - Update `NEXT_PUBLIC_BASE_URL` to production domain

2. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   
   # Deploy
   vercel
   ```

3. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

4. **Database Considerations**
   - Supabase can remain as is (already cloud-hosted)
   - Update Supabase project settings to allow production domain

5. **Post-Deployment Testing**
   - Verify authentication flows
   - Test assistant creation and management
   - Check analytics data loading
   - Validate embed widget functionality
   - Monitor error logs and performance

#### Alternative Deployment Options
- **AWS Amplify**: Good for AWS-integrated projects
- **Railway**: Simple deployment with PostgreSQL support
- **Render**: Free tier with automatic deployments
- **DigitalOcean App Platform**: For more control over infrastructure

#### Deployment Checklist
- [ ] All environment variables configured
- [ ] Database migrations run on production DB
- [ ] API rate limits configured
- [ ] Error monitoring set up (e.g., Sentry)
- [ ] Analytics tracking configured
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Cron jobs configured for production
- [ ] Performance monitoring enabled

---

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Testing Philosophy
- **Focus on User Behavior**: Tests verify functionality from a user's perspective
- **Unit & Integration Tests**: Mix of isolated component tests and multi-component flows
- **Confidence Over Coverage**: Prioritize tests that cover critical user flows

### CI/CD Pipeline
- Runs automatically on push and pull requests
- Executes linting, testing, and builds
- Pre-commit hooks prevent committing unformatted code
- Pre-push hooks ensure tests pass before pushing

---

## Contributing

### Development Workflow

1. Create a new branch for your feature/fix
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes following the code style guidelines

3. Run tests and linting
   ```bash
   npm run lint
   npm test
   ```

4. Commit your changes
   ```bash
   git commit -m "feat: add your feature description"
   ```

5. Push to your branch and create a pull request
   ```bash
   git push origin feature/your-feature-name
   ```

### Code Style
- Follow ESLint and Prettier configurations
- Use TypeScript for type safety
- Write meaningful commit messages
- Add tests for new features
- Document complex logic with comments

---

## License

This project is developed as part of BU Spark! DS519 course.

---

## Contact & Support

For questions or issues related to this project:
- Create an issue in the GitHub repository
- Contact the development team through BU Spark!

---

**Project Team**: BU Spark! DS519 Fall 2025  
**Client**: Asad Malik, BU Spark! Innovation Engineer
