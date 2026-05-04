"use client";

import { useState, useMemo, useCallback } from "react";
import { db } from "@/lib/db";
import { useMediaQuery } from "@/lib/hooks";
import { WordCard } from "@/components/WordCard";
import { AddWordDialog } from "@/components/AddWordDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { WordEntity, ListEntity } from "@/lib/types";

function WordsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-xl" />
      ))}
    </div>
  );
}

export default function WordsPage() {
  const { user } = db.useAuth();
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 767px)");

  const { data, isLoading } = db.useQuery(
    user
      ? {
          words: {
            $: { where: { "owner.id": user.id } },
          },
          lists: {
            $: { where: { "owner.id": user.id } },
            listWords: { word: {} },
          },
        }
      : null
  );

  const handleSearchChange = useCallback(
    (() => {
      let timer: ReturnType<typeof setTimeout>;
      return (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        clearTimeout(timer);
        timer = setTimeout(() => setSearch(val), 300);
      };
    })(),
    []
  );

  const filteredWords = useMemo(() => {
    const words = data?.words ?? [];
    const sorted = [...words].sort(
      (a, b) => (b.createdAt as number) - (a.createdAt as number)
    );
    if (!search.trim()) return sorted;
    const q = search.toLowerCase();
    return sorted.filter(
      (w) =>
        w.text.toLowerCase().includes(q) ||
        w.pinyin.toLowerCase().includes(q) ||
        w.koreanMeaning.toLowerCase().includes(q)
    );
  }, [data?.words, search]);

  const lists = useMemo(() => (data?.lists ?? []) as ListEntity[], [data?.lists]);

  return (
    <div className="container max-w-2xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Word Library</h1>
          <p className="text-muted-foreground text-sm">
            {data?.words?.length ?? 0} words total
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 hidden md:flex">
          <Plus className="h-4 w-4" />
          Add Word
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by Chinese, pinyin, or Korean..."
          onChange={handleSearchChange}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <WordsSkeleton />
      ) : filteredWords.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="font-chinese text-6xl opacity-20">学</div>
          <div>
            <p className="font-semibold text-lg">
              {search ? "No matching words" : "No words yet"}
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              {search
                ? "Try a different search term"
                : "Add your first word to get started"}
            </p>
          </div>
          {!search && (
            <Button onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Word
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredWords.map((word) => (
            <WordCard key={word.id} word={word as WordEntity} lists={lists} />
          ))}
        </div>
      )}

      {/* Mobile FAB */}
      <Button
        onClick={() => setAddOpen(true)}
        size="icon"
        className="md:hidden fixed bottom-20 right-4 h-14 w-14 rounded-full shadow-lg z-40"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {user && (
        <AddWordDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          userId={user.id}
          isMobile={isMobile}
        />
      )}
    </div>
  );
}
