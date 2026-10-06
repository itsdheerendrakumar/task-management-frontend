import { useState, useEffect } from "react";
import { getMessageFile } from "@/services/message";
import { FileIcon, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageAttachmentProps {
  messageId: string;
  format?: string;
  isMe: boolean;
}

export function MessageAttachment({ messageId, format, isMe }: MessageAttachmentProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let url: string | null = null;
    let mounted = true;

    async function loadFile() {
      try {
        const blob = await getMessageFile(messageId);
        if (mounted) {
          url = URL.createObjectURL(blob);
          setBlobUrl(url);
          setIsLoading(false);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to load attachment", err);
          setError(true);
          setIsLoading(false);
        }
      }
    }

    loadFile();

    return () => {
      mounted = false;
      if (url) {
        URL.revokeObjectURL(url);
      }
    };
  }, [messageId]);

  const isImage = format && ["jpg", "jpeg", "png", "gif", "webp"].includes(format.toLowerCase());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32 w-48 rounded-lg bg-muted/50 animate-pulse">
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (error || !blobUrl) {
    return (
      <div className="flex items-center p-3 rounded-md bg-destructive/10 text-destructive text-sm gap-2">
        <FileIcon className="size-4" />
        Failed to load attachment
      </div>
    );
  }

  if (isImage) {
    return (
      <div className="relative group overflow-hidden rounded-md border bg-muted mt-2 max-w-[280px]">
        <img 
          src={blobUrl} 
          alt="Attachment" 
          className="w-full object-cover max-h-64 rounded-md"
        />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a href={blobUrl} download={`attachment.${format}`}>
            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
              <Download className="size-4" />
            </Button>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-md border mt-2 ${isMe ? "bg-primary-foreground/10 border-primary-foreground/20" : "bg-muted"}`}>
      <div className={`flex items-center justify-center size-10 rounded-full ${isMe ? "bg-primary-foreground/20" : "bg-background"}`}>
        <FileIcon className={`size-5 ${isMe ? "text-primary-foreground" : "text-foreground"}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">Attachment.{format}</p>
        <p className="text-xs opacity-70 uppercase">{format}</p>
      </div>
      <a href={blobUrl} download={`attachment.${format}`}>
        <Button size="icon" variant="ghost" className={`size-8 ${isMe ? "hover:bg-primary-foreground/20 text-primary-foreground" : ""}`}>
          <Download className="size-4" />
        </Button>
      </a>
    </div>
  );
}
