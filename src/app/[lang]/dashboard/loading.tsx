import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardLoading() {
    return (
        <div className="container mx-auto p-4 space-y-8">
            <div className="flex flex-col gap-2">
                <Skeleton className="h-10 w-48" />
                <Skeleton className="h-5 w-96" />
            </div>

            <div className="grid gap-8 lg:grid-cols-12">
                {/* Sidebar/List Area */}
                <div className="lg:col-span-4 space-y-4">
                    <Skeleton className="h-[500px] w-full rounded-2xl" />
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-4 space-y-4">
                    <Skeleton className="h-[400px] w-full rounded-2xl" />
                </div>

                {/* Profile/Detail Area */}
                <div className="lg:col-span-4 space-y-4">
                    <Skeleton className="h-[300px] w-full rounded-2xl" />
                </div>
            </div>
        </div>
    )
}
