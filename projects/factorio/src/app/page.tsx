import { GameHomePage } from "@shared/components/game-home";
import { factorioConfig } from "@shared/config/games/factorio";

export default function Home() {
  return <GameHomePage config={factorioConfig} />;
}
