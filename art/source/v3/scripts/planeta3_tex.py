
# ---- texturas do planeta V3 (tons mais escuros e ricos) ----
STYLE.update({"Madeira":dict(style='wood',tile=0.8),"Folha":dict(style='leaf',tile=1.2),"Sakura":dict(style='leaf',tile=0.8),
  "Branco":dict(style='flat'),"Vinho":dict(style='sign',fg='#F2EEE2',n=2,mode='fit'),"Laranja":dict(style='flat'),"Escuro":dict(style='metal')})
REP={"Grama":dict(style='grass',col='#3F7A3A',col2='#2C5A2E',dirt='#2A4A2A',tile=5.0),"Terra":dict(style='dirt',col='#7A6448',tile=3.0),
     "Pedra":dict(style='stone',col='#5E5A72',tile=2.2,moss=True),"Asfalto":dict(style='asphalt',col='#4E5360',tile=3.0),
     "Concreto":dict(style='concrete',col='#7C7888',tile=2.0),"Agua":dict(style='water',col='#2F8FD0',tile=4.0)}
objs_tex=[bpy.data.objects[n] for n in PLANET_OBJS if bpy.data.objects[n].type=='MESH' and not n.startswith('bloqueio_')]
rules,cells,apath=auto_rules(objs_tex,atlas_name="planeta3_atlas",size=1024,keep=tuple(REP.keys()))
for i,(nm,sp) in enumerate(REP.items()):
    rules[nm]=dict(mode='repeat',tile=sp['tile'],img=make_tile("planeta3_"+nm.lower(),sp,size=1024,seed=10+i),to=nm)
for o in objs_tex: texture_object(o,rules,cells,apath)
