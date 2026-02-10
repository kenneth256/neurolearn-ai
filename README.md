# NeuronLearn 🧠

**An AI-Powered Adaptive Learning Platform**

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://neurolearn-ai.onrender.com)
[![GitHub](https://img.shields.io/badge/github-repository-blue)](https://github.com/kenneth256/neurolearn-ai)
[![Hackathon](https://img.shields.io/badge/hackathon-Gemini%203-orange)](https://devpost.com)

> Personalized education at scale through AI-driven content generation, mood analysis, and adaptive learning

---

## 🎯 Overview

NeuronLearn is an AI-powered adaptive learning platform that creates personalized educational experiences by integrating **Gemini 3** and **Veo3**. The platform adapts to each learner's mood, pace, and comprehension in real-time, providing dynamic course creation, personalized tutoring, and interactive learning experiences.

### Key Features

- 🎓 **Smart Course Generation** - Automatically generates comprehensive courses using Gemini 3
- 🎥 **AI Video Tutorials** - Creates immersive video content with Veo3
- 😊 **Mood & Engagement Tracking** - Real-time emotional state analysis
- 🤖 **Interactive AI Tutor Bot** - Conversational learning companion powered by Gemini 3
- 📊 **Adaptive Assessment** - Dynamic quiz generation based on performance
- 📈 **Progress Analytics** - Detailed mastery scores and learning patterns

---

## 🚀 Live Demo

**Production:** [https://neurolearn-ai.onrender.com](https://neurolearn-ai.onrender.com)

**GitHub:** [https://github.com/kenneth256/neurolearn-ai](https://github.com/kenneth256/neurolearn-ai/tree/main)

---

## 🛠 Tech Stack

### Core Technologies
- **Frontend:** Next.js, React, TypeScript
- **Backend:** Next.js API Routes, TypeScript
- **Database:** PostgreSQL (Neon), Prisma ORM
- **Caching:** Redis Cloud
- **Media:** Cloudinary

### AI Services
- **Gemini 3** - Content generation, tutor bot, analysis
- **Veo3** - Video synthesis and tutorial generation

### Infrastructure
- **Hosting:** Render
- **Database:** Neon Database (PostgreSQL)
- **Cache:** Redis Cloud
- **CDN:** Cloudinary

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **PostgreSQL** database (or use Neon)
- **Redis** instance (or use Redis Cloud)
- **Cloudinary** account
- **Gemini API** key
- **Veo API** credentials

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/kenneth256/neurolearn-ai.git
cd neurolearn-ai
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# Database Configuration (Neon PostgreSQL)
DATABASE_URL="postgresql://neondb_owner:npg_XIbVLtg04nis@ep-raspy-pine-aiql3jei-pooler.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Direct database connection for Prisma migrations
DIRECT_URL="postgresql://neondb_owner:npg_XIbVLtg04nis@ep-raspy-pine-aiql3jei.c-4.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Authentication
JWT_SECRET="test-secret-key-12345"

# AI Services
GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
VEO_API_KEY="VEO"
VEO_API_URL="VERO"

# Cloudinary (Media Storage)
CLOUDINARY_CLOUD_NAME=your_cloudinary_key
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret

# Redis (Caching)
REDIS_HOST=your_redis_host
REDIS_PORT=redis_port
REDIS_PASSWORD=redis_password
REDIS_DB="0"

# Environment
NODE_ENV="production"
```

⚠️ **CRITICAL SECURITY WARNING:** 
The credentials above are exposed in this README. For production deployment:
1. **IMMEDIATELY** rotate all API keys and database credentials
2. **NEVER** commit `.env` files to version control
3. Use environment variables or secret management services
4. Regenerate JWT secrets with strong random values
5. Enable IP whitelisting on database and Redis

### 4. Database Setup

```bash
# Generate Prisma Client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

# (Optional) Seed the database
npm run seed
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## 📊 Database Schema

NeuronLearn uses a comprehensive Prisma schema with 20+ interconnected models:

### Core Models
- **User** - Learner, instructor, and admin roles
- **Course** - Course hierarchy and metadata
- **Module** - Course modules with learning objectives
- **Lesson** - Individual lessons with content
- **Enrollment** - User-course enrollment tracking
- **Progress** - Multi-dimensional progress metrics
- **Assessment** - Quiz and test system
- **Submission** - Student work and grading
- **VideoSegment** - AI-generated video pipeline
- **MoodTracking** - Real-time emotional state analysis
- **LearnerProfile** - Personalization and learning patterns

### Key Relationships
```
Course → Modules → Lessons → Assessments
User → Enrollments → Progress → Submissions
Lesson → VideoSegments → GeneratedVideos
User → MoodTracking → AdaptiveDifficulty
```

---

## 🎓 Key Features Explained

### 1. Smart Course Generation

Automatically generates comprehensive courses from subject descriptions using Gemini 3:

- Structured learning modules with weekly plans
- Learning objectives and outcomes
- Assessments tailored to content
- AI-powered video tutorials via Veo3

```typescript
interface VideoSegment {
  segmentNumber: number;
  segmentPrompt: string;
  keyVisuals: Record<string, unknown>;
  targetDuration: number;
  status: SegmentStatus;
}
```

### 2. Adaptive Learning Engine

Real-time mood and engagement tracking:

- **Frustrated** → Supportive AI intervention + content simplification
- **Bored** → Increased challenge level + interactive elements
- **Confused** → Targeted micro-lessons on specific concepts
- **Engaged** → Maintains current difficulty

Dynamic difficulty adjustment based on performance:

```typescript
interface AdaptiveQuizParams {
  difficultyLevel: QuizDifficulty;
  focusAreas?: string[];
  learnerProfile: LearnerProfile;
  previousAttempts: QuizAttempt[];
}
```

### 3. Mastery Scoring Algorithm

Research-backed mathematical scoring with time decay:

**Mastery Score Formula:**
```
M = (Σ(s_i × w_i × d_i)) / Σ(w_i × d_i)
```

Where:
- **M** = Mastery score (0-100)
- **s_i** = Individual assessment score
- **w_i** = Assessment weight (based on difficulty)
- **d_i** = e^(-λt_i) = Time decay factor
- **λ** = Decay constant (default: 0.1)
- **t_i** = Days since assessment i

**Difficulty Progression Formula:**
```
D_new = D_current + α × tanh(r - 0.7)
```

Where:
- **D** = Difficulty level
- **r** = Recent accuracy rate
- **α** = Adjustment magnitude control

### 4. Interactive AI Tutor Bot

- Context-aware assistance with dialogue history
- Socratic questioning for deeper understanding
- Personalized capstone project mentorship
- Powered by Gemini 3 flash preview

---

## 🏗 Architecture

### Event-Driven Design
- Async operations for long-running AI tasks
- Job queue with priority scheduling
- Idempotent retry logic with state persistence
- Webhook handlers for completion notifications

### Caching Strategy
- Intelligent caching for similar learner profiles
- Prompt templates with variable substitution
- Content-based hashing for video generation
- Redis for session and API response caching

### Type Safety
- End-to-end TypeScript throughout
- Zod schemas for runtime validation
- Branded types for ID differentiation
- Discriminated unions for state machines
- Exhaustive pattern matching

---

## 📈 API Usage Examples

### Create a Course

```typescript
// POST /api/courses
{
  "title": "Introduction to Machine Learning",
  "description": "Learn ML fundamentals with hands-on projects",
  "subject": "Computer Science",
  "difficultyLevel": "intermediate",
  "duration": 8 // weeks
}
```

### Track Student Progress

```typescript
// GET /api/progress/:enrollmentId
Response:
{
  "courseCompletion": 65,
  "masteryScore": 78.5,
  "currentStreak": 7,
  "timeInvested": 1200, // minutes
  "moodAnalysis": {
    "dominant": "engaged",
    "trends": ["improving", "consistent"]
  }
}
```

### Generate Adaptive Quiz

```typescript
// POST /api/assessments/adaptive
{
  "lessonId": "lesson-123",
  "difficulty": "auto",
  "questionCount": 10,
  "focusAreas": ["arrays", "recursion"]
}
```

### AI Tutor Chat

```typescript
// POST /api/tutor/chat
{
  "message": "I'm confused about recursion",
  "context": {
    "currentLesson": "lesson-123",
    "recentTopics": ["functions", "loops"]
  }
}
```

---

## 🔐 Security Best Practices

### Production Deployment Checklist

- [ ] **Rotate all API keys** - Database, Gemini, Veo, Redis, Cloudinary
- [ ] **Generate strong JWT secret** - Use crypto.randomBytes(32)
- [ ] **Enable database SSL** - Already configured in connection string
- [ ] **Set up CORS policies** - Restrict origins in production
- [ ] **Implement rate limiting** - Protect API endpoints
- [ ] **Enable WAF** - Web Application Firewall
- [ ] **Configure proper logging** - Don't log sensitive data
- [ ] **Set up monitoring** - Uptime, performance, errors
- [ ] **Database backups** - Automated daily backups
- [ ] **User authentication** - Implement OAuth2/OIDC
- [ ] **Input validation** - Sanitize all user inputs
- [ ] **HTTPS only** - Enforce SSL in production

### Immediate Action Required

```bash
# 1. Rotate database credentials
# Go to Neon dashboard → Settings → Reset password

# 2. Regenerate Gemini API key
# Visit Google AI Studio → API Keys → Create new key

# 3. Rotate Redis password
# Redis Cloud dashboard → Database → Security → Change password

# 4. Regenerate Cloudinary credentials
# Cloudinary dashboard → Settings → Security → Reset keys

# 5. Generate new JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## 🚧 Roadmap

### Near-Term (Q1 2026) ✅
- [x] Core platform with Gemini 3 integration
- [x] Video generation with Veo3
- [x] Mood tracking system
- [ ] AI-graded capstone projects
- [ ] Enhanced analytics dashboard
- [ ] Multi-modal learning (audio, code playgrounds)

### Mid-Term (Q2-Q3 2026)
- [ ] Peer learning features with AI moderation
- [ ] Multi-language support + real-time translation
- [ ] Voice-based AI tutor
- [ ] Mobile apps (iOS/Android)
- [ ] VR/AR integration for immersive learning

### Long-Term (2026+)
- [ ] Open API for third-party integrations
- [ ] White-label solutions for schools
- [ ] Research partnerships with universities
- [ ] Free tier for underserved communities
- [ ] LMS integrations (Canvas, Moodle, Blackboard)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Write TypeScript with strict mode enabled
- Follow Prisma naming conventions
- Add Zod validation for all API inputs
- Write unit tests for business logic
- Document complex algorithms
- Use semantic commit messages

---

## 🐛 Troubleshooting

### Common Issues

**Database Connection Errors:**
```bash
# Verify connection string format
# Ensure SSL is enabled (?sslmode=require)
# Check IP whitelist in Neon dashboard
```

**Redis Connection Failed:**
```bash
# Verify Redis host and port
# Check password is correct
# Ensure firewall allows connection
```

**Gemini API Errors:**
```bash
# Verify API key is valid
# Check quota limits
# Review request format
```

**Build Failures:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📝 License

This project is created for the Gemini 3 Hackathon. 

**License:** MIT (subject to change)

---

## 👨‍💻 Author

**Magombe Kenneth David**

- GitHub: [@kenneth256](https://github.com/kenneth256)
- Project Live: [NeuronLearn](https://neurolearn-ai.onrender.com)
- Hackathon: [Gemini 3 Hackathon](https://devpost.com)

---

## 🙏 Acknowledgments

- **Gemini 3 Hackathon** - For the opportunity to build this platform
- **Google Gemini Team** - For the powerful AI capabilities
- **Veo3** - For advanced video generation
- **Neon Database** - For serverless PostgreSQL
- **Redis Cloud** - For managed caching
- **Cloudinary** - For media management
- **Render** - For reliable hosting

---

## 📞 Support

For questions, issues, or feature requests:

1. **GitHub Issues:** [Report a bug](https://github.com/kenneth256/neurolearn-ai/issues)
2. **Documentation:** [Read the docs](https://neurolearn-ai.onrender.com/docs)
3. **Email:** Contact via GitHub profile

---

## 🎯 Hackathon Submission

**Event:** Gemini 3 Hackathon  
**Submission Date:** February 9, 2026 at 8:00 PM EST  
**Category:** Educational Technology / AI Innovation  
**Status:** ✅ Submitted

### Technical Achievements
- ✅ End-to-end TypeScript with comprehensive type safety
- ✅ Integration of 3 AI services (Gemini 3, Veo3, mood analysis)
- ✅ 20+ interconnected database models with Prisma
- ✅ Real-time mood tracking and adaptive difficulty
- ✅ Mathematical rigor in mastery scoring algorithms
- ✅ Production-ready deployment on Render
- ✅ Comprehensive documentation and testing

### Innovation Highlights
- **Mood-Aware Learning:** First platform to adapt content based on real-time emotional state
- **AI Video Generation:** Automatic course video creation using Veo3
- **Mathematical Precision:** Research-backed algorithms for learning optimization
- **Scalable Architecture:** Type-safe, event-driven design for thousands of concurrent users

---

## 📊 Project Stats

- **Lines of Code:** 15,000+ (TypeScript)
- **Database Models:** 20+
- **API Endpoints:** 40+
- **AI Integrations:** 3 (Gemini 3, Veo3, custom mood analysis)
- **Development Time:** 2 weeks
- **Team Size:** Solo developer

---

## 🌟 Key Learnings

### Technical Skills
- Advanced TypeScript with generics and branded types
- Complex database design with Prisma
- AI service orchestration with different latencies
- Event-driven architecture for async operations
- Mathematical modeling for educational algorithms

### Educational Technology Insights
- Mood analytics significantly impact learner retention
- Spaced repetition aligns with cognitive science
- Optimal challenge zone crucial for engagement
- AI automation must maintain pedagogical quality

---

**Built with ❤️ using TypeScript, Next.js, Prisma, and AI**

🧠 **Making personalized education accessible at scale**

---

## 🚀 Quick Start Commands

```bash
# Clone and setup
git clone https://github.com/kenneth256/neurolearn-ai.git
cd neurolearn-ai
npm install

# Setup environment
cp .env.example .env
# Edit .env with your credentials

# Database setup
npx prisma generate
npx prisma migrate deploy

# Run development
npm run dev

# Build for production
npm run build
npm start
```

---