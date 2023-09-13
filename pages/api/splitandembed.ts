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
import path from 'path';

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

  const pdfReader = new PDFReader(); 
  const constantFilePath = path.join(process.cwd(), 'public', 'sample.pdf'); // Upload pdf to uploads folder and specify the path

  const pdfDocuments = await pdfReader.loadData(constantFilePath);

  const textFromPDF = pdfDocuments[0].text;

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
};
