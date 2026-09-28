# Arte V3 (planeta e templo)

Mesmo layout da v2, com o acabamento da referência noturna (planeta-templo neon):
paleta mais escura, terreno facetado, barranco de blocos com costuras neon, lanternas tōrō,
rochedos com rachaduras ciano, pinheiros de 4 camadas, samambaias, cristais nas rochas
flutuantes, trilhas de pedra (escadaria → spawn → rua e spawn → vila) e templo com paredes
escuras e shoji aceso que acompanha a curvatura do platô.

Os scripts reaproveitam as bibliotecas da v2 (`art/source/v2/scripts`). No Blender:

```python
exec(open("build3.py").read())   # carrega libs (v2) + paint.py (v3)
T3()                             # templo -> templo.glb
P3_geo(); P3_tex(); P3_export()  # planeta -> planeta.glb
```

`mk_planeta3.py` gera `planeta3.py` a partir do `planeta2.py` da v2 (substituições pontuais).
