'use client';

export default function SettingsPage() {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and platform preferences.</p>
            </div>
            <div className="p-8 border-2 border-dashed rounded-3xl flex items-center justify-center bg-muted/20">
                <p className="text-muted-foreground">Settings configuration panel coming soon.</p>
            </div>
        </div>
    );
}
