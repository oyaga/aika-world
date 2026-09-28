
# Prévia noturna: planeta + templo no Empty poi_templo, bloom e emissivos fortes.
import bpy, os, math
from mathutils import Vector, Matrix
H=os.path.join(os.path.expanduser('~'),'Documents','AikaWorld')
def night_setup(emit=6.0, amb=0.35):
    sc=bpy.context.scene; sc.render.engine='BLENDER_EEVEE'
    w=sc.world or bpy.data.worlds.new("World"); sc.world=w; w.use_nodes=True
    nt=w.node_tree; nt.nodes.clear()
    o=nt.nodes.new("ShaderNodeOutputWorld"); mx=nt.nodes.new("ShaderNodeMixShader"); lp=nt.nodes.new("ShaderNodeLightPath")
    b1=nt.nodes.new("ShaderNodeBackground"); b2=nt.nodes.new("ShaderNodeBackground")
    b1.inputs[0].default_value=hex2rgba("#4A4F9A"); b1.inputs[1].default_value=amb
    b2.inputs[0].default_value=hex2rgba("#15123A"); b2.inputs[1].default_value=1.0
    nt.links.new(lp.outputs["Is Camera Ray"],mx.inputs[0]); nt.links.new(b1.outputs[0],mx.inputs[1]); nt.links.new(b2.outputs[0],mx.inputs[2]); nt.links.new(mx.outputs[0],o.inputs[0])
    sc.view_settings.view_transform='Standard'
    for n in ("_sun","_fill"):
        ob=bpy.data.objects.get(n)
        if ob: bpy.data.objects.remove(ob,do_unlink=True)
    return sc
def lights_toward(n, f):
    sc=bpy.context.scene
    for nm,energy,col,d in (("_sun",1.6,(0.55,0.6,1.0),n+f*0.6+f.cross(n)*0.8),("_fill",0.7,(1.0,0.55,0.3),n-f*0.4-f.cross(n)*0.9)):
        L=bpy.data.objects.new(nm,bpy.data.lights.new(nm,'SUN')); sc.collection.objects.link(L)
        L.data.energy=energy; L.data.color=col
        L.rotation_euler=(-d).to_track_quat('-Z','Y').to_euler()
def glow(emit):
    for m in bpy.data.materials:
        if m.name.endswith("@unlit") and m.use_nodes:
            p=m.node_tree.nodes.get("Principled BSDF")
            if p: p.inputs["Emission Strength"].default_value=emit
def bloom():
    sc=bpy.context.scene
    ng=bpy.data.node_groups.get("_comp3") or bpy.data.node_groups.new("_comp3","CompositorNodeTree")
    ng.nodes.clear()
    if not any(i.name=="Image" for i in ng.interface.items_tree):
        ng.interface.new_socket("Image",in_out='OUTPUT',socket_type='NodeSocketColor')
    rl=ng.nodes.new("CompositorNodeRLayers"); gl=ng.nodes.new("CompositorNodeGlare"); out=ng.nodes.new("NodeGroupOutput")
    try: gl.inputs["Type"].default_value='Bloom'
    except Exception: pass
    for k,v in (("Threshold",1.0),("Strength",1.1),("Size",0.7)):
        if k in gl.inputs:
            try: gl.inputs[k].default_value=v
            except Exception: pass
    ng.links.new(rl.outputs["Image"],gl.inputs["Image"]); ng.links.new(gl.outputs["Image"],out.inputs[0])
    sc.compositing_node_group=ng; sc.render.use_compositing=True
def place_temple(path):
    old=bpy.data.objects.get("templo")
    if old: bpy.data.objects.remove(old,do_unlink=True)
    before=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=path)
    new=[o for o in bpy.data.objects if o not in before]
    e=bpy.data.objects["poi_templo"]
    for o in new:
        if o.parent is None: o.matrix_world=e.matrix_world @ o.matrix_world
    return new
def cam_shot(name, n, f, back=26, up=24, tgt_scale=0.55, lens=50, res=900):
    R=20.0
    loc=n*(R+up)+f*back; tgt=n*R*tgt_scale
    return _shot(name, tuple(loc), tuple(tgt), lens, res, up=tuple(n))
