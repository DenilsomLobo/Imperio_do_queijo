export function resetCampaignUI({onReset}) {
 const dialog=document.createElement('dialog');
 dialog.id='reset-campaign-dialog';
 dialog.setAttribute('aria-labelledby','reset-campaign-title');
 dialog.setAttribute('aria-describedby','reset-campaign-description');
 document.body.append(dialog);
 let stage=1, busy=false;
 const cancel=()=>{if(!busy) dialog.close();};
 function render() {
  dialog.innerHTML='<h2 id="reset-campaign-title">Resetar campanha</h2>'+ (stage===1
   ? '<p id="reset-campaign-description">Esta ação apaga todo o progresso da campanha atual e inicia uma nova campanha do zero.</p><p>Deseja continuar para a confirmação final?</p><div class="reset-actions"><button data-cancel autofocus>Cancelar</button><button id="reset-continue">Continuar</button></div>'
   : '<p id="reset-campaign-description">Todo o progresso da campanha atual será perdido. Para confirmar, digite <strong>SAIR</strong> e clique em <strong>OK</strong>.</p><label for="reset-confirmation">Digite SAIR</label><input id="reset-confirmation" type="text" autocomplete="off" spellcheck="false" autocapitalize="off" aria-describedby="reset-campaign-description"><p id="reset-error" role="alert"></p><div class="reset-actions"><button data-cancel>Cancelar</button><button id="reset-ok" class="danger-button" disabled>OK</button></div>');
  dialog.querySelector('[data-cancel]').onclick=cancel;
  if(stage===1) dialog.querySelector('#reset-continue').onclick=()=>{stage=2;render();dialog.querySelector('input').focus();};
  else {
   const input=dialog.querySelector('input'),ok=dialog.querySelector('#reset-ok');
   input.oninput=()=>{ok.disabled=input.value!=='SAIR';};
   ok.onclick=async()=>{
    if(busy || input.value!=='SAIR') return;
    busy=true;ok.disabled=true;input.disabled=true;dialog.querySelector('[data-cancel]').disabled=true;
    dialog.querySelector('#reset-error').textContent='';
    try {await onReset();busy=false;dialog.close();}
    catch(e) {dialog.querySelector('#reset-error').textContent='Não foi possível resetar a campanha: '+e.message;}
    finally {busy=false;if(dialog.open){input.disabled=false;ok.disabled=input.value!=='SAIR';dialog.querySelector('[data-cancel]').disabled=false;input.focus();}}
   };
  }
 }
 dialog.addEventListener('cancel',e=>{if(busy)e.preventDefault();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)cancel();}});
 return {open(){if(busy)return;stage=1;render();dialog.showModal();dialog.querySelector('[data-cancel]').focus();}};
}
