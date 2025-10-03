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
   cd market-entry-intel-platform/frontend
   ```

2. **Install dependencies**
   ```bash
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
frontend/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── Card.tsx       # Card component for content blocks
│   │   ├── DataTable.tsx  # Generic table component
│   │   ├── Layout.tsx     # Main app layout with navigation
│   │   └── SectionHeader.tsx # Section headers
│   ├── features/          # Feature-specific pages
│   │   ├── landing/       # Landing page with form
│   │   ├── dashboard/     # Executive dashboard
│   │   ├── competitive/   # Competitive landscape
│   │   └── arbitrage/     # Segment arbitrage
│   ├── routes/            # Routing configuration
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # App entry point
│   └── index.css         # Global styles
├── package.json          # Dependencies and scripts
└── README.md            # This file
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

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Adding New Features
1. Create feature directory in `src/features/`
2. Follow existing component patterns
3. Use consistent font sizes and styling
4. Add routing in `src/routes/AppRoutes.tsx`
5. Update navigation in `src/components/Layout.tsx`

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

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 📞 Support

For questions or support, please open an issue in the GitHub repository or contact the development team.

---

**Built with ❤️ for smarter market entry decisions**
