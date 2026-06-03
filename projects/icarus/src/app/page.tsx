import { GameHomePage } from "@shared/components/game-home";
import { icarusConfig } from "@shared/config/games/icarus";

export default function Home() {
  return <GameHomePage config={icarusConfig} />;
}
