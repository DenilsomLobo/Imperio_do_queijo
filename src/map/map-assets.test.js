import {it,expect} from 'vitest';
import {mapAssetIds} from './map-assets.js';
import {ruralMap} from '../data/world.js';
import paths from '../data/asset-paths.json';
import {guardAsset,shopAsset} from './presentation.js';

it('preloads map art and every ownership/team variant without unused worlds or UI art',()=>{
 const ids=mapAssetIds(ruralMap);
 expect(ids.length).toBeLessThan(Object.keys(paths).length/2);
 expect(new Set(ids).size).toBe(ids.length);
 for(const id of ids)expect(paths[id],id).toBeDefined();
 expect(ids).toContain(ruralMap.background);
 expect(ids).toContain(ruralMap.roadTexture);
 expect(ids).not.toContain('countryside-v6.png');
 expect(ids).not.toContain('text_logo.png');
 for(const owner of ['player','neutral','coalho']){
  for(const stars of [null,1,2,3])expect(ids).toContain(guardAsset({owner,team:stars?{stars}:null}));
  expect(ids).toContain(shopAsset({id:'sale-any'},{type:'sale',owner}));
 }
});
