
def showcase_setup(emit=4.0):
    sc=bpy.context.scene
    sc.render.engine='BLENDER_EEVEE'
    w=sc.world or bpy.data.worlds.new("World"); sc.world=w; w.use_nodes=True
    nt=w.node_tree; nt.nodes.clear()
    o=nt.nodes.new("ShaderNodeOutputWorld"); mx=nt.nodes.new("ShaderNodeMixShader"); lp=nt.nodes.new("ShaderNodeLightPath")
    b1=nt.nodes.new("ShaderNodeBackground"); b2=nt.nodes.new("ShaderNodeBackground")
    b1.inputs[0].default_value=hex2rgba("#7A78B8"); b1.inputs[1].default_value=0.9
    b2.inputs[0].default_value=hex2rgba("#1B1733"); b2.inputs[1].default_value=1.0
    nt.links.new(lp.outputs["Is Camera Ray"],mx.inputs[0]); nt.links.new(b1.outputs[0],mx.inputs[1]); nt.links.new(b2.outputs[0],mx.inputs[2]); nt.links.new(mx.outputs[0],o.inputs[0])
    sc.view_settings.view_transform='Standard'; sc.view_settings.look='AgX - Punchy' if 'AgX - Punchy' in [i.identifier for i in bpy.types.ColorManagedViewSettings.bl_rna.properties['look'].enum_items_static] else 'None'
    for n in ("_sun","_fill"):
        o=bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o,do_unlink=True)
    sun=bpy.data.objects.new("_sun",bpy.data.lights.new("_sun",'SUN')); sc.collection.objects.link(sun)
    sun.data.energy=3.2; sun.data.color=(0.85,0.85,1.0); sun.rotation_euler=(math.radians(50),0,math.radians(-35))
    fill=bpy.data.objects.new("_fill",bpy.data.lights.new("_fill",'SUN')); sc.collection.objects.link(fill)
    fill.data.energy=1.2; fill.data.color=(1.0,0.55,0.3); fill.rotation_euler=(math.radians(60),0,math.radians(150))
    for m in bpy.data.materials:
        if m.name.endswith("@unlit") and m.use_nodes:
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value=emit
    ng=bpy.data.node_groups.get("_comp") or bpy.data.node_groups.new("_comp","CompositorNodeTree")
    ng.nodes.clear()
    if not any(i.name=="Image" for i in ng.interface.items_tree):
        ng.interface.new_socket("Image",in_out='OUTPUT',socket_type='NodeSocketColor')
    rl=ng.nodes.new("CompositorNodeRLayers"); gl=ng.nodes.new("CompositorNodeGlare"); out=ng.nodes.new("NodeGroupOutput")
    try:
        gl.inputs["Type"].default_value='Bloom'
    except Exception:
        try: gl.glare_type='BLOOM'
        except Exception: pass
    for k,v in (("Threshold",0.9),("Strength",0.9),("Size",0.6)):
        if k in gl.inputs:
            try: gl.inputs[k].default_value=v
            except Exception: pass
    ng.links.new(rl.outputs["Image"],gl.inputs["Image"]); ng.links.new(gl.outputs["Image"],out.inputs[0])
    sc.compositing_node_group=ng
    sc.render.use_compositing=True
def showcase_teardown():
    for n in ("_sun","_fill","_cam"):
        o=bpy.data.objects.get(n)
        if o: bpy.data.objects.remove(o,do_unlink=True)
    for m in bpy.data.materials:
        if m.name.endswith("@unlit") and m.use_nodes:
            m.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value=1.0
    bpy.context.scene.compositing_node_group=None
def shot(nm, loc, tgt, lens=50, res=900, ortho=None, up=(0,0,1)):
    sc=bpy.context.scene
    cam=bpy.data.objects.get("_cam") or bpy.data.objects.new("_cam", bpy.data.cameras.new("_cam"))
    if cam.name not in sc.collection.objects: sc.collection.objects.link(cam)
    cam.location=loc; cam.data.lens=lens; cam.data.clip_end=500; cam.data.clip_start=0.05
    if ortho: cam.data.type='ORTHO'; cam.data.ortho_scale=ortho
    else: cam.data.type='PERSP'
    f=(Vector(tgt)-Vector(loc)).normalized(); r=f.cross(Vector(up)).normalized(); u=r.cross(f)
    cam.matrix_world=Matrix((r,u,-f)).transposed().to_4x4(); cam.location=loc; sc.camera=cam
    sc.render.resolution_x=res; sc.render.resolution_y=res; sc.render.film_transparent=False
    p=os.path.join(BASE,"_preview",nm+".png"); sc.render.filepath=p; bpy.ops.render.render(write_still=True)
    return p
