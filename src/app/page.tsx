import { createClient } from "@/lib/supabase/server";
import { CategoryFilter } from "./CategoryFilter";
import { PostListInfinite } from "@/components/PostListInfinite";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categorySlug } = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("posts")
    .select("id, title, content, created_at, user_id, category_id")
    .order("created_at", { ascending: false })
    .limit(20);

  let categoryId: string | null = null;
  if (categorySlug?.trim()) {
    const { data: cat } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug.trim())
      .single();
    if (cat) {
      categoryId = cat.id;
      query = query.eq("category_id", cat.id);
    }
  }

  const { data: posts } = await query;

  const { data: categories } = await supabase
    .from("categories")
    .select("id, name, slug")
    .order("name");

  const categoryIds = [...new Set((posts ?? []).map((p) => p.category_id).filter(Boolean))] as string[];
  const categoryMap: Record<string, { name: string; slug: string }> = {};
  if (categoryIds.length > 0 && categories) {
    categories.forEach((c) => {
      categoryMap[c.id] = { name: c.name, slug: c.slug };
    });
  }

  const userIds = [...new Set((posts ?? []).map((p) => p.user_id))];
  const displayNames: Record<string, string> = {};
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", userIds);
    (profiles ?? []).forEach((p) => {
      displayNames[p.id] = p.display_name ?? "알 수 없음";
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">최신 글</h1>
        <CategoryFilter categories={categories ?? []} currentSlug={categorySlug ?? undefined} />
      </div>
      <PostListInfinite
        initialPosts={posts ?? []}
        initialDisplayNames={displayNames}
        initialCategoryMap={categoryMap}
        categorySlug={categorySlug ?? undefined}
        categoryId={categoryId}
      />
    </div>
  );
}
