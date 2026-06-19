import Phaser from "phaser";
import type { JourneyBridge } from "./bridge";
import { JourneyScene } from "./scenes/JourneyScene";
import { WORLD_HEIGHT } from "./data/zones";

export interface CreateGameOptions {
  parent: HTMLElement;
  bridge: JourneyBridge;
  initialHealth: number;
  city: string;
}

export function createCarbonJourneyGame(options: CreateGameOptions): Phaser.Game {
  const { parent, bridge, initialHealth, city } = options;

  const game = new Phaser.Game({
    type: Phaser.CANVAS,
    parent,
    width: 960,
    height: WORLD_HEIGHT,
    backgroundColor: "#07100f",
    physics: {
      default: "arcade",
      arcade: {
        gravity: { x: 0, y: 0 },
        debug: false,
      },
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 960,
      height: WORLD_HEIGHT,
    },
    input: {
      keyboard: {
        target: window,
        capture: [
          Phaser.Input.Keyboard.KeyCodes.UP,
          Phaser.Input.Keyboard.KeyCodes.DOWN,
          Phaser.Input.Keyboard.KeyCodes.LEFT,
          Phaser.Input.Keyboard.KeyCodes.RIGHT,
          Phaser.Input.Keyboard.KeyCodes.W,
          Phaser.Input.Keyboard.KeyCodes.A,
          Phaser.Input.Keyboard.KeyCodes.S,
          Phaser.Input.Keyboard.KeyCodes.D,
          Phaser.Input.Keyboard.KeyCodes.E,
        ],
      },
    },
    scene: [],
  });

  game.scene.add("JourneyScene", JourneyScene, true, { bridge, initialHealth, city });

  return game;
}
