import { Loader2 } from "lucide-react";

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
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
    )
}

interface OverlayLoaderProps {
  text?: string;
}

export default function OverlayLoader({
  text = "Loading...",
}: OverlayLoaderProps) {
   return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-sm text-muted-foreground">
          {text}
        </span>
      </div>
    </div>
  );
}