import { useState, useRef } from "react";
import Hero from "@/components/Hero";
import HistoryScroll from "@/components/HistoryScroll";
import LiveStats from "@/components/LiveStats";
import Quiz from "@/components/Quiz";
import FootprintResult from "@/components/FootprintResult";
import AIStory from "@/components/AIStory";
import PledgeCard from "@/components/PledgeCard";
import Leaderboard from "@/components/Leaderboard";
import { type FootprintResult as FootprintResultType } from "@/lib/emissions";

type Stage = "quiz" | "result" | "story" | "pledge" | "leaderboard";

export default function Home() {
  const [stage, setStage] = useState<Stage>("quiz");
  const [quizResult, setQuizResult] = useState<(FootprintResultType & { city: string }) | null>(null);

  const resultRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);
  const pledgeRef = useRef<HTMLDivElement>(null);
  const leaderboardRef = useRef<HTMLDivElement>(null);

  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
  };

  const handleQuizComplete = (result: FootprintResultType & { city: string }) => {
    setQuizResult(result);
    setStage("result");
    scrollTo(resultRef);
  };

  const handleResultContinue = () => {
    setStage("story");
    scrollTo(storyRef);
  };

  const handleStoryContinue = () => {
    setStage("pledge");
    scrollTo(pledgeRef);
  };

  const handlePledgeContinue = () => {
    setStage("leaderboard");
    scrollTo(leaderboardRef);
  };

  return (
    <div className="w-full flex flex-col bg-background text-foreground">
      <Hero />
      <HistoryScroll />
      <LiveStats />
      <Quiz onComplete={handleQuizComplete} />

      {quizResult && stage !== "quiz" && (
        <div ref={resultRef}>
          <FootprintResult result={quizResult} onContinue={handleResultContinue} />
        </div>
      )}

      {quizResult && (stage === "story" || stage === "pledge" || stage === "leaderboard") && (
        <div ref={storyRef}>
          <AIStory result={quizResult} onContinue={handleStoryContinue} />
        </div>
      )}

      {quizResult && (stage === "pledge" || stage === "leaderboard") && (
        <div ref={pledgeRef}>
          <PledgeCard result={quizResult} onContinue={handlePledgeContinue} />
        </div>
      )}

      <div ref={leaderboardRef} style={{ display: stage === "leaderboard" || !quizResult ? "block" : "none" }}>
        <Leaderboard />
      </div>
    </div>
  );
}
