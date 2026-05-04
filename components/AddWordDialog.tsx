"use client";

import { useState } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AddWordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  isMobile: boolean;
}

interface WordForm {
  text: string;
  pinyin: string;
  koreanMeaning: string;
  notes: string;
}

const emptyForm: WordForm = { text: "", pinyin: "", koreanMeaning: "", notes: "" };

function WordForm({
  onSubmit,
  loading,
}: {
  onSubmit: (form: WordForm) => Promise<void>;
  loading: boolean;
}) {
  const [form, setForm] = useState<WordForm>(emptyForm);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.text.trim() || !form.pinyin.trim() || !form.koreanMeaning.trim()) return;
    await onSubmit(form);
    setForm(emptyForm);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 px-1">
      <div className="space-y-2">
        <Label htmlFor="text">Chinese Character / Word *</Label>
        <Input
          id="text"
          placeholder="e.g. 学习"
          value={form.text}
          onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))}
          required
          className="font-chinese text-lg"
          autoFocus
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="pinyin">Pinyin *</Label>
        <Input
          id="pinyin"
          placeholder="e.g. xué xí"
          value={form.pinyin}
          onChange={(e) => setForm((f) => ({ ...f, pinyin: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="koreanMeaning">Korean Meaning *</Label>
        <Input
          id="koreanMeaning"
          placeholder="e.g. 공부하다"
          value={form.koreanMeaning}
          onChange={(e) => setForm((f) => ({ ...f, koreanMeaning: e.target.value }))}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes (optional)</Label>
        <Input
          id="notes"
          placeholder="Additional notes..."
          value={form.notes}
          onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
        />
      </div>
      <Button type="submit" className="w-full gap-2" disabled={loading}>
        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        Add Word
      </Button>
    </form>
  );
}

export function AddWordDialog({ open, onOpenChange, userId, isMobile }: AddWordDialogProps) {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form: WordForm) => {
    setLoading(true);
    try {
      const wordId = id();
      await db.transact([
        db.tx.words[wordId].update({
          text: form.text.trim(),
          pinyin: form.pinyin.trim(),
          koreanMeaning: form.koreanMeaning.trim(),
          notes: form.notes.trim() || "",
          createdAt: Date.now(),
        }),
        db.tx.words[wordId].link({ owner: userId }),
      ]);
      toast.success(`Added "${form.text}"`);
      onOpenChange(false);
    } catch {
      toast.error("Failed to add word");
    } finally {
      setLoading(false);
    }
  };

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[90vh] overflow-y-auto">
          <SheetHeader className="mb-4">
            <SheetTitle>Add New Word</SheetTitle>
          </SheetHeader>
          <WordForm onSubmit={handleSubmit} loading={loading} />
          <SheetFooter className="mt-4" />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Word</DialogTitle>
        </DialogHeader>
        <WordForm onSubmit={handleSubmit} loading={loading} />
        <DialogFooter />
      </DialogContent>
    </Dialog>
  );
}
