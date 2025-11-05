"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send, MessageSquare } from "lucide-react";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import TextareaAutosize from "react-textarea-autosize";
import { useLocale } from "@/components/providers/locale-provider";

interface DiscussionTabProps {
  inventoryId: string;
  initialComments: any[];
}

function isoToDateTime(iso?: string | null) {
  if (!iso) return "—";
  // produce "YYYY-MM-DD HH:MM"
  const datePart = iso.slice(0, 10);
  const timePart = iso.slice(11, 16); // "HH:MM"
  return `${datePart} ${timePart}`;
}

export default function DiscussionTab({
  inventoryId,
  initialComments,
}: DiscussionTabProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [comments, setComments] = useState(initialComments || []);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Real-time updates - poll every 3 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/inventories/${inventoryId}/comments`);
        if (response.ok) {
          const newComments = await response.json();
          setComments(newComments);
        }
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    }, 3000); // 3 seconds

    return () => clearInterval(interval);
  }, [inventoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session?.user) {
      alert("Please sign in to comment");
      return;
    }

    if (!content.trim()) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/inventories/${inventoryId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error("Failed to post comment");
      }

      const newComment = await response.json();
      setComments((prev) => [...prev, newComment]);
      setContent("");
      setShowPreview(false);
      router.refresh();
    } catch (error) {
      console.error("Error posting comment:", error);
      alert("Failed to post comment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Comments List */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <h3 className="text-lg font-semibold">Discussion ({comments.length})</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Comments update automatically every 3 seconds
          </p>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No comments yet. Start the discussion!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="p-6">
                <div className="flex items-start gap-4">
                  {comment.user?.image ? (
                    <img
                      src={comment.user.image}
                      alt={comment.user.name || "User"}
                      className="w-10 h-10 rounded-full flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <Link
                        href={`/users/${comment.user.id}`}
                        className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {comment.user.name || comment.user.email}
                      </Link>
                      <span className="text-sm text-gray-500">
                        {isoToDateTime(comment.createdAt)}
                      </span>
                    </div>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {comment.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Add Comment Form */}
      {session?.user ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <Label>Add a comment</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowPreview(!showPreview)}
                >
                  {showPreview ? "Edit" : "Preview"}
                </Button>
              </div>

              {showPreview ? (
                <div className="min-h-[100px] p-3 border border-gray-300 dark:border-gray-700 rounded-md prose prose-sm dark:prose-invert max-w-none">
                  {content ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
                  ) : (
                    <p className="text-gray-400">Nothing to preview</p>
                  )}
                </div>
              ) : (
                <TextareaAutosize
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your comment... (Markdown supported)"
                  className="w-full min-h-[100px] p-3 border border-gray-300 dark:border-gray-700 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                  minRows={4}
                />
              )}
              <p className="text-xs text-gray-500 mt-2">
                💡 Tip: You can use **bold**, *italic*, `code`, and more with Markdown
              </p>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={loading || !content.trim()}>
                {loading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Post Comment
              </Button>
            </div>
          </form>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">Sign in to join the discussion</p>
          <Link href="/auth/signin">
            <Button>Sign In</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
