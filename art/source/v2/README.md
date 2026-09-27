# Arte v2: arquivos-fonte (blockout)

Fase 1 da [direção de arte v2](../../../docs/direcao-de-arte-v2.md): **formas sem textura** de
`planeta`, `templo` e `visitante`, para validar escala e composição. Renders em
[`docs/renders/`](../../../docs/renders/).

| Arquivo | Conteúdo |
| --- | --- |
| `visitante.blend` | Corpo (`corpo`) + roupa padrão (`cabelo_curto`, `cima_moletom`, `baixo_calca_larga`, `pes_tenis_grosso`, `acess_bolsa_carteiro`), todas no mesmo esqueleto (com joelhos e cotovelos); ações Idle, Walk, Run, Jump, Swim, Wave |
| `templo.blend` | Templo de 2 níveis, torii a 4,8 m, faixa livre a 3,2 m |
| `planeta.blend` | Diorama r = 20 m: colina do templo com escadaria (`laje_escadaria`), barranco em camadas, cachoeira no lago fundo, mini-esquina na praça (`chao_asfalto`, `piso_calcada`), vila, trilha, Empties |

## Scripts (`scripts/`)

Geram tudo do zero no Blender 5.1. Pasta de trabalho: `~/Documents/AikaWorld/v2/` (os módulos lá
têm `_` no começo do nome: `_helpers.py`, `_rig3.py`...). Ordem: `helpers` → `geo`/`rig3`/`anim3` →
`visitante` | `templo2` | `planeta2`; `show` + `vitrine` fazem os renders.

- `rig3.py`: peças com **pesos suaves** (cada sub-parte pesa entre 1 e 2 ossos por distância), para
  as roupas do guarda-roupa não rasgarem nas animações.
- `anim3.py`: ciclos no lugar (Walk 1 s, Run ~0,6 s), Idle de 4 s (respira, troca o peso, olha em
  volta), Jump, Swim e Wave.
