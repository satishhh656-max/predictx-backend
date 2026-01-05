import express from "express";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 SUPABASE CONNECT
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// 🔹 HEALTH CHECK
app.get("/", (req, res) => {
  res.json({ status: "Backend running" });
});

// 🔹 CONFIG MANAGER (FIX 404)
app.get("/api/extension/getAllSettings", async (req, res) => {
  const { data } = await supabase.from("settings").select("*");
  const settings = {};
  (data || []).forEach(r => (settings[r.key] = r.value));
  res.json(settings);
});

// 🔹 FEATURE FLAG
app.get("/api/extension/feature-flag/:key", async (req, res) => {
  const { key } = req.params;
  const { data } = await supabase
    .from("feature_flags")
    .select("is_enabled")
    .eq("key", key)
    .single();

  res.json({ is_enabled: !!data?.is_enabled });
});

// 🔹 BRAND CONFIGS
app.get("/api/supabase/getApiBrandConfigs", async (req, res) => {
  const { data } = await supabase.from("brand_configs").select("*");
  res.json(data || []);
});

// 🔹 USER VERIFICATION
app.get("/api/supabase/isUserVerified/:userId", async (req, res) => {
  const { userId } = req.params;
  const { data } = await supabase
    .from("users")
    .select("is_verified")
    .eq("user_id", userId)
    .single();

  res.json({ isVerified: !!data?.is_verified });
});

// 🔹 UPDATE BALANCE
app.post("/api/supabase/updateUserBalance", async (req, res) => {
  const { userId, balance } = req.body;
  await supabase.from("user_balances").upsert({
    user_id: userId,
    balance,
    last_updated: new Date()
  });
  res.json({ success: true });
});

// 🔹 SAVE MEMBER
app.post("/api/saveMember", async (req, res) => {
  const { userId, phone, brandName } = req.body;
  await supabase.from("users").upsert({
    user_id: userId,
    phone,
    brand_name: brandName,
    is_verified: true
  });
  res.json({ success: true });
});

// 🔹 START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("Server running on port", PORT);
});
