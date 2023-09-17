import {
  Document,
  MetadataMode,
  PDFReader,
  SentenceSplitter,
  VectorStoreIndex,
  getNodesFromDocument,
  serviceContextFromDefaults,
} from "llamaindex";
import type { NextApiRequest, NextApiResponse } from "next";
import path from "path";

type Output = {
  error?: string;
  payload?: {
    nodesWithEmbedding: {
      text: string;
      embedding: number[];
    }[];
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async (req: NextApiRequest, res: NextApiResponse<Output>) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  console.log("hello");

  const { name } = req.query;
  console.log("🚀 ~ file: splitandembed.ts:38 ~ name:", name)

  

  let constantFilePath = "";

  if (name === "samay") {
    constantFilePath = path.join(process.cwd(), "public", "samay.pdf");
  } else if (name === "pavan") {
    constantFilePath = path.join(process.cwd(), "public", "pavan.pdf");
  } else {
    res.status(400).json({ error: "Invalid name parameter" });
    return;
  }

  console.log(
    "🚀 ~ file: splitandembed.ts:38 ~ constantFilePath:",
    constantFilePath,
  );

  const pdfReader = new PDFReader();

  try {
    const pdfDocuments = await pdfReader.loadData(constantFilePath);

    const textFromPDF = pdfDocuments[0].text;
    console.log("🚀 ~ file: splitandembed.ts:55 ~ textFromPDF:", textFromPDF);

    // convert PDF to Text using LlamaIndex Modules : https://github.com/run-llama/LlamaIndexTS/blob/main/packages/core/src/readers/PDFReader.ts

    const nodes = getNodesFromDocument(
      new Document({ text: textFromPDF }),
      new SentenceSplitter(1500, 300),
    );

    const nodesWithEmbeddings = await VectorStoreIndex.getNodeEmbeddingResults(
      nodes,
      serviceContextFromDefaults(),
      true,
    );

    res.status(200).json({
      payload: {
        nodesWithEmbedding: nodesWithEmbeddings.map((nodeWithEmbedding) => ({
          text: nodeWithEmbedding.node.getContent(MetadataMode.NONE),
          embedding: nodeWithEmbedding.embedding,
        })),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "504 Gateway Timeout") {
      res.status(504).json({ error: "Gateway Timeout" });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
};
