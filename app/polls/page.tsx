"use client";

import { useEffect, useState } from "react";

export default function PollsPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [polls, setPolls] = useState<any[]>([]);
  const [feedback, setFeedback] = useState("");

  async function loadPolls() {
  const res = await fetch("/api/polls/list");
  const data = await res.json();
  setPolls(data);
}

async function vote(pollId: string, optionId: string) {
  const voterId =
    localStorage.getItem("poll_voter") || crypto.randomUUID();

  localStorage.setItem("poll_voter", voterId);

  const res = await fetch(`/api/polls/${pollId}/vote`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      optionId,
      voterId,
    }),
  });

  if (res.ok) {
    alert("Vote submitted!");
  } else {
    const data = await res.json();
    alert(data.error || "Failed to vote");
  }
}

useEffect(() => {
  loadPolls();
}, []);

async function submitFeedback() {
  if (!feedback.trim()) {
    alert("Please enter feedback.");
    return;
  }

  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: feedback,
    }),
  });

  if (res.ok) {
    alert("Feedback submitted successfully!");
    setFeedback("");
  } else {
    const data = await res.json();
    alert(data.error || "Failed to submit feedback");
  }
}

  async function createPoll() {
    const filteredOptions = options.filter((o) => o.trim() !== "");

    const res = await fetch("/api/polls", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        options: filteredOptions,
      }),
    });

    if (res.ok) {
  alert("Poll created successfully!");
  setQuestion("");
  setOptions(["", ""]);
  loadPolls();
}else {
      alert("Failed to create poll");
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Create Poll</h1>

      <input
        className="border p-2 w-full"
        placeholder="Poll question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      {options.map((option, index) => (
        <input
          key={index}
          className="border p-2 w-full"
          placeholder={`Option ${index + 1}`}
          value={option}
          onChange={(e) => {
            const updated = [...options];
            updated[index] = e.target.value;
            setOptions(updated);
          }}
        />
      ))}

      <button
        onClick={() => setOptions([...options, ""])}
        className="border px-4 py-2"
      >
        + Add Option
      </button>

      <button
        onClick={createPoll}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Create Poll
      </button>
      <hr className="my-8" />

<h2 className="text-2xl font-bold">Available Polls</h2>

{polls.length === 0 ? (
  <p>No polls available.</p>
) : (
  polls.map((poll) => (
    <div
      key={poll.id}
      className="border rounded-lg p-4 mt-4"
    >
      <h3 className="font-semibold text-lg">
        {poll.question}
      </h3>

      <div className="mt-3 space-y-2">
        {poll.poll_options.map((option: any) => (
          <button
            key={option.id}
            onClick={() => vote(poll.id, option.id)}
            className="block w-full text-left border rounded p-2 hover:bg-gray-100"
          >
            {option.option_text}
          </button>
        ))}
      </div>
    </div>
  ))
)}

<hr className="my-8" />

<h2 className="text-2xl font-bold">Feedback</h2>

<textarea
  className="border p-2 w-full rounded"
  rows={4}
  placeholder="Share your feedback..."
  value={feedback}
  onChange={(e) => setFeedback(e.target.value)}
/>

<button
  onClick={submitFeedback}
  className="bg-green-600 text-white px-4 py-2 rounded mt-2"
>
  Submit Feedback
</button>

    </div>
  );
}
