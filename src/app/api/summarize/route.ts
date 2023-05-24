import { OpenAIChat } from "langchain/llms/openai";
import { loadSummarizationChain } from "langchain/chains";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(request: Request) {
  const res = await request.json();

  const llm = new OpenAIChat({
    temperature: 0,
    openAIApiKey: res.api,
    modelName: "gpt-3.5-turbo",
  });

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 2000,
    chunkOverlap: 100,
  });

  if (!res.text || !res.api) {
    return NextResponse.json({
      error: "Required fields have not been filled in.",
    });
  }

  try {
    const docs = await textSplitter.createDocuments([res.text]);
    const chain = loadSummarizationChain(llm);

    const summarizeResponse = await chain.call({
      input_documents: docs,
    });
    const summary = summarizeResponse.text;

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify({ error: "Server Error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
