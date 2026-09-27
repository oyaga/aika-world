STYLE.update({"Pele":dict(style='skin',mode='fit'),"Olho":dict(style='flat'),"Branco":dict(style='cloth'),"Cabelo":dict(style='hair',mode='fit'),
 "Vinho":dict(style='sign',fg='#F2EEE2',n=2,border=False,mode='fit'),"Escuro":dict(style='cloth'),"Mostarda":dict(style='cloth'),
 "Cima@tint":dict(style='light',tile=0.6),"Baixo@tint":dict(style='light',tile=0.6),"Pes@tint":dict(style='light',tile=0.3,seam=False)})
VIS=[o for o in bpy.data.objects if o.type=='MESH']
texture_all(VIS,atlas_name="visitante_atlas",size=2048)
