import { GameHomePage } from "@shared/components/game-home";
import { bluePrinceConfig } from "@shared/config/games/blue-prince";

export default function Home() {
  return <GameHomePage config={bluePrinceConfig} />;
}
