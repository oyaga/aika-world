STYLE.update({"Cabelo":dict(style='hair',mode='fit'),"CabeloBrilho":dict(style='hair',mode='fit'),"Camiseta":dict(style='cloth',tile=0.5),
 "Estampa":dict(style='sign',fg='#FF5A02',n=2,border=False,mode='fit'),"Laranja":dict(style='flat'),"Bermuda":dict(style='cloth',tile=0.5),"Branco":dict(style='cloth'),"Tenis":dict(style='cloth',tile=0.3),
 "Pele_EFC4A4":dict(style='skin',mode='fit')})
texture_all([o for o in bpy.data.objects if o.type=='MESH'],atlas_name="felipe_atlas",size=1024)
