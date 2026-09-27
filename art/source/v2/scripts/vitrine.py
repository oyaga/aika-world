
def vitrine_setup(bg="#8FD8CF", emit=3.0):
    showcase_setup(emit=emit)
    nt=bpy.context.scene.world.node_tree
    for n in nt.nodes:
        if n.type=='BACKGROUND':
            if n.inputs[1].default_value==1.0: n.inputs[0].default_value=hex2rgba(bg)
            else: n.inputs[0].default_value=hex2rgba("#B8E6DE"); n.inputs[1].default_value=1.1
    bpy.data.objects["_sun"].data.energy=3.5; bpy.data.objects["_sun"].data.color=(1,0.97,0.92)
    bpy.data.objects["_fill"].data.energy=0.6; bpy.data.objects["_fill"].data.color=(0.6,0.9,0.9)
def vit_shots(arm, specs, res=440, prefix="v"):
    out={}
    for nm,act,f,loc,tgt,lens in specs:
        if arm is not None and act: arm.animation_data.action=bpy.data.actions[act]
        bpy.context.scene.frame_set(int(f))
        out[nm]=base64.b64encode(open(shot(prefix+"_"+nm,loc,tgt,lens=lens,res=res),'rb').read()).decode()
    return out
def floor_disc(r=2.0,col="#9C9A8E"):
    bpy.ops.mesh.primitive_cylinder_add(radius=r,depth=0.1,location=(0,0,-0.05),vertices=32); g=bpy.context.active_object; g.name="_chao"; setmat(g,mat("_Chao",col)); return g

def peek(path, q=70, maxw=560):
    import base64
    img=bpy.data.images.load(path)
    w,h=img.size
    if w>maxw: img.scale(maxw,int(h*maxw/w))
    out=path[:-4]+"_peek.jpg"; img.filepath_raw=out; img.file_format='JPEG'
    sc=bpy.context.scene; old=sc.render.image_settings.quality; sc.render.image_settings.quality=q
    img.save(); sc.render.image_settings.quality=old; bpy.data.images.remove(img)
    return base64.b64encode(open(out,'rb').read()).decode()
