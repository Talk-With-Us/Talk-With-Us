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
      <div
        className={`chat-message ${bgColorClass} ${borderColorClass} my-2 rounded-md p-2`}
      >
        <Label>{type === "user" ? "Query" : "Answer"}:</Label>
        <div className={`message-text`}>{text}</div>
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
        <title>Chat-with-Me-LlamaIndex</title>
      </Head>
      <main className="mx-2 flex h-full flex-col lg:mx-56">
        {/* PDF UPLOAD BUTTON */}

        {/* <div className="my-4 flex items-center">
          <Button onClick={handleFileUpload}></Button>
        </div> */}

        {/* Chat History */}
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
              id={queryId}
              value={query}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setQuery(e.target.value);
              }}
            />
            <Button type="submit" onClick={handleQuerySubmit} disabled={!query}>
              Submit
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
