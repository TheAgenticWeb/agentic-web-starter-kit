'use client';

/**
 * Auth0 Authentication Button
 * 
 * This component is ready to use but requires Auth0 setup.
 * See /docs/authentication.md for setup instructions.
 * 
 * To enable:
 * 1. Install: pnpm add @auth0/nextjs-auth0
 * 2. Configure environment variables
 * 3. Uncomment the code below
 */

export function AuthButton() {
  // Uncomment when Auth0 is configured:
  /*
  import { useUser } from '@auth0/nextjs-auth0/client';

  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="animate-pulse flex items-center gap-2">
        <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
        <div className="h-4 w-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        {user.picture && (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="h-8 w-8 rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700">
          {user.name || user.email}
        </span>
        <a
          href="/api/auth/logout"
          className="text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          Logout
        </a>
      </div>
    );
  }

  return (
    <a
      href="/api/auth/login"
      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
    >
      Login
    </a>
  );
  */

  // Placeholder until Auth0 is configured
  return (
    <div className="text-sm text-gray-500">
      Auth0 not configured.{' '}
      <a
        href="/docs/authentication.md"
        className="text-blue-600 hover:text-blue-700 underline"
      >
        Setup guide
      </a>
    </div>
  );
}
