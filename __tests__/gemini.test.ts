import { analyzeText, analyzeUrl } from "../lib/gemini";

describe("Gemini Service Fallback Analyzer", () => {
  test("should identify banking block messages as Dangerous", async () => {
    const res = await analyzeText("URGENT: Your Bank Account password is suspended! Reset here: http://danger.xyz");
    expect(res.riskLevel).toBe("Dangerous");
    expect(res.category).toContain("Bank");
    expect(res.redFlags.length).toBeGreaterThan(0);
  });

  test("should identify lottery winning text as Suspicious", async () => {
    const res = await analyzeText("Congratulations! You won $10,000 lottery! Click here: http://win.xyz");
    expect(res.riskLevel).toBe("Suspicious");
    expect(res.category).toContain("Phishing");
  });

  test("should evaluate clean communications as Safe", async () => {
    const res = await analyzeText("Hey dad, I will be late for dinner tonight. See you at 8!");
    expect(res.riskLevel).toBe("Safe");
    expect(res.redFlags.length).toBe(0);
    expect(res.safeReply).toBeDefined();
  });

  test("should evaluate suspicious URLs as Suspicious", async () => {
    const res = await analyzeUrl("http://parcel-ups-tracking.info/login");
    expect(res.riskLevel).toBe("Suspicious");
  });
});
