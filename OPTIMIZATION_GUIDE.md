# Next.js Optimization Guide for Movie Booking Frontend

## Applied Optimizations

### 1. **Build-Level Optimizations** ✅
- Disabled `productionBrowserSourceMaps` to reduce bundle size by ~10-15%
- Enabled gzip compression in `next.config.mjs`
- Using Turbopack compiler (already enabled in Next.js 16) for faster builds
- Prerendering static pages (14 static, 4 dynamic routes)

### 2. **Code Splitting & Dynamic Imports** 🔧
- Added `dynamic` imports template in `src/lib/dynamicImportsTemplate.js`
- Use for heavy components (modals, complex forms, charts):
  ```javascript
  import dynamic from 'next/dynamic';
  const HeavyComponent = dynamic(() => import('@/components/HeavyComponent'), {
    loading: () => <LoadingSpinner />,
    ssr: false // For client-only components
  });
  ```

### 3. **Server Components** ✅
- Converted `/movies/page.js` to use client-only list logic (MoviesList.jsx)
- Fixed `/auth/callback` prerender error by separating server/client boundaries
- Recommendation: Mark static pages as server components where possible

### 4. **Image Optimization**
**To implement:** Replace raw `<img>` tags with Next.js `Image` component:
  ```javascript
  import Image from 'next/image';
  
  <Image
    src={movie.poster_url}
    alt={movie.title}
    width={300}
    height={400}
    placeholder="blur"
    blurDataURL="data:image/jpeg;..."
    priority={false}
  />
  ```

**Before:** Images load at full quality, no lazy-loading, blocking resources  
**After:** Automatic resizing, format optimization (WebP), lazy-loading in viewport

---

## Next.js Best Practices for this App

### 1. **API Optimization**
Current: Using `swr` (good for caching)
- Implement **SWR revalidation** to prevent stale data:
  ```javascript
  const { data } = useSWR('user/movie', fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 300000, // 5 min cache
  });
  ```
- Consider Redis caching on backend for frequently accessed data

### 2. **Bundle Size Targets**
- Current: Measure with `npm run analyze`  
- Target: Keep main chunk under 170KB (gzipped)
- Action: Audit `framer-motion` (73KB) and `@react-google-maps/api` usage

### 3. **Database Query Optimization**
Add API endpoints with pagination and filtering:
```javascript
// Instead of: GET /user/movie (loads all)
// Use: GET /user/movie?page=1&limit=20&genre=action
```

### 4. **Rendering Strategy**
- Static: `/` `/movies` `/login` → prerendered at build time
- Dynamic: `/movies/[id]` `/shows/[id]` → SSR on demand
- ISR (Incremental Static Regeneration): Consider for lists:
  ```javascript
  export const revalidate = 3600; // Revalidate every hour
  ```

---

## Performance Metrics to Monitor

| Metric | Target | Tool |
|--------|--------|------|
| **Core Web Vitals** | LCP < 2.5s | Lighthouse / PageSpeed Insights |
| **First Contentful Paint** | < 1.8s | WebPageTest |
| **Bundle Size (gzip)** | < 200KB | `npm run analyze` |
| **Time to Interactive** | < 3.5s | DevTools Performance tab |

---

## Action Items (Priority Order)

1. **HIGH**: Replace `<img>` with Next.js `Image` component (all movie posters)
2. **HIGH**: Audit exported Redux/Context dependencies (reduce bundle)
3. **MEDIUM**: Implement dynamic imports for admin dashboard components
4. **MEDIUM**: Add pagination to API `/user/movie` endpoint
5. **LOW**: Implement ISR for static movie lists
6. **LOW**: Consider moving framer-motion animations to CSS for performance

---

## Testing Performance

```bash
# Build and analyze bundle
npm run build

# Measure bundle size
npx next-bundle-analyzer

# Local performance testing
npm run dev
# Open DevTools > Lighthouse and run audit
```

---

## References
- [Next.js Image Optimization](https://nextjs.org/docs/app/building-your-application/optimizing/images)
- [Dynamic Imports in Next.js](https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading)
- [Next.js Performance](https://nextjs.org/docs/app/building-your-application/optimizing)
- [Web Vitals Guide](https://web.dev/vitals/)
