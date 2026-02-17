'use client';

/**
 * Maps Firebase Auth error codes to user-friendly messages.
 * @param error Any error object, typically from Firebase Auth.
 * @returns A simplified error message string.
 */
export function mapAuthError(error: any): string {
    const errorCode = error?.code;

    switch (errorCode) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-email':
            return 'Invalid username or password.';
        case 'auth/email-already-in-use':
            return 'This email is already registered.';
        case 'auth/weak-password':
            return 'Password should be at least 6 characters.';
        case 'auth/too-many-requests':
            return 'Too many failed attempts. Please try again later.';
        case 'auth/user-disabled':
            return 'This account has been disabled.';
        case 'auth/operation-not-allowed':
            return 'Sign-in operation not allowed.';
        case 'profile-not-found':
            return 'User profile not found. Please try signing up again or contact support.';
        default:
            console.error('Unhandled Auth Error:', error);
            return 'An unexpected error occurred. Please try again.';
    }
}
