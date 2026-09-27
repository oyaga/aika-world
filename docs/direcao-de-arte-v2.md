# Aika World: direção de arte v2 (instruções para o agente 3D)

> Este documento **substitui** as regras de estilo e os limites de `docs/arte.md` (v1). O
> **contrato técnico** com o código (nomes de arquivos, Empties, sufixos, animações, escala) continua
> valendo e está repetido na seção 7. Leia tudo antes de começar.

O que mudou em relação à v1:

- **Estilo novo:** a mistura do _Messenger_ (Abeto), com traço de anime, contorno de tinta e
  texturas pintadas à mão, com o nosso **planeta-templo neon**.
- **Limites de triângulos de 3 a 8 vezes maiores.** A v1 estava apertada demais e o resultado ficou
  pobre.
- **Texturas pintadas liberadas.** Na v1 era só cor por material.
- **Personagens com proporção de anime (cerca de 5 cabeças)**, em vez de chibi.

---

## 1. Referências

As imagens estão em [`docs/referencias/`](referencias/). **Abra e estude todas antes de modelar.**

| Arquivo                     | O que pegar dela                                                                                                                                                                               |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `messenger-esquina.jpg`     | **A referência principal de acabamento**: contorno de tinta, sombras chapadas coloridas, prédios cheios de detalhes pintados, placas com glifos, poste, cone, máquina de venda                 |
| `messenger-rua-celular.png` | Personagem de costas com bolsa-carteiro e glifo; céu turquesa com nuvens pintadas; câmera grande-angular baixa                                                                                 |
| `messenger-personagem.png`  | Proporção e roupa dos personagens: ~5 cabeças, roupa larga, tênis grandes, cores dessaturadas                                                                                                  |
| `messenger-npc-templo.png`  | NPC sentado meditando, coreto/templo com fumaça, vegetação desenhada, grama com manchas de terra                                                                                               |
| `planeta-templo-neon.png`   | **A composição do nosso mundo**: planetinha diorama, templo japonês com filetes neon laranja e ciano, torii, lanternas acesas, cachoeira azul, rochas flutuantes, sakuras, céu índigo com luas |

## 2. A mistura, em uma frase

**"Um planetinha-diorama do Messenger na hora azul: traço de anime e texturas pintadas à mão, com
filetes de neon laranja e ciano da marca Aika acendendo o templo, as lanternas e a água."**

### Do Messenger (Abeto) vem a base

- **Contorno de tinta** escuro e levemente irregular em volta das formas e nas quinas. O site
  desenha o contorno das silhuetas (seção 5). Você **pinta nas texturas** as linhas internas:
  rachaduras, costuras, frisos, janelas, canos.
- **Sombreamento chapado em 2 tons** (luz e sombra, borda dura), com a **sombra puxada para o
  turquesa ou azul**, nunca cinza nem preto. O site faz o sombreamento; você não faz baking de luz.
- **Texturas pintadas à mão:** manchas, desgaste, sujeira, adesivos, pichações leves, grama com
  falhas de terra. É isso que dá vida.
- **Paleta dessaturada:** turquesa, menta, cinza-concreto quente, creme, vinho, mostarda.
- **Muitos props contando história:** placas com glifos, cones, postes com fios, máquina de venda,
  caixas, vasos de planta, bicicleta, bancos, lixeiras, varais.
- **Glifos pseudo-japoneses:** letreiros com caracteres inventados que _parecem_ japonês, sem ser
  legíveis. Use também o logo/marca "AIKA" estilizado como glifo.

### Do planeta-templo neon vem a composição e a assinatura

- O mundo é um **planetinha redondo** (diorama), com rochas flutuando em volta e luas pequenas no
  céu.
- **Neon da marca** em filetes finos: **laranja `#FF5A02`** e **ciano `#5CE1E6`**. Vai nas quinas do
  templo, beirais, degraus, veios das rochas e troncos. É acento, não cobertura: no máximo ~5% da
  área visível.
- **Luzes quentes:** lanternas de pedra, janelas shoji acesas e a cachoeira ciano brilhante.
- **Sakuras rosas** como ponto de cor, e uma **placa holográfica** perto do templo.

### Hora azul: como as duas paletas convivem

- **Céu:** turquesa-menta perto do horizonte (Messenger), degradê para **índigo `#1B1733`** no alto,
  com estrelas (neon). O site pinta o céu; você não modela céu.
- **Objetos:** cores do Messenger (dessaturadas, com sombra turquesa). **Luzes e neon:** cores da
  marca, saturadas e emissivas.

## 3. Paleta

| Uso                        | Cor                                                  |
| -------------------------- | ---------------------------------------------------- |
| Neon marca (laranja)       | `#FF5A02`                                            |
| Neon ciano                 | `#5CE1E6`                                            |
| Verde neon (raro, detalhe) | `#00FF41`                                            |
| Quase preto (contorno)     | `#1E1A24` (contorno, nunca preto puro)               |
| Céu horizonte / alto       | `#8FD8CF` → `#1B1733`                                |
| Concreto                   | `#B9B6A8`, `#9C9A8E`                                 |
| Sombra (tintura)           | `#5E8C8A` (turquesa acinzentado)                     |
| Grama                      | `#6FAF6A`, `#4E8F55`, manchas de terra `#C9B98A`     |
| Madeira / pilares          | `#8A5A3B`; pilares do templo em laranja marca        |
| Telhado do templo          | `#2F2A44` com filete ciano                           |
| Vinho (bolsas, placas)     | `#8E2F3C`                                            |
| Mostarda (tênis, detalhes) | `#E0A92E`                                            |
| Sakura                     | `#F4A6C0`, `#E07A9E`                                 |
| Água                       | `#3FA9D8` (superfície), cachoeira `#5CE1E6` emissiva |

## 4. Personagens

Todos com **~2 m de altura** na escala do mundo (o planeta é pequeno). A proporção é de anime: **~5
cabeças** (não chibi, não realista). Roupas largas, tênis grandes e mãos simples, com dedos em bloco
ou luva.

| Arquivo         | Quem                                                                                                                                                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `aika.glb`      | **A Aika, a guia.** Manter o conceito aprovado no commit anterior (husky de moletom laranja, fone com LED neon, rabo animado), redesenhada no novo estilo. _Se o Felipe mudar o conceito, siga o que ele disser._    |
| `visitante.glb` | **O viajante (o jogador).** Jovem neutro, bolsa-carteiro vinho com glifo "AIKA" (como em `messenger-rua-celular.png`), tênis grandes. **Material da roupa principal: `Roupa@tint`** (cada visitante recebe uma cor). |
| `felipe.glb`    | **O Felipe, criador do mundo.** Cabelo espetado, camiseta escura com estampa laranja, bermuda, tênis. Parado na frente do templo.                                                                                    |
| `npc.glb`       | **Atendente genérico** dos 6 serviços (usado 6×). Avental ou jaqueta de trabalho. **`Roupa@tint`** recebe a cor de cada serviço.                                                                                     |

**Animações** (nomes exatos; `Walk` e `Run` **no lugar**, sem sair da origem):

| Ação   | aika | visitante | felipe | npc | Observação                                         |
| ------ | :--: | :-------: | :----: | :-: | -------------------------------------------------- |
| `Idle` |  ✅  |    ✅     |   ✅   | ✅  | Respiração, peso trocando de perna, olhar em volta |
| `Walk` |  ✅  |    ✅     |   —    |  —  | Loop de 1 s                                        |
| `Run`  |  ✅  |    ✅     |   —    |  —  | Loop de ~0,6 s, tronco inclinado                   |
| `Jump` |  ✅  |    ✅     |   —    |  —  | Pose no ar (loop curto)                            |
| `Swim` |  ✅  |    ✅     |   —    |  —  | Deitado na linha d'água, braçadas, cabeça de fora  |
| `Wave` |  ⭐  |    ⭐     |   ⭐   | ⭐  | Opcional (emote 👋)                                |
| `Talk` |  —   |     —     |   ⭐   | ⭐  | Opcional: gesticulando (tocado durante a conversa) |

✅ = obrigatório, ⭐ = desejável. Personagens com **armature**. Rosto com olhos pintados na textura
(estilo anime), com olho grande e brilho.

## 5. O que o site faz (e você NÃO faz)

O código vai aplicar o visual em tempo real. **Não faça no modelo:**

- **Contorno de silhueta:** o site desenha, com espessura consistente em todos os modelos. Não crie
  malha de contorno invertida (inverted hull).
- **Sombreamento em 2 tons com sombra turquesa:** o site troca os materiais por um shader cartoon.
  **Não faça baking de luz nem de sombra** nas texturas. Uma oclusão suave em cantos fechados, bem
  leve, é permitida.
- **Brilho (bloom)** nos emissivos, **céu em degradê com estrelas e luas**, **neblina** e **nuvens
  pintadas**: tudo é do site.

**Faça no modelo:** formas, cores, **linhas internas e detalhes pintados na textura**, e o
**emissivo** (neon, lanternas, janelas, cachoeira), com material de nome `@unlit` ou Emission.

## 6. Entregas (ordem de prioridade)

### 6.1 `planeta.glb`: o diorama

- Esfera de **raio 20 m**, com a origem no centro. Silhueta de diorama: terreno com camadas de
  pedra aparecendo nas bordas dos barrancos, como em `planeta-templo-neon.png`.
- **Áreas (Empties, seção 7):**
  - **Templo**, no alto de uma colina com escadaria de pedra e degraus com filete neon, subindo até o
    torii.
  - **Praça dos Serviços**, uma **mini-esquina do Messenger**: calçada, meio-fio, asfalto com faixa
    pintada, bueiro, poste com fios, placa triangular com glifo, máquina de venda, cones e vasos.
    Área **plana de ~18 m de diâmetro**.
  - **Vila**, com gramado e caminhos de terra, onde as casas dos repositórios são colocadas pelo
    código.
  - **Trilha**, um caminho que dá a volta inteira no planeta, com as 5 paradas da história
    (`historia_1…5`).
  - **2 lagos**, um fundo e um raso, com margem de pedras. **Cachoeira** caindo do barranco,
    emissiva ciano.
- **Decoração:**
  - pinheiros low-poly com veios neon ciano e sakuras;
  - arbustos e rochas com veios neon;
  - **rochas flutuando** em volta do planeta, fora do chão;
  - grama pintada com falhas de terra;
  - props de rua na praça.
- **O que é chão:** só objetos com nome começando por `terreno`, `trilha`, `chao`, `laje`, `ponte`
  ou `piso`. Todo o resto é decoração atravessável; use `bloqueio_*` para impedir a passagem.

### 6.2 `templo.glb`: o herói da cena

- Templo japonês de 2 níveis, como em `planeta-templo-neon.png`:
  - plataforma de pedra, pilares laranja com filete neon e shoji acesos;
  - telhados índigo com beirais curvos e filetes ciano e laranja;
  - pináculo dourado brilhando, estandarte com brasão e 2 lanternas de pedra acesas;
  - **torii laranja a ~4,8 m à frente do centro**;
  - placa holográfica azul ao lado.
- Acabamento Messenger: madeira com veios pintados, pedra com rachaduras desenhadas, desgaste nos
  degraus e musgo nas bases.
- **Deixe livre** a faixa entre o templo e o torii, onde o Felipe fica, **a 3,2 m do centro**.

### 6.3 Personagens (seção 4)

Ordem: **visitante → Aika → Felipe → NPC**.

### 6.4 `servico.glb`: prédio de empresa da esquina (usado 6×)

- Prédio de 2 andares no estilo `messenger-esquina.jpg`:
  - concreto com manchas e canos;
  - toldo, letreiro grande com **glifos** e ar-condicionado na fachada;
  - vitrine e porta na frente (−Y).
- **Paredes principais: `Parede@tint`** (cor de cada serviço). O letreiro pode ter a moldura em
  laranja marca. O nome do serviço aparece por cima, pelo código.
- ~3 × 2,6 m de base, 3,5–4,5 m de altura.

### 6.5 `correio.glb`

Caixa de correio vermelha/vinho estilo japonês ("posuto", ver `messenger-esquina.jpg`), com glifo e
estrela. ~1,5 m.

### 6.6 `casa.glb`: casa dos repositórios (instanciada N vezes)

- Casinha japonesa de bairro, modelada com **3 m de altura**. O código estica só na vertical, então
  **concentre os detalhes na base e no telhado**.
- **Parede: `Parede@tint`.** Varanda, vaso de planta e ar-condicionado.

## 7. Contrato técnico com o código (não mude)

- **Escala:** 1 unidade = 1 metro. **Origem** no centro da base (pés/chão em Z = 0). O planeta é a
  exceção: origem no centro da esfera.
- **Frente** para **−Y** (vista Front, numpad 1). **Aplique as transformações** antes de exportar
  (Ctrl+A → All Transforms).
- **Nomes de arquivo:** `aika`, `visitante`, `felipe`, `npc`, `planeta`, `templo`, `servico`,
  `correio`, `casa` (+ opcionais `arvore`, `pedra`) `.glb`, em `apps/web/src/assets/models/`.
- **Sufixos de material:** `@unlit` = cor/emissivo puro, sem sombra (neon, lanternas, cachoeira).
  `@tint` = recebe a cor variável do código (`Roupa@tint`, `Parede@tint`).
- **Objetos especiais dentro de `planeta.glb`:**

| Nome                                                       | Tipo  | Função                                                           |
| ---------------------------------------------------------- | ----- | ---------------------------------------------------------------- |
| `poi_templo`                                               | Empty | Posição/rotação do templo (frente do Empty = para onde ele olha) |
| `poi_correio`                                              | Empty | Caixa de correio (opcional; sem ele, fica ao lado do templo)     |
| `area_servicos`                                            | Empty | Centro da praça (área plana de ~18 m)                            |
| `area_vila`                                                | Empty | Centro da vila; Custom Property `raio` (m)                       |
| `historia_1` … `historia_5`                                | Empty | Paradas da história na trilha                                    |
| `terreno*`, `trilha*`, `laje*`, `chao*`, `ponte*`, `piso*` | Mesh  | Chão (único lugar onde se pisa)                                  |
| `agua_*`                                                   | Mesh  | Superfície de lago: mais de 0,9 m de profundidade = nada         |
| `bloqueio_*`                                               | Mesh  | Barreira invisível                                               |

- O **polo norte (+Z)** é onde o visitante nasce. Deixe livre.
- **Não** modele templo, prédios, correio ou casas **dentro** do planeta: cada um vem em arquivo
  próprio e o código posiciona pelos Empties.

## 8. Limites (v2)

Os limites valem para desktop e celular. O que mais pesa no celular é **número de materiais e de
texturas**, não triângulos.

| Modelo                                       |   Triângulos | Texturas                                   | Materiais |
| -------------------------------------------- | -----------: | ------------------------------------------ | --------: |
| `aika`, `visitante`                          |       15.000 | 1 atlas 2048 (ou 1024)                     |       ≤ 6 |
| `felipe`, `npc`                              |       12.000 | 1 atlas 1024                               |       ≤ 6 |
| `templo`                                     |       25.000 | até 2 atlas 2048                           |      ≤ 10 |
| `servico` (6×)                               |        8.000 | 1 atlas 1024                               |       ≤ 6 |
| `casa` (N×)                                  |        4.000 | 1 atlas 1024                               |       ≤ 4 |
| `correio`                                    |        2.500 | 512                                        |       ≤ 3 |
| `planeta` (terreno + decoração + props)      |       80.000 | até 3 atlas 2048                           |      ≤ 16 |
| **Total em cena** (com 6 prédios, ~20 casas) | **~300.000** | —                                          |         — |
| **Tudo somado (arquivos)**                   |            — | **≤ 20 MB** com Draco + texturas JPEG/WebP |         — |

- **Texturas:** Base Color pintada (JPEG; PNG só se precisar de transparência). **Sem normal map,
  sem roughness/metallic** (o shader do site ignora). Um atlas por modelo sempre que possível.
- **Emissivo:** material `@unlit` com a cor neon, ou Emission com textura.
- Folhagem com recorte (alpha) só se realmente precisar. Prefira formas de folhas em malha.
- Decoração repetida (árvores, pedras, cones) pode ser **instância** no Blender (Alt+D); o glTF
  exporta como instâncias.

## 9. Exportação

- File → Export → **glTF 2.0**, **glTF Binary (.glb)**.
- Marcar **Selected Objects**, **+Y Up**, **Apply Modifiers** e **Custom Properties** (no planeta).
- Personagens: **Animation → Export all actions**; **Skinning** ligado.
- Imagens: **JPEG** (qualidade 85–90), ou "Automatic".
- **Compression (Draco)** ligada em tudo.
- Sem câmeras e sem luzes.

## 10. Como entregar

1. Trabalhe numa branch nova a partir de `claude/clever-franklin-gl44op`, por exemplo
   `modelos/v2-estilo`.
2. **Primeiro um blockout** (formas sem textura) de planeta + templo + visitante, e **renders de
   vitrine** em `docs/renders/`. Espere o OK do Felipe antes de texturizar.
3. Depois, um modelo por commit, na ordem da seção 6. Salve os `.blend` e os scripts em
   `art/source/` (como no commit anterior).
4. Antes de cada commit rode **`pnpm models:check`**: zero erros. Avisos só com justificativa na
   mensagem do commit.
5. Mande junto um **render de vitrine** de cada modelo (frente, 3/4 e costas) em `docs/renders/`.

## 11. Checklist de qualidade (antes de entregar)

- [ ] Parece um frame do Messenger (traço, textura pintada, sombra colorida) **e** tem a
      assinatura neon da Aika.
- [ ] Silhueta legível de longe (o site mostra os modelos pequenos, câmera a ~10 m).
- [ ] Linhas internas pintadas nas texturas (rachaduras, costuras, frisos).
- [ ] Nenhuma luz ou sombra "assada" na textura (só oclusão leve em cantos).
- [ ] Neon só em filetes (≤ 5% da área), nas duas cores da marca.
- [ ] Glifos inventados nos letreiros, nenhum texto legível por engano.
- [ ] Nomes, Empties, sufixos e animações conforme a seção 7.
- [ ] `pnpm models:check` sem erros; total ≤ 20 MB.
