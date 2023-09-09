import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Head from "next/head";
import { ChangeEvent, useEffect, useId, useRef, useState } from "react";
// comment
export default function Home() {
  const statusId = useId();
  // const chunkSizeId = useId();
  // const chunkOverlapId = useId();
  const queryId = useId();
  // const sourceId = useId();
  // const topKId = useId();
  // const [text, setText] = useState(essay);
  const [query, setQuery] = useState("");

  const [needsNewIndex, setNeedsNewIndex] = useState(true);
  const [buildingIndex, setBuildingIndex] = useState(false); // To enable Submit after uploading pdf
  const [runningQuery, setRunningQuery] = useState(false);
  const [nodesWithEmbedding, setNodesWithEmbedding] = useState([]);

  const [status, setStatus] = useState("");
  const [selectedPdf, setSelectedPdf] = useState<File | null>(null);

  // State to store chat history
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);

  // Ref to scroll to the bottom of the chat history
  const chatHistoryRef = useRef<HTMLDivElement | null>(null);

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file && file.type === "application/pdf") {
      setStatus("Uploading and processing PDF...");
      setSelectedPdf(file);
      setStatus("Building index...");
      setBuildingIndex(true);
      setNeedsNewIndex(false);
      // Upload the PDF here and update the state accordingly
      try {
        const formData = new FormData();
        formData.append("document", file, file.name);

        const result = await fetch("/api/splitandembed", {
          method: "POST",
          // headers: {
          //   "Content-Type": "application/octet-stream",
          // },
          body: formData,
        });

        const { error, payload } = await result.json();

        if (error) {
          console.error("Error:", error);
          setStatus(error);
        }

        if (payload) {
          setNodesWithEmbedding(payload.nodesWithEmbedding);
          setBuildingIndex(true);
          setStatus("Index built!");
        }
        setBuildingIndex(false);
      } catch (error) {
        console.error("Error uploading PDF:", error);
        setStatus("Error uploading PDF.");
      }
    } else {
      setStatus("Please select a valid PDF file.");
    }
  };

  //PDF -> backend API split and embed
  // use pdf reader from llama index

  const handleQuerySubmit = async () => {
    if (query.trim() === "") {
      return;
    }

    try {
      // Add the query to chat history
      setChatHistory([...chatHistory, { type: "user", text: query }]);
      setStatus("Running query...");
      setRunningQuery(true);

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
        setStatus(error);
      }

      if (payload) {
        // Add server response to chat history
        setChatHistory([
          ...chatHistory,
          { type: "user", text: query }, // Can later take the username
          { type: "server", text: payload.response },
        ]);
      }

      setRunningQuery(false);
      // Clear input field
      setQuery("");
      setStatus("Query Successful!");
    } catch (error) {
      console.error("Error:", error);
      setStatus("An error occurred while processing the query.");
      setRunningQuery(false);
    }
  };

  interface ChatMessage {
    type: "user" | "server"; // To specify the valid message types
    text: string;
  }

  const ChatMessage = ({ type, text }) => {
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
        <title>Chat-with-PDF-LlamaIndex</title>
      </Head>
      <main className="mx-2 flex lg:mx-56">
        {/* PDF UPLOAD BUTTON */}
        <div className="w-1/2 pr-4">
          <div className="my-4">
            <Label className="mb-3 block">Upload PDF:</Label>
            <div className="flex items-center">
              <label className="cursor-pointer rounded-md bg-blue-500 px-4 py-2 text-white shadow-md hover:bg-blue-600">
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={buildingIndex || runningQuery}
                />
              </label>
              <span className="ml-2" id="selected-filename">
                {selectedPdf ? selectedPdf.name : "No file chosen"}
              </span>
            </div>
          </div>

          {/* Status */}
          <div className="my-2">
            <Label htmlFor={statusId}>Status:</Label>
            <Textarea
              className="m-0 w-full p-1"
              readOnly
              value={status}
              id={statusId}
            />
          </div>

          <hr className="my-4 border-t border-gray-300" />

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
              <Button
                type="submit"
                onClick={handleQuerySubmit}
                disabled={
                  !query ||
                  selectedPdf == null ||
                  buildingIndex ||
                  needsNewIndex ||
                  runningQuery
                }
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        <div className="w-1/2 border-l border-gray-300 pl-4">
          <div>
            {selectedPdf ? (
              <iframe
                src={URL.createObjectURL(selectedPdf)}
                title="PDF Preview"
                className="h-screen w-full"
              />
            ) : (
              <p>No PDF selected</p>
            )}
          </div>
        </div>
      </main>
    </>
  );
}
