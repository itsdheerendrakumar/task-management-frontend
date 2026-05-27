export function FullPageLoader() {
    return (
        <div className="flex items-center justify-center h-screen">
            <div className="w-10 h-10 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
        </div>
    );
}

export function SectionLoader() {
    return (
        <div className="flex items-center justify-center py-10 bg-white rounded-lg">
            <div className="w-8 h-8 border-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
    )
}