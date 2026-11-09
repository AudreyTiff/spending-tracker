# Project Title
$wish - an AI integrated Spending Tracker

## Description
A personal spending tracker that help user manage transactions, budget, and current savings. Some features utilise AI to automate tasks. 

Deployed website available at: https://swish-spending-tracker.vercel.app

__Features__
- Bank statement (PDF) upload and automatically extract and categorise transactions using AI
- AI highlights based on monthly spending trends
- Summary cards for spendings and transactions
- Custom budget for monthly spending
- Interactive spending visualisation with charts and graphs
- Add, edit and delete transactions manually
- Secure authentication using Google Sign-In

## Getting Started
__Tech Stack__
- Framework: Next.js
- Language: TypeScript
- UI and Styling: Tailwind CSS
- Database: PostgreSQL
- ORM: Prisma
- AI: OpenAI API
- Charts: Recharts
- Authentication: Google Sign-In, NextAuth.js
- File Extraction: Unpdf

__Steps to run locally__
1. Setup:
   - Ensure Node.js and PostgreSQL is installed locally, then clone the repository with "git clone https://github.com/AudreyTiff/spending-tracker.git"
2. Installation: 
   - Install dependencies with "npm install"
3. Create an .env file and fill in the keys AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET, AUTH_SECRET, DATABASE_URL, OPENAI_API_KEY.
    - Google API keys are from Google Cloud Console > API & Services > Credentials > Create Credentials > Create an OAuth client ID > Web application > add both URLs for request and callback (it can be localhost url to display the web application)
        Example link -> Authorized Javascript origins: http://localhost:3000 
                        Authorized redirect URIs: http://localhost:3000/api/auth/callback/google
    - AUTH SECRET key can be obtained by running "npx auth secret" in your terminal (without the quotation marks) 
    - OpenAI API key is generated from OpenAI website by creating an account and genrating a new API key or using an existing API key
    - DATABASE_URL is from Neon https://neon.tech website > create a new project > copy the connection string 
4. Run "npx prisma db push" to setup databse
5. Run the app locally using "npm run dev"
6. Open http://localhost:3000 in your browser
