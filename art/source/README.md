# Arte: arquivos-fonte

`.blend` originais dos modelos em `apps/web/src/assets/models/` e os scripts Python que os geram.

| Arquivo | Modelo |
| --- | --- |
| `aika.blend` | Aika (husky), esqueleto com antebraços e rabo (`tail.1`, `tail.2`); ações Idle, Walk, Run, Jump, Swim |
| `felipe.blend` | Felipe; ação Idle de braços cruzados |
| `templo.blend` | Templo + torii (4,8 m) + lanternas; faixa livre a 3,2 m para o Felipe |
| `planeta.blend` | Planeta r = 20 m com Empties `poi_*`, `area_*`, `historia_N`, `agua_*`, `bloqueio_*` |

## Scripts (`scripts/`)

Geram os modelos do zero dentro do Blender 5.1 (rodar pelo console Python ou pelo MCP do Blender).
Esperam os arquivos em `~/Documents/AikaWorld/blockout/`:
`helpers.py` (materiais, exportação), `geo.py` (telhado, vigas), `charlib2.py` (peças e esqueleto),
`animlib2.py` (animações), `show.py` (render de vitrine com bloom), e um script por modelo.
Os módulos são carregados com `exec(open(...).read())`, e os nomes internos começam com `_`
(ex.: `_helpers.py`) na pasta de trabalho.

Materiais: só Base Color; `@unlit` = emissivo sem sombra (neon, luzes). Neon ciano = `NeonAzul@unlit`.
