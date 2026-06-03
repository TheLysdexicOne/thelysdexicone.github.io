import { GameHomePage } from "@shared/components/game-home";
import { kingdomComeConfig } from "@shared/config/games/kingdom-come";

export default function Home() {
  return <GameHomePage config={kingdomComeConfig} />;
}
