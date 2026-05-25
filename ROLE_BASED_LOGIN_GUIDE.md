# Role-Based Login & Access Control Guide

## Overview
Your application now has complete role-based access control with 3 user roles:

- **Admin (role_id: 1)** → `/admin/*` routes
- **Seller (role_id: 2)** → `/seller/*` routes
- **User (role_id: 3)** → `/movies`, `/checkout`, `/booking-success` routes

## Components Created

### 1. **AdminRoute** Component
- Restricts access to admin-only pages
- Redirects non-admins to their appropriate dashboard
- Usage: Wrap admin pages with this component

```jsx
import AdminRoute from "@/components/AdminRoute";

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <div>Admin Dashboard Content</div>
    </AdminRoute>
  );
}
```

### 2. **SellerRoute** Component
- Restricts access to seller-only pages
- Redirects non-sellers to their appropriate dashboard
- Usage: Wrap seller pages with this component

```jsx
import SellerRoute from "@/components/SellerRoute";

export default function SellerDashboard() {
  return (
    <SellerRoute>
      <div>Seller Dashboard Content</div>
    </SellerRoute>
  );
}
```

### 3. **UserRoute** Component
- Restricts access to regular user pages
- Redirects admin/sellers to their appropriate dashboard
- Usage: Wrap user-only pages with this component

```jsx
import UserRoute from "@/components/UserRoute";

export default function MoviesPage() {
  return (
    <UserRoute>
      <div>Movies Page</div>
    </UserRoute>
  );
}
```

## How It Works

### Login Flow (Already Implemented)
1. User enters email & password
2. Server validates and returns `token` + `user` object with `role_id`
3. Token and user stored in localStorage
4. User redirected based on role:
   - role_id === 1 → `/admin/dashboard`
   - role_id === 2 → `/seller/dashboard`
   - role_id === 3 → `/movies`

### Access Control Flow
When user tries to access a protected route:
1. Component checks if user is authenticated
2. Component checks user's role_id
3. If role matches, content is rendered
4. If role doesn't match, user is redirected to their correct dashboard
5. If not authenticated, user is redirected to login

## Enhanced AuthContext

The AuthContext now includes:
- `user` - User object with role_id
- `isAuthenticated` - Boolean
- `loading` - Boolean
- `login(token, userData)` - Login function
- `logout()` - Logout function
- `getUserRole()` - Returns role as string ("admin", "seller", "user")

### Usage in Components
```jsx
import { useAuth } from "@/contexts/AuthContext";

function MyComponent() {
  const { user, isAuthenticated, getUserRole } = useAuth();
  
  return (
    <div>
      {isAuthenticated && (
        <p>Welcome, {user.email}! You are a {getUserRole()}</p>
      )}
    </div>
  );
}
```

## Implementation Checklist

- [x] AdminRoute component created
- [x] SellerRoute component created
- [x] UserRoute component created
- [x] AuthContext enhanced with getUserRole()
- [x] PublicRoute updated with role-based redirection
- [x] Login already has role-based redirection

## Next Steps

1. Wrap your protected pages with appropriate route component:
   ```
   src/app/admin/* → Wrap with <AdminRoute>
   src/app/seller/* → Wrap with <SellerRoute>
   src/app/movies/* → Wrap with <UserRoute>
   src/app/checkout/* → Wrap with <UserRoute>
   ```

2. (Optional) Create separate login pages per role for UI customization:
   - `/login/admin`
   - `/login/seller`
   - `/login/user`

3. Test the flow:
   - Login as admin → Should redirect to `/admin/dashboard`
   - Login as seller → Should redirect to `/seller/dashboard`
   - Login as user → Should redirect to `/movies`

## Example: Wrapping a Page

```jsx
// src/app/seller/dashboard/page.js
"use client";

import SellerRoute from "@/components/SellerRoute";

const SellerDashboardPage = () => {
  return (
    <SellerRoute>
      <div>
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        {/* Your dashboard content */}
      </div>
    </SellerRoute>
  );
};

export default SellerDashboardPage;
```
