import { supabase } from "@/lib/supabase";

/**
 * Get paginated questions with options
 */
export async function getQuestionsPage(offset: number, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      body,
      created_at,
      options (
        id,
        body,
        question_id
      )
    `)
    .range(offset, offset + limit);

  if (error) throw new Error(error.message);

  const rows = (data ?? []).map((q) => ({
    id: q.id,
    body: q.body,
    created_at: q.created_at,
    options: q.options ?? []
  }));

  const hasMore = rows.length > limit;

  return {
    questions: rows.slice(0, limit),
    hasMore
  };
}

/**
 * Search questions (SAFE VERSION)
 * - removed author (not in DB)
 * - removed votes aggregation (not in DB)
 */
export async function searchQuestions(q: string, limit: number) {
  const { data, error } = await supabase
    .from("questions")
    .select(`
      id,
      body,
      created_at
    `)
    .textSearch("body", q, {
      type: "websearch",
      config: "english"
    })
    .limit(limit);

  if (error) throw new Error(error.message);

  return (data ?? []).map((row) => ({
    id: row.id,
    body: row.body,
    created_at: row.created_at
  }));
}