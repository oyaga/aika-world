STYLE.update({"PeloEscuro":dict(style='hair',mode='fit'),"Pelo":dict(style='hair',mode='fit'),"PeloBranco":dict(style='hair',col='#F4F1EC',mode='fit'),"PeloCreme":dict(style='hair',mode='fit'),
 "Moletom":dict(style='cloth',tile=0.5),"MoletomSombra":dict(style='cloth',tile=0.5),"Jeans":dict(style='cloth',tile=0.4),"JeansClaro":dict(style='cloth'),"Rosa":dict(style='cloth',tile=0.3),"RosaEscuro":dict(style='flat'),"Branco":dict(style='cloth')})
texture_all([o for o in bpy.data.objects if o.type=='MESH'],atlas_name="aika_atlas",size=1024)
