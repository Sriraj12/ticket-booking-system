// Dynamic imports for code-splitting - defer loading until needed
// This reduces initial bundle size and improves Time to Interactive (TTI)

// Example: Defer Header component loading on slower connections
// import dynamic from 'next/dynamic';
// const Header = dynamic(() => import('@/components/Header'), {
//   loading: () => <div>Loading...</div>,
//   ssr: true // Set to false for client-only components
// });

// Heavy components like dialogs, modals, or complex forms should use dynamic imports
// const ComplexForm = dynamic(() => import('@/components/ComplexForm'), {
//   loading: () => <LoadingSpinner />,
//   ssr: false // Defer to client to save server rendering time
// });

export {};
