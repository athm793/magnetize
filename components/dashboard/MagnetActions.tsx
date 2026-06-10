"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { MoreHorizontal, Trash2 } from "lucide-react";

export default function MagnetActions({ magnetId, magnetTitle }: { magnetId: string; magnetTitle: string }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    const res = await fetch(`/api/magnets/${magnetId}`, { method: "DELETE" });
    if (res.ok) {
      toast.success("Magnet deleted");
      router.refresh();
    } else {
      toast.error("Failed to delete");
    }
    setDeleting(false);
    setDeleteOpen(false);
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          className="inline-flex h-11 w-11 items-center justify-center rounded-md hover:bg-accent transition-colors"
          aria-label={`More actions for "${magnetTitle}"`}
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDeleteOpen(true)} className="text-red-600">
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete &ldquo;{magnetTitle}&rdquo;?</DialogTitle>
            <DialogDescription>This permanently deletes the lead magnet and all its leads. This cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting…" : "Delete forever"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
