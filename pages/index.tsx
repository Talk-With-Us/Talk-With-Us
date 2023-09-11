import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Head from "next/head";
import { ChangeEvent, useEffect, useId, useRef, useState } from "react";

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

    const result = await fetch("/api/splitandembed", {
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
      }
      // useEffect(() => {
      //   console.log("inside use effect");
      //   handleQuerySubmit();
      // }, []);

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

  const ChatMessage = ({ type, text }: { type: string; text: string }) => {
    const bgColorClass = type === "user" ? "bg-transparent" : "bg-transparent";
    const borderColorClass = "border primary";

    return (
      <div className={`chat-message ${bgColorClass} my-2 rounded-md p-2 flex items-center`}>
        {type === "user" ? (
          <Label className="w-10 h-10 p-2">You:</Label> 
        ) : (
          <img className="w-10 h-10 p-2 rounded-full ring-2 ring-cyan-500 dark:ring-gray-600" src="/one.png" alt="Bordered avatar" />
        )}
         <div className={`message-text ml-2 rounded-md p-2 flex w-full space-x-2 ${borderColorClass}`}>{text}</div>
      </div>
    );    
  };
  
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
        <title>Chat-with-Me</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        {/* Chat History */}
        <div className="chat-window">
          <div
            className="chat-history"
            ref={chatHistoryRef}
            style={{ maxHeight: "calc(100vh - 150px)", overflowY: "auto" }}
          >
            {chatHistory.map((item, index) => (
              <ChatMessage key={index} type={item.type} text={item.text} />
            ))}
          </div>

          {/* Query Input */}
          <div className="my-2 space-y-2">
            <Label htmlFor="queryId">Query:</Label>
            <div className="flex w-full space-x-2">
              <Input
                className="p-2 w-full rounded-md focus:ring focus:border-cyan-500"
                id={queryId}
                value={query}
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  setQuery(e.target.value);
                }}
              />
              <Button
                className={`border-solid border-2 border-sky-500 bg-cyan-500 shadow-lg shadow-cyan-500/50 text-white py-2 px-4 rounded-lg border-gray-90 cursor-pointer ${
                  runningQuery ? 'animate-glitter' : ''
                }`}
                type="submit"
                onClick={handleQuerySubmit}
                disabled={!query}
              >
                {runningQuery ? 'Submitting...' : 'Submit'}
              </Button>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}