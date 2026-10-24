// ===== SESSION 11: a NEW file =======================================
// ===== no Session 10 version -- nothing to compare it to ============
import "dotenv/config";
import { reviewProject } from "./ai/gemini";

// npm run try-ai. One real request to Gemini from your terminal --
// the same function POST /api/ai calls, with no Express, no token
// and no database. Run it once the key is in .env: if this prints a
// review, the key, the model name and the schema all work.
async function tryAi() {
  const review = await reviewProject(
    "A Campus Lost & Found web application in React and TypeScript with Express and MongoDB, deployed on Vercel " +
      "at https://itelect4-project-green.vercel.app and https://itelect4-backend-amber.vercel.app. Students log in with JWT, " +
      "report lost or found items with categories, locations, and descriptions, and submit claims. Administrators review and " +
      "approve or reject ownership claims through an admin dashboard with real-time statistics.",
  );
  console.log(JSON.stringify(review, null, 2));
}

tryAi().catch((err: unknown) => {
  console.error("Gemini call failed:", err);
  process.exit(1);
});
