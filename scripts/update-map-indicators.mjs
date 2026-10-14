import {readFileSync,writeFileSync} from 'node:fs';
const file='src/map/game-scene.js';
let code=readFileSync(file,'utf8');
code=code.replace('import { collectorPosition }','import { collectorPosition, collectionAsset, shopAsset, guardAsset, combatIcons }');
const start=code.indexOf('        if (s.type === "security") {',code.indexOf('    refresh() {'));
const end=code.indexOf('\n      }\n    }\n    label(',start);
if(start<0||end<0)throw Error('Scene boundary not found');
code=code.slice(0,start)+`        if (s.type === "security") {
          const color = p.owner === "player" ? 0x52734d : p.owner === "neutral" ? 0x786858 : 0xc66b43;
          draw.fillStyle(0xdcc9a7,0.9);
          draw.fillEllipse(s.sprite.x,s.sprite.y,74,42);
          draw.lineStyle(selected?4:2,color,1);
          draw.strokeEllipse(s.sprite.x,s.sprite.y,74,42);
          const image = this.add.image(s.sprite.x,s.sprite.y,guardAsset(p)).setOrigin(0.5,1).setDepth(10001);
          const width = p.team ? 88 : 68;
          image.setDisplaySize(width,width*image.height/image.width);
          this.dynamicObjects.push(image);
          if (!presentationOnly && p.team) this.label(s.sprite.x,s.sprite.y+8,"★".repeat(p.team.stars),12,true);
          if (!presentationOnly) combatIcons(state,p.id).forEach((asset,i)=>{
            this.dynamicObjects.push(this.add.image(s.sprite.x+i*54,s.sprite.y-125,asset).setDisplaySize(50,50).setDepth(10004));
          });
          continue;
        }
        const physical = this.propertySprites.get(s.id);
        if (physical && p.type === "sale") {
          const asset = shopAsset(s,p);
          if (physical.texture.key !== asset) {
            physical.setTexture(asset);
            physical.setDisplaySize(s.sprite.width,s.sprite.width*physical.height/physical.width);
          }
        }
        if (presentationOnly || !s.building) continue;
        this.label(s.sprite.x,s.sprite.y+8,s.name,18,true);
        const asset = collectionAsset(p);
        if (asset) {
          const {x,y}=collectorPosition(s);
          this.collectors.push({id:p.id,x,y});
          this.dynamicObjects.push(this.add.image(x,y,asset).setDisplaySize(60,60).setDepth(10003));
        }`+code.slice(end);
writeFileSync(file,code);
