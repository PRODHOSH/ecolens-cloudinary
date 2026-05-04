# EcoLens

EcoLens is a real-time website media optimization and carbon reduction platform powered by Cloudinary.

## Features

- Scan any public website and extract images and videos
- Compare original vs optimized previews
- Cloudinary fetch transformations with AI cropping and enhancements
- Performance + sustainability metrics with CO2 savings
- Downloadable PDF report
- JS SDK and runtime image rewrite snippet

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase Auth (Google, GitHub, Email)
- Cheerio HTML parsing
- Cloudinary optimization
- Recharts analytics
- pdf-lib reporting

## Getting Started

1. Install dependencies:

	npm install

2. Create a local env file:

	copy .env.example to .env.local and add your keys

3. Run the dev server:

	npm run dev

## Environment Variables

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- CLOUDINARY_CLOUD_NAME (or NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME)

## Notes

- Some sites block iframe previews; the optimized preview uses sanitized HTML.
- Media sizes are estimated using best-effort headers when exact sizes are unavailable.
