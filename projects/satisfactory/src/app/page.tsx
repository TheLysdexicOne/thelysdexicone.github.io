import { GameHomePage } from "@shared/components/game-home";
import { satisfactoryConfig } from "@shared/config/games/satisfactory";

export default function Home() {
  return <GameHomePage config={satisfactoryConfig} />;
}
