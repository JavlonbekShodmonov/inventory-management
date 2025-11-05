"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Heart, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  itemId: string;
  initialLikeCount: number;
  initialIsLiked: boolean;
}

export default function LikeButton({
  itemId,
  initialLikeCount,
  initialIsLiked,
}: LikeButtonProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isLiked, setIsLiked] = useState(initialIsLiked);
  const [loading, setLoading] = useState(false);

  const handleToggleLike = async () => {
    if (!session?.user) {
      alert("Please sign in to like items");
      return;
    }

    setLoading(true);

    try {
      const method = isLiked ? "DELETE" : "POST";
      const response = await fetch(`/api/items/${itemId}/like`, {
        method,
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }

      // Optimistic update
      if (isLiked) {
        setLikeCount(likeCount - 1);
        setIsLiked(false);
      } else {
        setLikeCount(likeCount + 1);
        setIsLiked(true);
      }

      router.refresh();
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Failed to update like");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleToggleLike}
      disabled={loading}
      className={cn(
        "gap-1",
        isLiked && "bg-red-600 hover:bg-red-700 text-white"
      )}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Heart
          className={cn("w-4 h-4", isLiked && "fill-current")}
        />
      )}
      <span>{likeCount}</span>
    </Button>
  );
}