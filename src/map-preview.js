import { assets } from "./data/assets.js";
// Development export: isolated fresh state, never loads or writes the player's save.
import Phaser from 'phaser';
import { ruralMap } from './data/world.js';
import { createGame } from './domain/game.js';
import { mapScene } from './map/game-scene.js';
const state = createGame();
new Phaser.Game({type:Phaser.CANVAS,parent:'map',backgroundColor:'#FFF8E7',
 scale:{mode:Phaser.Scale.RESIZE,width:'100%',height:'100%'},
 scene:mapScene({assets,getMap:()=>ruralMap,getState:()=>state,getSelected:()=>null,
 onSelect:()=>{},onCollect:()=>{},onReady:()=>{},presentationOnly:true})});
