'use client';

import { UserRoleManager } from '@/components/admin/user-role-manager';

export default function UsersPage() {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                <p className="text-muted-foreground">Manage roles and permissions for hospital staff.</p>
            </div>
            <UserRoleManager />
        </div>
    );
}
