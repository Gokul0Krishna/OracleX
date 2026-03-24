import Anthropic from "@anthropic-ai/sdk";
import { ethers } from "ethers";
import cron from "node-cron";
import dotenv from "dotenv";
dotenv.config();

const MARKET_ABI = [
  "function marketCount() view returns (uint256)",
  "function getMarket(uint256) view returns (tuple(uint256 id, string question, string category, uint256 deadline, address creator, uint8 status, bool outcome, string aiEvidence, uint256 yesPool, uint256 noPool, uint256 createdAt, uint256 minStake))",
  "function aiResolve(uint256, bool, string, uint256) external"
];

const client   = new Anthropic();
const provider = new ethers.JsonRpcProvider(process.env.SHARDEUM_RPC);
const wallet   = new ethers.Wallet(process.env.RESOLVER_PRIVATE_KEY, provider);
const market   = new ethers.Contract(process.env.MARKET_ADDRESS, MARKET_ABI, wallet);

async function resolveMarket(id, question, category) {
  console.log(`\n[${new Date().toISOString()}] Resolving market ${id}: "${question}"`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    system: `You are an impartial prediction market resolver. Your job is to determine the factual outcome of a prediction market question using web search. You must respond with ONLY a valid JSON object — no markdown, no preamble, no explanation outside the JSON. Format: {"outcome": true, "confidence": 85, "evidence": "One sentence stating what happened. One sentence citing your source."}. true = YES outcome occurred. false = NO / did not occur. confidence = 0-100 integer.`,
    messages: [{
      role: "user",
      content: `Resolve this prediction market question with current web evidence. Category: ${category}. Question: "${question}". Search for the most recent authoritative information and determine YES (true) or NO (false).`
    }]
  });

  const text = response.content
    .filter(b => b.type === "text")
    .map(b => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  const result = JSON.parse(clean);

  console.log(`  Outcome: ${result.outcome ? "YES" : "NO"} | Confidence: ${result.confidence}%`);
  console.log(`  Evidence: ${result.evidence}`);

  const evidenceOnChain = `[AI ${result.confidence}% confident] ${result.evidence}`;
  const tx = await market.aiResolve(id, result.outcome, evidenceOnChain, result.confidence);
  await tx.wait();
  console.log(`  Resolved on-chain: ${tx.hash}`);
  console.log(`  Explorer: https://explorer-sphinx.shardeum.org/tx/${tx.hash}`);
}

async function checkAndResolve() {
  try {
    const count = await market.marketCount();
    const now   = Math.floor(Date.now() / 1000);

    for (let i = 1; i <= Number(count); i++) {
      const m = await market.getMarket(i);
      // status 0 = Open
      if (Number(m.status) === 0 && Number(m.deadline) <= now) {
        await resolveMarket(i, m.question, m.category);
      }
    }
  } catch (err) {
    console.error("Resolver error:", err.message);
  }
}

// Check every 2 minutes
cron.schedule("*/2 * * * *", checkAndResolve);
console.log("OracleX AI resolver running — checking every 2 minutes...");
checkAndResolve(); // run once immediately on start
