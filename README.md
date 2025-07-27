# Market Entry Intelligence Platform

> AI-Powered Market Analysis for B2B Market Entry Decisions

A comprehensive web application that helps businesses analyze market entry opportunities through competitive landscape mapping, segment arbitrage detection, and executive dashboard insights.

## 🚀 Features

### Core MVP Features

#### 1. **Competitive Landscape Mapping**
- Automatically identifies and analyzes 3–5 key competitors in target markets
- Extracts pricing tiers, product positioning, and branding data
- Provides visual competitor comparisons and market saturation analysis
- Consumer sentiment snapshots from public digital sources

#### 2. **Segment Arbitrage Detection**
- Detects positioning gaps between home and target markets
- Identifies underserved or higher-value market segments
- Recommends alternate positioning strategies
- Enables effective brand repositioning using existing strengths

#### 3. **Executive Summary Dashboard**
- Consolidated insights for executive decision-making
- Market opportunity overview with key metrics
- Strategic recommendations and action items
- Revenue projections and market share targets
- Downloadable/exportable format (PDF ready)

### User Experience
- **Responsive Design**: Works seamlessly across desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface with consistent design system
- **Intuitive Navigation**: Collapsible sidebar with smooth animations
- **Form Integration**: User-friendly data collection for market analysis

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern UI library with functional components
- **TypeScript** - Type-safe development and better maintainability
- **Vite** - Fast build tool and development server
- **Chakra UI** - Component library for rapid prototyping and consistent design
- **React Router v6** - Client-side routing and navigation
- **React Query** - Server state management and data fetching
- **React Icons** - Comprehensive icon library

### Development Tools
- **ESLint** - Code linting and quality assurance
- **TypeScript** - Static type checking
- **Git** - Version control

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository**
   ```bash
   git clone https://github.com/taenam1214/market-entry-intel-platform.git
   cd market-entry-intel-platform
   ```

2. **Install frontend dependencies**
   ```bash
   cd frontend
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173`

## 🏗 Project Structure

```
market-entry-intel-platform/
├── frontend/              # React frontend application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── features/     # Feature-specific pages
│   │   ├── routes/       # Routing configuration
│   │   ├── App.tsx      # Main app component
│   │   ├── main.tsx     # App entry point
│   │   └── index.css    # Global styles
│   ├── package.json     # Frontend dependencies
│   └── README.md        # Frontend documentation
├── backend/              # Future backend implementation
├── docs/                 # Project documentation
├── LICENSE              # Project license
└── README.md           # This file
```

## 🎨 Design System

### Font Sizes
- **Page Headers**: `size="xl"` (20px)
- **Section Headers**: `size="md"` (16px)
- **Descriptions**: `fontSize="lg"` (18px)
- **Body Text**: `fontSize="sm"` (14px)
- **Form Labels**: `fontSize="sm"` (14px)
- **Metric Values**: `fontSize="xl"` (20px)

### Color Palette
- **Primary**: Purple gradient (`#667eea` to `#764ba2`)
- **Background**: Light gray (`gray.50`)
- **Text**: Dark gray (`gray.800`) for headers, medium gray (`gray.600`) for body
- **Accent**: Blue, green, orange, purple for different metrics and categories

## 🚀 Usage

### Landing Page
1. Fill out the market entry analysis form
2. Provide company information and target market details
3. Submit to receive personalized insights

### Navigation
- **Home**: Landing page with analysis form
- **Executive Dashboard**: Overview of market intelligence
- **Competitive Landscape**: Detailed competitor analysis
- **Segment Arbitrage**: Market positioning insights

### Dashboard Features
- **Key Metrics**: Market opportunity score, competitive intensity, entry complexity
- **Market Overview**: Progress tracking and readiness assessment
- **Competitor Analysis**: Market share and threat level analysis
- **Key Insights**: Priority-based recommendations
- **Revenue Projections**: Year 1 and Year 3 forecasts
- **Action Items**: Immediate, short-term, and long-term recommendations

## 🔧 Development

### Frontend Development

#### Available Scripts
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

#### Adding New Features
1. Create feature directory in `frontend/src/features/`
2. Follow existing component patterns
3. Use consistent font sizes and styling
4. Add routing in `frontend/src/routes/AppRoutes.tsx`
5. Update navigation in `frontend/src/components/Layout.tsx`

### Backend Development (Future)
- API development for data processing
- Database integration for user data
- Authentication and user management
- Real-time market data integration

## 📱 Responsive Design

The application is fully responsive with:
- **Mobile-first approach**
- **Collapsible navigation** on smaller screens
- **Flexible grid layouts** that adapt to screen size
- **Touch-friendly interface** elements
- **Optimized typography** scaling

## 🔮 Future Enhancements

### Phase 2 Features (Post-MVP)
- **Brand Perception Sentiment Analysis**: Social media and news sentiment
- **Cultural Risk Assessment**: Brand asset analysis for cultural alignment
- **Market Opportunity vs. Entry Complexity Score**: Go/no-go decision framework
- **PDF Export**: Executive summary downloads
- **Authentication**: User accounts and data persistence
- **Backend Integration**: Real data processing and analysis

### Backend Features
- **RESTful API**: Data processing and analysis endpoints
- **Database**: User data and analysis results storage
- **Authentication**: Secure user login and session management
- **Data Sources**: Integration with market research APIs
- **Analytics**: Usage tracking and performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the established design system
- Use TypeScript for type safety
- Write clean, documented code
- Test features thoroughly
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Support

For questions or support, please open an issue in the GitHub repository or contact the development team.

---

## 🔧 Backend Requirements & Architecture

> **For Backend Engineer**: This section outlines the complete backend requirements to make the platform fully functional with real data processing and analysis.

### 🏗 System Architecture

#### Recommended Tech Stack
- **Framework**: Node.js with Express.js or Python with FastAPI
- **Database**: PostgreSQL (primary) + Redis (caching)
- **Authentication**: JWT tokens with refresh mechanism
- **File Storage**: AWS S3 or similar for document storage
- **Queue System**: Redis Bull or Celery for background jobs
- **API Documentation**: Swagger/OpenAPI
- **Testing**: Jest (Node.js) or pytest (Python)
- **Deployment**: Docker containers with Kubernetes or AWS ECS

### 📊 Database Schema

#### Core Tables

**Users**
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  industry VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Market Analysis Sessions**
```sql
CREATE TABLE market_analysis_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  target_market VARCHAR(255) NOT NULL,
  current_positioning TEXT,
  brand_description TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);
```

**Competitors**
```sql
CREATE TABLE competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES market_analysis_sessions(id),
  name VARCHAR(255) NOT NULL,
  website VARCHAR(500),
  price_tier VARCHAR(50),
  value_proposition TEXT,
  market_share DECIMAL(5,2),
  strength_level VARCHAR(20),
  threat_level VARCHAR(20),
  sentiment_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Market Insights**
```sql
CREATE TABLE market_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES market_analysis_sessions(id),
  insight_type VARCHAR(50),
  title VARCHAR(255),
  description TEXT,
  priority VARCHAR(20),
  category VARCHAR(50),
  confidence_score DECIMAL(3,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Metrics & KPIs**
```sql
CREATE TABLE market_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES market_analysis_sessions(id),
  metric_name VARCHAR(100),
  metric_value DECIMAL(10,2),
  metric_unit VARCHAR(20),
  change_percentage DECIMAL(5,2),
  trend_direction VARCHAR(10),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 🔌 API Endpoints

#### Authentication
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/refresh
POST /api/auth/logout
GET  /api/auth/profile
```

#### Market Analysis
```
POST   /api/analysis/start
GET    /api/analysis/:sessionId
GET    /api/analysis/:sessionId/status
POST   /api/analysis/:sessionId/cancel
DELETE /api/analysis/:sessionId
```

#### Dashboard Data
```
GET /api/dashboard/:sessionId/overview
GET /api/dashboard/:sessionId/metrics
GET /api/dashboard/:sessionId/competitors
GET /api/dashboard/:sessionId/insights
GET /api/dashboard/:sessionId/recommendations
```

#### Competitor Analysis
```
GET /api/competitors/:sessionId
GET /api/competitors/:sessionId/:competitorId
POST /api/competitors/:sessionId/refresh
```

#### Segment Arbitrage
```
GET /api/arbitrage/:sessionId/analysis
GET /api/arbitrage/:sessionId/opportunities
GET /api/arbitrage/:sessionId/recommendations
```

#### Export & Reports
```
GET /api/reports/:sessionId/pdf
GET /api/reports/:sessionId/excel
POST /api/reports/:sessionId/schedule
```

### 🤖 Data Processing Pipeline

#### 1. **Competitive Intelligence Engine**
```typescript
interface CompetitorAnalysis {
  // Web scraping and data extraction
  scrapeCompetitorData(domain: string): Promise<CompetitorData>
  
  // Sentiment analysis
  analyzeSentiment(text: string): Promise<SentimentScore>
  
  // Market positioning analysis
  analyzePositioning(competitorData: CompetitorData[]): Promise<PositioningAnalysis>
  
  // Pricing analysis
  analyzePricing(competitors: CompetitorData[]): Promise<PricingAnalysis>
}
```

#### 2. **Market Research Integration**
```typescript
interface MarketResearchAPI {
  // External data sources
  getMarketSize(industry: string, region: string): Promise<MarketSizeData>
  getIndustryTrends(industry: string): Promise<TrendData[]>
  getEconomicIndicators(region: string): Promise<EconomicData>
  
  // Social media sentiment
  getSocialSentiment(brand: string, platform: string): Promise<SentimentData>
  
  // News and media analysis
  getMediaCoverage(brand: string, timeframe: string): Promise<MediaData[]>
}
```

#### 3. **AI/ML Analysis Engine**
```typescript
interface AIAnalysisEngine {
  // Segment identification
  identifySegments(marketData: MarketData): Promise<MarketSegment[]>
  
  // Arbitrage detection
  detectArbitrageOpportunities(
    homeMarket: MarketData,
    targetMarket: MarketData
  ): Promise<ArbitrageOpportunity[]>
  
  // Recommendation engine
  generateRecommendations(
    analysis: CompleteAnalysis
  ): Promise<StrategicRecommendation[]>
  
  // Risk assessment
  assessEntryRisks(marketData: MarketData): Promise<RiskAssessment>
}
```

### 📈 Background Jobs & Processing

#### Job Queue Structure
```typescript
interface BackgroundJobs {
  // Market analysis pipeline
  'market-analysis': {
    data: {
      sessionId: string
      userInput: UserInput
    }
    steps: [
      'validate-input',
      'scrape-competitors',
      'analyze-sentiment',
      'generate-insights',
      'create-dashboard',
      'notify-completion'
    ]
  }
  
  // Data refresh jobs
  'refresh-competitor-data': {
    data: { sessionId: string }
    frequency: 'daily'
  }
  
  // Report generation
  'generate-report': {
    data: { sessionId: string, format: 'pdf' | 'excel' }
  }
}
```

### 🔐 Security & Authentication

#### JWT Token Structure
```typescript
interface JWTPayload {
  userId: string
  email: string
  companyId?: string
  permissions: string[]
  exp: number
  iat: number
}
```

#### API Security
- **Rate Limiting**: 100 requests per minute per user
- **CORS**: Configured for frontend domain
- **Input Validation**: Joi or Zod schemas
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Input sanitization

### 📊 External API Integrations

#### Required Third-Party Services
1. **Web Scraping**: ScrapingBee, Bright Data, or Puppeteer
2. **Sentiment Analysis**: Google Cloud NLP, AWS Comprehend, or Hugging Face
3. **Market Data**: Statista, IBISWorld, or Euromonitor
4. **Social Media**: Twitter API, LinkedIn API, Facebook Graph API
5. **News Sources**: NewsAPI, GDELT, or RSS feeds
6. **Email Service**: SendGrid, Mailgun, or AWS SES
7. **File Storage**: AWS S3, Google Cloud Storage
8. **Monitoring**: Sentry, DataDog, or New Relic

### 🤖 AI/ML Integration Strategy

#### **Recommended AI Stack for Asian Markets**

**Primary AI Providers:**
1. **Qwen AI (Alibaba Cloud)** - Primary for Chinese market analysis
   - **Strengths**: Superior Chinese language understanding, local market knowledge
   - **Use Cases**: Chinese competitor analysis, local sentiment, cultural insights
   - **Models**: Qwen2.5-72B, Qwen2.5-32B, Qwen2.5-14B
   - **Cost**: ~$0.0006/1K tokens (very competitive)

2. **Claude (Anthropic)** - Secondary for global analysis
   - **Strengths**: Excellent reasoning, multilingual capabilities, safety
   - **Use Cases**: Strategic analysis, risk assessment, global positioning
   - **Models**: Claude 3.5 Sonnet, Claude 3.5 Haiku
   - **Cost**: ~$0.003/1K input, $0.015/1K output

3. **OpenAI GPT-4** - Alternative for comprehensive analysis
   - **Strengths**: Broad knowledge, excellent for complex reasoning
   - **Use Cases**: Market opportunity analysis, competitive positioning
   - **Models**: GPT-4 Turbo, GPT-4o
   - **Cost**: ~$0.01/1K input, $0.03/1K output

#### **AI Integration Architecture**

```typescript
interface AIOrchestrator {
  // Route requests based on content and market
  routeAnalysisRequest(input: AnalysisInput): Promise<AIProvider>
  
  // Chinese market specific analysis
  analyzeChineseMarket(data: ChineseMarketData): Promise<AnalysisResult>
  
  // Global market analysis
  analyzeGlobalMarket(data: GlobalMarketData): Promise<AnalysisResult>
  
  // Cross-validation between AI providers
  crossValidateResults(results: AIResult[]): Promise<ValidatedResult>
}
```

#### **Market-Specific AI Routing**

```typescript
interface MarketAIAssignment {
  // Chinese market (Qwen AI primary)
  'zh-CN': {
    primary: 'qwen-ai'
    fallback: 'claude'
    useCases: [
      'competitor-analysis',
      'sentiment-analysis',
      'cultural-assessment',
      'local-trends'
    ]
  }
  
  // Japanese market (Qwen AI + Claude)
  'ja-JP': {
    primary: 'qwen-ai'
    secondary: 'claude'
    useCases: [
      'market-positioning',
      'brand-analysis',
      'consumer-insights'
    ]
  }
  
  // Korean market (Qwen AI + Claude)
  'ko-KR': {
    primary: 'qwen-ai'
    secondary: 'claude'
    useCases: [
      'competitive-landscape',
      'market-entry-strategy'
    ]
  }
  
  // Global markets (Claude primary)
  'global': {
    primary: 'claude'
    fallback: 'openai'
    useCases: [
      'strategic-analysis',
      'risk-assessment',
      'opportunity-identification'
    ]
  }
}
```

#### **Web Scraping Strategy for Asian Markets**

**Recommended Tools:**
1. **Bright Data** - Best for Chinese websites
   - **Strengths**: Excellent Chinese proxy network, handles anti-bot measures
   - **Use Cases**: Baidu, Weibo, Taobao, JD.com scraping
   - **Cost**: ~$500/month for residential proxies

2. **ScrapingBee** - Good for general Asian markets
   - **Strengths**: Easy API, good success rates
   - **Use Cases**: General web scraping, social media
   - **Cost**: ~$49/month for 1000 requests

3. **Puppeteer + Custom Proxies** - Cost-effective option
   - **Strengths**: Full control, customizable
   - **Use Cases**: Specific sites, custom logic
   - **Cost**: ~$100/month for proxy services

#### **AI-Enhanced Web Scraping Pipeline**

```typescript
interface EnhancedScrapingPipeline {
  // 1. Content extraction with AI
  extractContentWithAI(html: string, language: string): Promise<StructuredData>
  
  // 2. Language-specific processing
  processChineseContent(content: string): Promise<ChineseAnalysis>
  processJapaneseContent(content: string): Promise<JapaneseAnalysis>
  processKoreanContent(content: string): Promise<KoreanAnalysis>
  
  // 3. AI-powered data cleaning
  cleanAndValidateData(rawData: any): Promise<CleanData>
  
  // 4. Sentiment analysis per market
  analyzeMarketSentiment(text: string, market: string): Promise<SentimentResult>
}
```

#### **Cost Optimization Strategy**

```typescript
interface CostOptimization {
  // Smart model selection based on task complexity
  selectModel(task: string, complexity: 'low' | 'medium' | 'high'): string
  
  // Batch processing for efficiency
  batchProcessRequests(requests: AIRequest[]): Promise<BatchResult>
  
  // Cache frequently requested analyses
  cacheAnalysisResults(query: string, result: AnalysisResult): void
  
  // Fallback chain for cost control
  fallbackChain: ['qwen-ai', 'claude', 'openai']
}
```

#### **Implementation Priority for AI Integration**

**Phase 1 (MVP):**
1. **Qwen AI integration** for Chinese market analysis
2. **Basic web scraping** with Bright Data
3. **Simple sentiment analysis** using Qwen AI
4. **Competitor data extraction** from Chinese websites

**Phase 2 (Enhanced):**
1. **Claude integration** for global analysis
2. **Advanced scraping** with anti-bot bypass
3. **Cross-market analysis** and comparison
4. **AI-powered insights** generation

**Phase 3 (Advanced):**
1. **Multi-AI orchestration** and routing
2. **Real-time analysis** and updates
3. **Predictive analytics** using historical data
4. **Custom AI model fine-tuning** for specific markets

### 🧪 Testing Strategy

#### Test Categories
```typescript
interface TestSuite {
  // Unit tests
  unit: {
    'data-processing': 'Test individual analysis functions'
    'api-endpoints': 'Test API route handlers'
    'database-operations': 'Test CRUD operations'
  }
  
  // Integration tests
  integration: {
    'api-workflow': 'Test complete API workflows'
    'database-integration': 'Test database interactions'
    'external-apis': 'Test third-party integrations'
  }
  
  // End-to-end tests
  e2e: {
    'user-journey': 'Test complete user workflows'
    'data-pipeline': 'Test full analysis pipeline'
  }
}
```

### 📈 Performance Requirements

#### Response Times
- **API Endpoints**: < 200ms for simple operations
- **Analysis Start**: < 2s for job queuing
- **Dashboard Load**: < 1s for cached data
- **Report Generation**: < 30s for PDF/Excel exports

#### Scalability
- **Concurrent Users**: Support 1000+ simultaneous users
- **Data Processing**: Handle 100+ analysis jobs per hour
- **Database**: Optimize for 1M+ records
- **Caching**: Redis cache with 95% hit rate

### 🔄 Data Flow Architecture

```
User Input → API Gateway → Authentication → Input Validation → 
Job Queue → Data Processing Pipeline → Database Storage → 
Cache Update → Frontend Notification → Dashboard Update
```

### 📋 Implementation Priority

#### Phase 1 (MVP Backend)
1. **Basic API structure** with authentication
2. **Database setup** with core tables
3. **Simple competitor scraping** (basic web scraping)
4. **Mock data generation** for dashboard
5. **Basic job queue** for analysis processing

#### Phase 2 (Enhanced Features)
1. **Advanced data sources** integration
2. **AI/ML analysis** implementation
3. **Real-time updates** and notifications
4. **Advanced reporting** and exports
5. **Performance optimization** and caching

#### Phase 3 (Scale & Polish)
1. **Advanced analytics** and insights
2. **Multi-tenant** architecture
3. **Advanced security** features
4. **Monitoring** and alerting
5. **API rate limiting** and optimization

### 🚀 Deployment Considerations

#### Environment Setup
- **Development**: Docker Compose with local databases
- **Staging**: AWS/GCP with staging environment
- **Production**: Kubernetes or managed services
- **CI/CD**: GitHub Actions or GitLab CI

#### Monitoring & Logging
- **Application Logs**: Winston or Pino
- **Error Tracking**: Sentry
- **Performance Monitoring**: DataDog or New Relic
- **Health Checks**: `/health` endpoint with dependencies

---

**Built with ❤️ for smarter market entry decisions**
