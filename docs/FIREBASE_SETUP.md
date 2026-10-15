# Perfis, nuvem e ranking

Implementação de 15/10/2026. A configuração será fornecida pelo usuário; nada foi publicado no Firebase e nenhum banco real foi acessado nesta tarefa.

## Estado atual

Entrada por nome, campanhas independentes por perfil e ranking top 10 local estão funcionais. O primeiro perfil adota o save antigo sem nome, sem mudar caixa ou recursos. Novos perfis começam com o crédito de testes de R$ 100 milhões. A pontuação é o caixa disponível atual em centavos, sem estoque, faturamento ou dinheiro não coletado nas lojas. Gastar dinheiro reduz o valor do próximo checkpoint; reset substitui a pontuação da campanha do perfil.

Nome identifica um perfil deste navegador e não é senha. Com Firebase configurado, cada perfil obtém uma identidade anônima. Outro navegador não recupera a identidade digitando o mesmo nome. Vinculação com conta e recuperação entre dispositivos ficam para a próxima etapa de autenticação; não prometer login recuperável nesta entrega.

## Configuração necessária

1. Fornecer a configuração pública do app Web Firebase, sobretudo `apiKey` e `projectId`. Não fornecer chave privada de conta de serviço.
2. Criar Cloud Firestore no projeto e habilitar o provedor **Anonymous** em Firebase Authentication.
3. Copiar `.env.example` para `.env.local` e preencher `VITE_FIREBASE_API_KEY` e `VITE_FIREBASE_PROJECT_ID`. Reiniciar o Vite/recompilar após alterar variáveis. O arquivo local não entra no Git.
4. Validar `firestore.rules` no emulador/projeto e instalar o índice de `firestore.indexes.json`. `firebase.json` já aponta a ambos. Ainda não executado, pois o projeto não foi fornecido.
5. Testar criação/refresh da identidade, escrita/leitura privada, top 10, permissão negada para outro UID, offline e retry. Somente então declarar nuvem ativada. Índices podem levar tempo para ficar disponíveis; a interface informa falhas e mantém o ranking local como alternativa explícita.

## Persistência e segurança

- IndexedDB grava campanha, perfil e placar local na mesma transação; a chave `current` continua compatível com ferramentas antigas. As campanhas nomeadas usam `campaign:{profileId}`.
- A nuvem usa `saves/{uid}` para o JSON privado do progresso e `ranking/{uid}` para nome público, caixa, campanha, versão das regras e data do checkpoint. Não publica o save nem os tokens no ranking.
- Cada salvamento na nuvem usa um commit atômico para os dois documentos. Os checkpoints são serializados, local primeiro, com intervalo de um minuto real para automáticos; Salvar e Resetar solicitam checkpoint adicional. Falha de rede mantém a cópia local e permite tentativa posterior.
- Documentos de save são limitados a 850 KB de JSON antes do envio. Campanhas maiores continuam salvas localmente e mostram erro de nuvem; expansão para snapshots particionados permanece pendente.
- A consulta filtra a versão das regras, ordena `cash` em ordem decrescente e limita a dez registros. O ranking atual recebe campanhas em andamento, como solicitado; a regra histórica de somente resultados finais não rege este placar por caixa atual.
- As regras fornecidas restringem acesso privado e formato, mas não provam a legitimidade do saldo calculado no navegador. Validação econômica autoritativa no servidor e proteção contra manipulação continuam pendentes. Não usar o crédito de testes como ranking competitivo definitivo.
- Sessões anônimas ficam em chave IndexedDB separada do progresso, por projeto e perfil. Perder os dados do navegador também perde a identidade anônima, até existir conta vinculada. Sincronização concorrente entre dispositivos/abas ainda não está implementada.

## Referências oficiais usadas

- [Firebase Authentication REST: criação anônima e refresh](https://firebase.google.com/docs/reference/rest/auth)
- [Cloud Firestore REST e autorização por ID token](https://firebase.google.com/docs/firestore/use-rest-api)
- [Consulta runQuery](https://firebase.google.com/docs/firestore/reference/rest/v1/projects.databases.documents/runQuery)

Firebase Data Connect oferece outra arquitetura para SQL; esta entrega usa Cloud Firestore, conforme o mestre e a confirmação de preparar Firestore na conversa.
