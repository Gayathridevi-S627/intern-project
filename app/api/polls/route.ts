import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const { question, options } = await req.json();

    // Insert poll
    const { data: poll, error: pollError } = await supabase
      .from("polls")
      .insert({
        question,
      })
      .select()
      .single();

    if (pollError) {
      return Response.json(
        { error: pollError.message },
        { status: 500 }
      );
    }

    // Insert options
    const optionRows = options.map((option: string) => ({
      poll_id: poll.id,
      option_text: option,
    }));

    const { error: optionError } = await supabase
      .from("poll_options")
      .insert(optionRows);

    if (optionError) {
      return Response.json(
        { error: optionError.message },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      poll,
    });
  } catch {
    return Response.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}