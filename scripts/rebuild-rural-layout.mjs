import {readFileSync,writeFileSync} from 'node:fs';
const file=new URL('../src/data/rural-layout.json',import.meta.url);
const layout=JSON.parse(readFileSync(file,'utf8'));
layout.width=3000; layout.height=2000; layout.streetLayoutVersion=3;
layout.layoutVersion=3;
layout.roadTexture='rural-dirt-road-v1.png';
const corners={
 'sale-e1':[1625,667,'north'],'sale-e2':[1125,611,'north'],'sale-e3':[2188,667,'north'],'sale-n8':[2625,722,'north'],
 'sale-e4':[2563,1111,'town'],'sale-e5':[2563,1444,'town'],
 'sale-n1':[1370,1020,'town'],'sale-n2':[2063,1000,'town'],'sale-n6':[1625,1222,'town'],
 'sale-n3':[1100,950,'countryside'],'sale-n4':[700,1350,'countryside'],
 'sale-n5':[1170,1400,'countryside'],'sale-n7':[1450,1720,'countryside'],'sale-ze':[765,1880,'countryside'],
};
const positions={
 'bank-rural':[1500,1420,220,'town'],'bank-city':[1940,1500,220,'town'],
 'employee-agency':[1810,1820,220,'town'],'security-agency':[2310,1720,220,'town'],
 transport:[2190,1330,220,'town'],'factory-level-2':[1625,890,220,'town'],
 'cow-shop':[750,780,220,'countryside'],'factory-ze':[820,1550,230,'countryside'],
 'factory-level-1':[850,1150,220,'countryside'],'farm-ze':[450,1630,260,'countryside'],
 'farm-level-1':[450,750,260,'countryside'],'farm-level-2':[340,1190,270,'countryside'],
 'farm-coalho':[2063,345,260,'north'],'factory-coalho':[1500,345,240,'north'],
};
for(const p of layout.properties){
 if(corners[p.id]){
  const [x,y,district]=corners[p.id];
  Object.assign(p,{x:x-105,y:y-70,width:200,control:[x,y],district,intersectionId:`corner-${p.id}`});
 }else if(positions[p.id]){
  const[x,y,width,district]=positions[p.id];Object.assign(p,{x,y,width,district});
 }
}
// Posição solicitada: barraca ao sul/esquerda, sem a placa da fábrica sobre a arte.
const initialShop=layout.properties.find(p=>p.id==='sale-ze');
Object.assign(initialShop,{x:660,y:1840,asset:'ponto_de_venda_inicial_seu_ze.png'});
layout.properties.find(p=>p.id==='bank-city').level=2;
// A connected road graph: every endpoint is a shop control or a building entrance.
const nodes=Object.fromEntries(layout.properties.map(p=>[p.id,p.control?{x:p.control[0],y:p.control[1]}:{x:p.x,y:p.y+30}]));
const links=[
 ['sale-e2','sale-e1'],['sale-e1','sale-e3'],['sale-e3','sale-n8'],['sale-n8','sale-e5'],
 ['sale-e1','sale-n6'],['sale-e2','sale-n3'],
 ['sale-n1','sale-n2'],['sale-n2','sale-e4'],['sale-e4','sale-e5'],['sale-e5','sale-n6'],['sale-n6','sale-n1'],
 ['sale-n1','sale-n3'],['sale-n3','sale-n4'],['sale-n4','sale-n5'],['sale-n5','sale-n6'],
 ['sale-n5','sale-n7'],['sale-n7','bank-rural'],['sale-ze','sale-n4'],['sale-ze','sale-n5'],
 ['farm-level-1','cow-shop'],['cow-shop','sale-n3'],['farm-level-2','sale-n4'],['farm-ze','sale-ze'],
 ['factory-ze','sale-ze'],['factory-level-1','sale-n3'],['factory-level-2','sale-n6'],
 ['factory-coalho','sale-e1'],['farm-coalho','sale-e3'],
 ['bank-rural','sale-n6'],['bank-city','bank-rural'],['employee-agency','bank-city'],
 ['security-agency','sale-e5'],['transport','sale-e4'],
];
layout.roads=links.map(([from,to],i)=>({id:`path-${i}`,name:'Estrada de terra',from,to,width:36,points:[nodes[from],nodes[to]]}));
layout.intersections=layout.properties.filter(p=>p.control).map(p=>({id:p.intersectionId,...nodes[p.id],saleId:p.id,
 roadIds:layout.roads.filter(r=>r.from===p.id||r.to===p.id).map(r=>r.id)}));
layout.land=[[950,1750],[2780,1580],[540,1020],[2680,1280],[730,520],[2800,850]];
writeFileSync(file,JSON.stringify(layout,null,2)+'\n');
