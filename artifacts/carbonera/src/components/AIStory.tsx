import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { type StoryResponse, useGenerateStory } from "@workspace/api-client-react";
import { type FootprintResult } from "@/lib/emissions";

interface Props {
  result: FootprintResult & { city: string };
  onContinue: () => void;
}

function buildLocalStory(result: FootprintResult & { city: string }): string {
  const indiaAvg = 1900;
  const parisTarget = 2000;
  const diff = result.totalCO2 - indiaAvg;
  const aboveParis = result.totalCO2 > parisTarget;

  const categoryDescriptions: Record<string, string> = {
    diet: "food and diet choices",
    transport: "transportation and daily commuting",
    energy: "home energy consumption",
    shopping: "consumer purchases and shopping",
  };

  const topDesc = categoryDescriptions[result.topCategory.toLowerCase()] ?? result.topCategory;
  const kgSavings = Math.round(result.totalCO2 * 0.22);
  const treesNeeded = Math.round(result.totalCO2 / 21);
  const topScore = Math.round(
    Math.max(result.dietScore, result.transportScore, result.energyScore, result.shoppingScore),
  );

  return [
    `Every year, your choices in ${result.city} release ${Math.round(result.totalCO2).toLocaleString()} kg of CO2 into the atmosphere, ${diff > 0 ? `${Math.round(diff).toLocaleString()} kg above` : `${Math.round(Math.abs(diff)).toLocaleString()} kg below`} the Indian average. If everyone in ${result.city} lived exactly like you, the city's per-capita emissions would ${diff > 0 ? "exceed" : "fall below"} national baselines. By 2050, a city of 10 million living at your footprint would ${diff > 0 ? "add pressure to" : "ease pressure on"} local air quality, heat stress, and energy demand.`,

    `Your single biggest lever is ${topDesc}, which drives about ${topScore}% of your impact profile. Optimising this one category alone could save you roughly ${kgSavings.toLocaleString()} kg CO2 per year. That shift would bring you ${aboveParis ? "closer to" : "well within"} the Paris Agreement's 2000 kg per-person target.`,

    `Here is the part that matters: carbon adds up quietly through ordinary habits. A single shift, such as ${result.topCategory.toLowerCase() === "diet" ? "replacing two high-emission meals per week with plant-based ones" : result.topCategory.toLowerCase() === "transport" ? "switching one car trip per day to public transit" : result.topCategory.toLowerCase() === "energy" ? "reducing wasteful electricity use and choosing cleaner power" : "buying fewer, longer-lasting items"}, would require planting ${Math.round(kgSavings / 21)} fewer trees to offset. You would need ${treesNeeded.toLocaleString()} trees just to absorb your current annual output.`,
  ].join("\n\n");
}

function TypewriterText({ text, onDone }: { text: string; onDone?: () => void }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const id = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) {
        clearInterval(id);
        onDone?.();
      }
    }, 12);
    return () => clearInterval(id);
  }, [text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && (
        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ background: "#22c55e", verticalAlign: "middle" }} />
      )}
    </span>
  );
}

export default function AIStory({ result, onContinue }: Props) {
  const [story, setStory] = useState<string | null>(null);
  const [paragraphs, setParagraphs] = useState<string[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  const generateStory = useGenerateStory();

  const showStory = (text: string) => {
    setStory(text);
    const parts = text.split("\n\n").filter(Boolean);
    setParagraphs(parts);
    setVisibleCount(1);
  };

  const handleGenerate = () => {
    generateStory.mutate({
      data: {
        city: result.city,
        totalCO2: result.totalCO2,
        dietScore: result.dietScore,
        transportScore: result.transportScore,
        energyScore: result.energyScore,
        topCategory: result.topCategory,
      }
    }, {
      onSuccess: (data: StoryResponse) => {
        showStory(data.story);
      },
      onError: () => {
        showStory(buildLocalStory(result));
      },
    });
  };

  return (
    <section
      className="min-h-screen flex flex-col items-center justify-center py-24 px-6"
      style={{ background: "linear-gradient(180deg, #07100f 0%, #0a1a14 100%)" }}
    >
      <div className="max-w-2xl w-full">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-400/60 mb-4 font-medium">
            Your climate story
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
            What does your footprint<br />
            <span className="text-emerald-400">mean for {result.city}?</span>
          </h2>
          <p className="text-white/40 text-sm max-w-sm mx-auto">
            A personalized 3-paragraph climate analysis based on your lifestyle data.
          </p>
        </div>

        {!story && !generateStory.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div
              className="mb-8 p-6 rounded-2xl border mx-auto max-w-sm"
              style={{ background: "rgba(34,197,94,0.05)", borderColor: "rgba(34,197,94,0.15)" }}
            >
              <div className="text-4xl font-black text-emerald-400 mb-1">{Math.round(result.totalCO2).toLocaleString()}</div>
              <div className="text-white/50 text-sm">kg CO₂ · {result.city}</div>
              <div className="text-white/30 text-xs mt-2">Top impact: {result.topCategory}</div>
            </div>
            <button
              data-testid="button-generate-story"
              onClick={handleGenerate}
              className="px-8 py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5"
              style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
            >
              Generate my story
            </button>
          </motion.div>
        )}

        {generateStory.isPending && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              {[0, 1, 2].map(i => (
                <motion.div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{ background: "#22c55e" }}
                  animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                />
              ))}
            </div>
            <p className="text-white/40 text-sm">Analysing your carbon profile...</p>
          </motion.div>
        )}

        {story && paragraphs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
          >
            {paragraphs.map((para, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={i < visibleCount ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div className="text-white/80 leading-relaxed text-base">
                  {i < visibleCount - 1 ? (
                    para
                  ) : i === visibleCount - 1 ? (
                    <TypewriterText
                      text={para}
                      onDone={() => {
                        if (visibleCount < paragraphs.length) {
                          setTimeout(() => setVisibleCount(c => c + 1), 300);
                        }
                      }}
                    />
                  ) : null}
                </div>
              </motion.div>
            ))}

            {visibleCount >= paragraphs.length && (
              <motion.button
                data-testid="button-continue-to-pledge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={onContinue}
                className="w-full py-4 rounded-xl font-bold text-base transition-all hover:-translate-y-0.5 mt-4"
                style={{ background: "linear-gradient(135deg, #22c55e, #10b981)", color: "#07100f" }}
              >
                Make my pledge
              </motion.button>
            )}
          </motion.div>
        )}

        {generateStory.isError && !story && (
          <div className="text-center py-8">
            <p className="text-red-400 text-sm mb-4">Could not generate story. Please try again.</p>
            <button onClick={handleGenerate} className="text-emerald-400 text-sm underline">Retry</button>
          </div>
        )}
      </div>
    </section>
  );
}
