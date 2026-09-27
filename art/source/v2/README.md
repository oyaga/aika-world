# Arte v2: arquivos-fonte

Modelos da [direção de arte v2](../../../docs/direcao-de-arte-v2.md). Renders em [`docs/renders/`](../../../docs/renders/).

- `*.blend`: um por modelo exportado em `apps/web/src/assets/models/`.
- `tex/`: texturas pintadas (atlas por modelo + texturas repetíveis do terreno). Os `.blend` apontam
  para `~/Documents/AikaWorld/v2/tex/`; se abrir em outra máquina, use *File → External Data → Find
  Missing Files* nesta pasta.
- `scripts/`: geram tudo do zero no Blender 5.1. Pasta de trabalho: `~/Documents/AikaWorld/v2/`, com os
  módulos prefixados por `_` (`_helpers.py`, `_paint.py`...). `build.py` tem uma função por modelo
  (`B_templo()`, `B_planeta()`, `B_visitante()`, `B_aika()`, `B_felipe()`, `B_npc(slug)`,
  `B_predio(slug)`, `B_cc("correio"|"casa")`) que reconstrói, texturiza, exporta e renderiza a vitrine.

## Como as texturas são feitas
- `paint.py`: pintor procedural em numpy (manchas, pinceladas, rachaduras e costuras em traço de tinta,
  veios de madeira, telhas, glifos pseudo-japoneses, telas, cartazes). Sem luz ou sombra assada.
- `texmap.py`: um atlas por modelo; cada material vira uma célula e os UVs são projetados na célula
  (`tile` repete por face, `fit` encaixa placas/letreiros inteiros). `@tint` recebe célula clara
  multiplicada pela cor padrão; `@unlit` fica liso (ou com textura, nas telas).
- `rig3.py`/`anim3.py`: esqueleto com joelhos e cotovelos, pesos suaves por peça, ciclos no lugar e
  um solucionador de braço usado nas poses de Idle dos atendentes.
