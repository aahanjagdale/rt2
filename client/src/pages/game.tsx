import { GameCard } from "@/components/ui/game/game-card";

export default function Game() {
  return (
    <div className="space-y-8">
      <h2 className="text-3xl font-bold tracking-tight text-center">
        Truth or Dare
      </h2>
      <p className="text-muted-foreground text-center max-w-md mx-auto">
        Test your boundaries and spice things up with our romantic truth or dare game.
        Adjust the intensity to your comfort level.
      </p>
      <GameCard />
    </div>
  );
}
