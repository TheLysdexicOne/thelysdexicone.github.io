import { GameHomePage } from "@shared/components/game-home";
import { ballXPitConfig } from "@shared/config/games/ball-x-pit";

export default function Home() {
  return <GameHomePage config={ballXPitConfig} />;
}
