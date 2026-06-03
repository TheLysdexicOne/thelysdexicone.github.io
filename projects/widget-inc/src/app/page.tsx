import { GameHomePage } from "@shared/components/game-home";
import { widgetIncConfig } from "@shared/config/games/widget-inc";

export default function Home() {
  return <GameHomePage config={widgetIncConfig} />;
}
