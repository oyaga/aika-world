
# ---- texturas do planeta ----
STYLE.update({"Madeira":dict(style='wood',tile=0.8),"Folha":dict(style='leaf',tile=1.2),"Sakura":dict(style='leaf',tile=0.8),
  "Branco":dict(style='flat'),"Vinho":dict(style='sign',fg='#F2EEE2',n=2,mode='fit'),"Laranja":dict(style='flat'),"Escuro":dict(style='metal')})
REP={"Grama":dict(style='grass',col='#6FAF6A',col2='#4E8F55',tile=5.0),"Terra":dict(style='dirt',col='#C9B98A',tile=3.0),
     "Pedra":dict(style='stone',col='#8E8A96',tile=2.2,moss=True),"Asfalto":dict(style='asphalt',col='#6E7478',tile=3.0),
     "Concreto":dict(style='concrete',col='#B9B6A8',tile=2.0),"Agua":dict(style='water',col='#3FA9D8',tile=4.0)}
objs_tex=[bpy.data.objects[n] for n in PLANET_OBJS if bpy.data.objects[n].type=='MESH' and not n.startswith('bloqueio_')]
rules,cells,apath=auto_rules(objs_tex,atlas_name="planeta_atlas",size=1024,keep=tuple(REP.keys()))
for i,(nm,sp) in enumerate(REP.items()):
    rules[nm]=dict(mode='repeat',tile=sp['tile'],img=make_tile("planeta_"+nm.lower(),sp,size=1024,seed=10+i),to=nm)
for o in objs_tex: texture_object(o,rules,cells,apath)
