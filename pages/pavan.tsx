import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Head from "next/head";
import React, { ChangeEvent, useEffect, useId, useRef, useState } from "react";

export default function Home() {
  const queryId = useId();
  const [query, setQuery] = useState("");

  const [runningQuery, setRunningQuery] = useState(false);
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);

  // State to store chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Ref to scroll to the bottom of the chat history
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  const handleFileUpload = async () => {
    // Upload the PDF here and update the state accordingly

    const result = await fetch("/api/splitandembed?name=pavan", {
      method: "POST",
    });

    const { error, payload } = await result.json();

    if (error) {
      console.error("Error:", error);
    }

    if (payload) {
      setNodesWithEmbedding(payload.nodesWithEmbedding);
    }
  };

  useEffect(() => {
    const defaultEntry: ChatMessage = {
      type: "server", // You can set the type as "server" or "user" as needed
      text: `Welcome to Pavan Nallagoni's Resume Chat Zone! 🚀 Explore Pavan's background, achievements, and career journey. Ask about education 🎓, highlights ⚡️, skills 👨🏻‍💻, or projects 💻. 
Got questions? Just drop them here 🔥📚🏆

🔍 Need a starting point? How about these:

☞  Tell me about Pavan's educational journey.
☞  Share some standout moments from Pavan's career.
☞  What skills and expertise does Pavan bring to the table?
☞  What's keeping Pavan busy in his current role or project?

Feel free to ask away, and let's dive into the captivating story of Pavan Nallagoni! 😄📚🏆
      `,
    };
    setChatHistory([defaultEntry]);
    handleFileUpload();
  }, []);

  const handleQuerySubmit = async () => {
    if (query.trim() === "") {
      return;
    }

    try {
      // Add the query to chat history
      setRunningQuery(true);
      setChatHistory([...chatHistory, { type: "user", text: query }]);

      // Post the query to the server
      const result = await fetch("/api/retrieveandquery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query,
          nodesWithEmbedding,
          context: "pavan",
        }),
      });

      if (!result.ok) {
        throw new Error(`HTTP error! Status: ${result.status}`);
      }

      const { error, payload } = await result.json();

      if (error) {
        console.log(error);
      }

      if (payload) {
        setRunningQuery(false);
        // Add server response to chat history
        setChatHistory([
          ...chatHistory,

          { type: "user", text: query }, // Can later take the username
          { type: "server", text: payload.response },
        ]);

        if (chatHistoryRef.current) {
          chatHistoryRef.current.scrollTop = 0;
        }

        console.log("chat history", chatHistory);
      }

      // Clear input field
      setQuery("");
    } catch (error) {
      setRunningQuery(false);
      console.error("Error:", error);
    }
  };

  interface ChatMessage {
    type: "user" | "server"; // To specify the valid message types
    text: string;
  }

  const ChatMessage = React.memo(
    ({ type, text }: { type: string; text: string }) => {
      const bgColorClass =
        type === "user" ? "bg-transparent" : "bg-transparent";

      return (
        <div
          className={`chat-message ${bgColorClass} my-2 flex items-center rounded-md p-2`}
        >
          {type === "user" ? (
            <Label className="h-12 w-12 p-4 md:w-10">You:</Label>
          ) : (
            <img
              className="h-8 w-8 rounded-full p-0 ring-2 ring-cyan-500 dark:ring-gray-600 md:h-10 md:w-10"
              src="/one.png"
              alt="Bordered avatar"
            />
          )}
          <div
            className={`message-text chatdiv ml-2 flex w-full space-x-2`}
            style={{
              whiteSpace: "pre-wrap",
              padding: "0 20px 0 20px",
            }}
          >
            {text}
          </div>
        </div>
      );
    },
  );

  // To scroll to the bottom of the chat history when updated
  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistory]);

  return (
    <>
      <Navbar />
      <Head>
        <title>Talk-with-us</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        <div className="overflow-hidden rounded-lg border border-gray-300 bg-white p-4">
          {/* Chat History */}
          <div className="chat-window">
            <div
              className="chat-history"
              ref={chatHistoryRef}
              style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}
            >
              {/* placeholder div to push the content down initially */}
              <div style={{ height: "100px" }}></div>
              {chatHistory.map((item, index) => (
                <ChatMessage key={index} type={item.type} text={item.text} />
              ))}
            </div>

            {/* Query Input */}
            <div className="my-2 space-y-2">
              {/* <Label htmlFor="queryId">Questions?</Label> */}
              <div className="flex w-full space-x-2">
                <Input
                  className="no-zoom w-full rounded-md p-2 focus:border-cyan-500 focus:ring"
                  placeholder="Write your questions!"
                  id={queryId}
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    setQuery(e.target.value);
                  }}
                  onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                    if (e.key === "Enter") {
                      e.preventDefault(); // Prevent the default behavior of the Enter key (e.g., form submission)
                      handleQuerySubmit(); // Call your query submission function
                    }
                  }}
                />
                <Button
                  className={`border-gray-90 cursor-pointer rounded-lg border-2 border-solid border-sky-500 bg-cyan-500 px-4 py-2 text-white shadow-lg shadow-cyan-500/50 ${
                    runningQuery ? "animate-glitter" : ""
                  }`}
                  type="submit"
                  onClick={handleQuerySubmit}
                  disabled={!query}
                >
                  <span className="font-bold">
                    {runningQuery ? "Sending..." : "Send"}
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    className="ml-2 h-6 w-6 rotate-90 transform"
                  >
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
