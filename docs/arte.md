# Guia de arte — modelos no Blender

Como modelar e exportar os `.glb` para que eles entrem no mundo sem ajustes no código.

## Onde colocar os arquivos

Salve os `.glb` em [`apps/web/src/assets/models/`](../apps/web/src/assets/models/). Cada arquivo
substitui a forma simples correspondente assim que existe. Se faltar, ainda estiver carregando
ou falhar, a forma simples continua aparecendo. Os `.blend` podem ficar em `art/source/`.

| Arquivo         | O que é                                             |
| --------------- | --------------------------------------------------- |
| `aika.glb`      | a Aika, guia que segue o visitante (`Idle`/`Walk`)  |
| `visitante.glb` | o visitante/viajante (`Idle`/`Walk`, roupa `@tint`) |
| `planeta.glb`   | terreno + decoração fixa + Empties de posição       |
| `templo.glb`    | templo japonês · Sobre (com torii e lanternas)      |
| `felipe.glb`    | NPC do Felipe, na frente do templo                  |
| `servico.glb`   | prédio de empresa da Praça dos Serviços (6 cópias)  |
| `npc.glb`       | NPC genérico na porta de cada serviço (6 cópias)    |
| `correio.glb`   | caixa de correio ao lado do templo · Contato        |
| `casa.glb`      | casa base dos repositórios (cor e altura variam)    |
| `arvore.glb`    | árvore espalhada pelo código (só sem `planeta.glb`) |
| `pedra.glb`     | pedra espalhada pelo código (só sem `planeta.glb`)  |

## Escala e orientação

- **1 unidade = 1 metro.** O planeta tem raio de **20 m**.
- Aika: cerca de **2 m** de altura (proporção de brinquedo).
- Construções: **3 a 6 m** de altura, base de mais ou menos **3 × 3 m**.
- **Origem** no centro da base: pés ou chão em Z = 0.
- **Frente** apontando para **−Y** (vista Front, numpad 1). O exportador converte para a frente
  usada no código.
- Aplique escala e rotação antes de exportar: **Ctrl+A → All Transforms**.

## Estilo

- Low-poly, faces chapadas, sem texturas pintadas. Use só cor por material ou uma textura de
  paleta de até 256 px.
- Materiais com **Principled BSDF** usando apenas **Base Color** (e Emission, se quiser). O site
  troca tudo por um shader cartoon ao carregar.
- Sufixos no **nome do material**:
  - `@unlit`: sem luz nem sombra, cor pura (lâmpadas, neon, água brilhante). Ex.: `Luz@unlit`.
  - `@tint`: recebe a cor da linguagem do repositório (só na `casa.glb`). Ex.: `Parede@tint`.

Paleta: mundo colorido e lúdico, com as cores da marca Aika (aikanakamura.com) nos detalhes
da personagem e nos pontos de interesse (telhados, placas, antena).

| Uso                    | Cor       |
| ---------------------- | --------- |
| **Marca: laranja**     | `#ff5a02` |
| **Marca: verde neon**  | `#00ff41` |
| **Marca: quase preto** | `#0d0a08` |
| Roupa da Aika          | `#f06c9b` |
| Cabelo                 | `#3b2a6b` |
| Pele                   | `#f6d2b8` |
| Grama                  | `#8fd18a` |
| Caminho                | `#e9d8a6` |
| Céu / fundo            | `#1b1733` |

## Limite de triângulos

| Modelo            | Máximo |
| ----------------- | ------ |
| Aika              | 5.000  |
| Cada construção   | 3.000  |
| Casa base         | 1.500  |
| Árvore / pedra    | 300    |
| Planeta (terreno) | 5.000  |

Meta: **todos os `.glb` somados abaixo de 5 MB**.

## Aika

- Um mesh com **Armature**.
- Ações com estes nomes exatos: **`Idle`** e **`Walk`**. `Wave` é opcional, para um emote futuro.
- `Walk` anda **no lugar**, sem sair da origem: quem move a Aika é o código (ela segue o
  visitante e anda ao lado dele).
- As duas ações devem fazer loop. Na exportação, marque **Animation → Export all actions** (ou
  empilhe no NLA).
- O código mistura `Idle` e `Walk` conforme a velocidade. Se os nomes estiverem errados, o
  console do navegador avisa quais ações encontrou.

## Visitante

- O personagem de quem visita o site: um "viajante" chibi com mochila, mesma escala, orientação e
  ações (`Idle`, `Walk`) da Aika.
- A roupa usa um material `@tint`: cada visita sorteia uma cor (e, no multiplayer, cada visitante
  terá a sua).

## Planeta

- Comece com uma **Icosphere** (subdivisões 4 ou 5), origem no centro do planeta em (0, 0, 0).
- Relevo é bem-vindo: morros suaves, lago afundado, caminho. A Aika segue a altura do terreno.
  Evite paredes verticais onde ela anda.
- **Trilha da história:** modele um caminho que dá a volta inteira no planeta. Ao longo dele ficam
  NPCs (por padrão, o Felipe de cada época) que contam os marcos da vida dele em conversa, cada
  um com uma placa do ano atrás. Posicione-os com os Empties `historia_N`; sem eles, o código
  usa um anel a cerca de 75° do polo norte.
- Mantenha a superfície andável entre **19 e 21 m** do centro.
- A decoração fixa (árvores, pedras, cercas) pode ser modelada direto no planeta. Com
  `planeta.glb`, o código não espalha as árvores e pedras de primitivas.

### Nomes especiais (objetos dentro do `planeta.glb`)

| Nome                                | Tipo  | Efeito                                                                                                                                                 |
| ----------------------------------- | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `bloqueio_*` (ex.: `bloqueio_lago`) | Mesh  | Barreira invisível: o visitante não entra na área que ele cobre visto de cima.                                                                         |
| `poi_templo`, `poi_correio`         | Empty | Posição do marco (sem `poi_correio`, a caixa fica ao lado do templo). Gire o Empty para escolher para onde o prédio olha; sem giro, olha para o spawn. |
| `area_servicos`                     | Empty | Centro da Praça dos Serviços (6 prédios em ferradura, raio de 7 m, abertura para o spawn).                                                             |
| `area_vila`                         | Empty | Centro da vila das casas dos repositórios. Propriedade personalizada `raio` (metros, padrão 12).                                                       |
| `historia_1`, `historia_2`, …       | Empty | Posição dos NPCs da Trilha da história, na ordem dos marcos (a placa fica 1,3 m atrás).                                                                |

- O **spawn** do visitante é o polo norte (+Z no Blender, topo do planeta). Deixe essa área livre.
- Para a propriedade `raio`: selecione o Empty → Object Properties → Custom Properties → Add, e
  marque **Include → Custom Properties** na exportação.
- Os prédios, NPCs e casas são posicionados pelo código em cima do terreno. Não modele o templo,
  os prédios de serviço e a caixa de correio dentro do planeta: use os Empties. Deixe uma praça plana de
  cerca de 18 m de diâmetro em volta do `area_servicos`.

## Templo japonês

- Base de pedra, pilares, paredes shoji e telhado em dois níveis; **torii** na frente (a cerca de
  4,8 m do centro, em −Y) e duas lanternas de pedra. Pilares e torii no laranja da marca.
- Deixe livre a faixa entre o templo e o torii: o Felipe fica ali, a 3,2 m do centro.

## Caixa de correio

- Caixa de correio no estilo japonês (tipo "posuto"), cerca de 1,5 m de altura, no laranja da
  marca, com portinhola na frente (−Y) e uma bandeirinha. Fica à direita do templo, a cerca de
  3,8 m para o lado e 2,2 m à frente do centro dele. Interagir com ela mostra os contatos.

## NPCs (Felipe e atendentes)

- Mesma escala e orientação da Aika (cerca de 2 m, frente em −Y, pés em Z = 0).
- `felipe.glb`: o Felipe, roupa escura com detalhes laranja. Também é usado nos NPCs da Trilha
  da história (o Felipe de cada época). Ele se vira para o visitante quando ele
  chega perto (o código gira o modelo inteiro).
- `npc.glb`: um atendente genérico usado nos 6 serviços. A roupa usa um material `@tint`, que
  recebe a cor de cada prédio.
- Ação `Idle` opcional (ainda não tocada pelo código; hoje o boneco só balança de leve).

## Prédio de serviço

- Um prédio de empresa de cerca de 3 × 2,6 m de base e 3 a 4 m de altura, fachada (porta e
  letreiro) em −Y. As paredes usam `@tint` para receber a cor de cada serviço; o letreiro fica no
  laranja da marca. O nome do serviço aparece como rótulo flutuante, não precisa estar no modelo.

## Casa base

- Modelada com **3 m** de altura. O código estica na vertical conforme a atividade do repositório
  (entre cerca de 0,5× e 2×), então evite detalhes que ficam estranhos esticados.
- A parede usa um material com `@tint` para receber a cor da linguagem.

## Exportação

File → Export → **glTF 2.0**:

- Format: **glTF Binary (.glb)**
- Include: **Selected Objects** (e **Custom Properties** no planeta)
- Transform: **+Y Up** marcado
- Mesh: **Apply Modifiers**
- Não exporte câmeras nem luzes.
- Compressão: marque **Compression** (Draco) se o arquivo passar de 1 MB. O site já sabe ler.

## Blender MCP (opcional)

Para eu controlar o Blender ao vivo, rode o Claude Code **no seu computador** (desktop ou
terminal) com o [blender-mcp](https://github.com/ahujasid/blender-mcp):

1. Instale o [uv](https://docs.astral.sh/uv/).
2. Baixe o `addon.py` do repositório do blender-mcp e instale no Blender (Edit → Preferences →
   Add-ons → Install from Disk).
3. No Blender, abra a barra lateral (N) → aba **BlenderMCP** → **Connect**.
4. No terminal: `claude mcp add blender -- uvx blender-mcp`.

Confira os passos no README do blender-mcp, que pode ter mudado.
