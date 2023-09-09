import { IncomingForm } from "formidable";
import fs from "fs";
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
  const form = new IncomingForm({
    uploadDir: path.join(process.cwd(), "uploads"),
    keepExtensions: true,
  });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("Error parsing form", err);
      return res.status(500).json({ error: "Error parsing form" });
    }
  
    if (!files || !files.document) {
      console.error("pdfFile is undefined");
      return res.status(400).json({ error: "PDF file is missing" });
    }
    
    const pdfFile = files.document[0];
    const filename: string = pdfFile.originalFilename as string;
    const filePath = path.join(form.uploadDir, filename);

    fs.renameSync(pdfFile.filepath, filePath);

    const pdfReader = new PDFReader();

    const pdfDocuments = await pdfReader.loadData(filePath);

    const textFromPDF = pdfDocuments[0].text;
    console.log(
      "🚀 ~ file: splitandembed.ts:56 ~ form.parse ~ textFromPDF:",
      textFromPDF,
    );

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
  });
};
