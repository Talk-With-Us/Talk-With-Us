// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";

import {
  ContextChatEngine,
  IndexDict,
  OpenAI,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

let ChatEngine: any;
let currentContext: string | undefined;

type Input = {
  query: string;

  nodesWithEmbedding: {
    text: string;
    embedding: number[];
  }[];
  
  context: string;
};

type Output = {
  error?: string;
  payload?: {
    response: string;
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Output>,
) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { query, nodesWithEmbedding, context }: Input = req.body;

  const embeddingResults = nodesWithEmbedding.map((config) => {
    return {
      node: new TextNode({ text: config.text }),
      embedding: config.embedding,
    };
  });
  console.log("hello:",embeddingResults );

  const indexDict = new IndexDict();
  for (const { node } of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContextFromDefaults({
      llm: new OpenAI(),
    }),
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(
      embeddingResults.map((result) => result.node),
      true,
    );
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;

  const retriever = index.asRetriever();
  retriever.similarityTopK = 2;

  if (ChatEngine === undefined || currentContext !== context) {
    ChatEngine = new ContextChatEngine({ retriever });
    currentContext = context;
  }

  const response = await ChatEngine.chat(query);

  res.status(200).json({
    payload: { response: response.toString() },
  });

  console.log(response.toString());
}


