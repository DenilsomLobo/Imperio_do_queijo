import {listProfiles,enterProfile} from '../persistence/local.js';
import {cloud} from '../persistence/firebase.js';
import {rules} from '../data/game-rules.js';
const money=n=>(n/100).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
export function rankingUI(assets,getProfile){
 const dialog=document.createElement('dialog');dialog.id='ranking-dialog';dialog.setAttribute('aria-labelledby','ranking-title');
 dialog.innerHTML='<div class="dialog-heading"><img class="action-icon" src="'+assets['icon_ranking.png']+'" alt=""><h2 id="ranking-title">Ranking · Top 10</h2><button type="button" data-close aria-label="Fechar ranking">✕</button></div><p>Ordenado pelo dinheiro guardado no caixa da empresa, em reais. Estoques e dinheiro ainda nas lojas não entram.</p><p id="ranking-source" role="status"></p><ol id="ranking-list"></ol><button id="ranking-refresh">Atualizar ranking</button>';
 document.body.append(dialog);dialog.querySelector('[data-close]').onclick=()=>dialog.close();
 async function refresh(){
  const source=dialog.querySelector('#ranking-source'),list=dialog.querySelector('#ranking-list'),button=dialog.querySelector('#ranking-refresh');
  button.disabled=true;source.textContent='Carregando ranking…';list.replaceChildren();
  try{
   const profiles=await listProfiles(),profile=getProfile() ?? profiles[0];let entries;
   if(cloud.enabled()&&profile){try{entries=await cloud.top(profile,rules.version);source.textContent='Ranking na nuvem · '+rules.version+' · ambiente de testes.';}catch(e){source.textContent='Nuvem indisponível: '+e.message+' Exibindo apenas perfis deste navegador.';}}
   if(!entries){entries=profiles.filter(p=>Number.isSafeInteger(p.cash)).sort((a,b)=>b.cash-a.cash||a.name.localeCompare(b.name,'pt-BR')||a.id.localeCompare(b.id)).slice(0,10);if(!source.textContent.startsWith('Nuvem indisponível'))source.textContent=cloud.enabled()?'Entre em um perfil para consultar a nuvem. Perfis deste navegador:':'Ranking local deste navegador. Firebase aguardando configuração.';}
   for(const entry of entries){const li=document.createElement('li'),name=document.createElement('strong'),cash=document.createElement('span');name.textContent=entry.name;cash.textContent=money(entry.cash);li.append(name,cash);list.append(li);}
   if(!entries.length){const empty=document.createElement('p');empty.textContent='Nenhum progresso salvo neste ranking ainda.';list.append(empty);}
  }catch(e){source.textContent='Não foi possível consultar o ranking: '+e.message;}
  finally{button.disabled=false;}
 }
 dialog.querySelector('#ranking-refresh').onclick=refresh;
 return {open(){if(!dialog.open)dialog.showModal();refresh();}};
}
export async function playerEntry(assets,ranking){
 const root=document.querySelector('#app');
 root.classList.add('entry-mode');
 root.innerHTML=`<main class="entry-screen"><section class="entry-card"><img class="entry-logo" src="${assets['text_logo.png']}" alt="Império do Queijo"><p class="entry-eyebrow">SEU IMPÉRIO COMEÇA AQUI</p><h1>Entre em Queijópolis</h1><p>Escolha seu nome para continuar ou começar uma campanha. Seu progresso fica separado por perfil neste navegador.</p><form id="entry-form"><label for="player-name">Nome do jogador</label><input id="player-name" name="playerName" autocomplete="nickname" minlength="2" maxlength="30" required placeholder="Como você quer ser chamado?"><button type="submit">Entrar no jogo</button></form><p id="entry-error" role="alert"></p><div id="saved-profiles"></div><button id="entry-ranking" class="entry-ranking"><img class="action-icon" src="${assets['icon_ranking.png']}" alt="">Ranking</button><p class="entry-note">${cloud.enabled()?'Nuvem disponível após entrar no perfil.':'Salvamento local ativo. Nuvem aguardando configuração do Firebase.'}</p></section></main>`;
 root.querySelector('#entry-ranking').onclick=()=>ranking.open();
 try{const profiles=await listProfiles();if(profiles.length){const heading=document.createElement('h2');heading.textContent='Continuar um perfil';root.querySelector('#saved-profiles').append(heading);for(const p of profiles){const b=document.createElement('button');b.type='button';b.textContent=p.name;b.onclick=()=>{root.querySelector('#player-name').value=p.name;root.querySelector('#player-name').focus();};root.querySelector('#saved-profiles').append(b);}}}catch(e){root.querySelector('#entry-error').textContent='Falha ao ler perfis: '+e.message;}
 return new Promise(resolve=>{root.querySelector('#entry-form').onsubmit=async e=>{e.preventDefault();const b=e.submitter;b.disabled=true;try{const profile=await enterProfile(root.querySelector('#player-name').value);resolve(profile);}catch(error){root.querySelector('#entry-error').textContent=error.message;b.disabled=false;}};root.querySelector('#player-name').focus();});
}
