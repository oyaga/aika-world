
import bpy, bmesh, math, os, json, struct
from mathutils import Vector, Matrix, Euler
BASE = os.path.join(os.path.expanduser("~"), "Documents", "AikaWorld", "v2")

def clear():
    for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
    for coll in (bpy.data.meshes, bpy.data.materials, bpy.data.armatures, bpy.data.actions, bpy.data.cameras, bpy.data.lights, bpy.data.curves):
        for d in list(coll): coll.remove(d)
    for c in list(bpy.data.collections): bpy.data.collections.remove(c)
    for l in list(bpy.data.libraries): bpy.data.libraries.remove(l)
    for im in list(bpy.data.images):
        if im.name not in ('Render Result','Viewer Node'): bpy.data.images.remove(im)

def hex2rgba(h):
    h=h.lstrip('#'); c=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    lin=[x/12.92 if x<=0.04045 else ((x+0.055)/1.055)**2.4 for x in c]
    return (*lin,1.0)

def mat(name, hexcol, emit=False):
    m=bpy.data.materials.get(name)
    if m: return m
    m=bpy.data.materials.new(name); m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    col=hex2rgba(hexcol)
    p.inputs["Base Color"].default_value=col
    p.inputs["Roughness"].default_value=1.0
    if emit:
        p.inputs["Emission Color"].default_value=col
        p.inputs["Emission Strength"].default_value=1.0
    m.diffuse_color=col
    return m

def setmat(o, m):
    o.data.materials.clear(); o.data.materials.append(m)

def prim(kind, name, loc=(0,0,0), scale=(1,1,1), rot=(0,0,0), m=None, **kw):
    ops={'cube':bpy.ops.mesh.primitive_cube_add,'cyl':bpy.ops.mesh.primitive_cylinder_add,
         'cone':bpy.ops.mesh.primitive_cone_add,'ico':bpy.ops.mesh.primitive_ico_sphere_add,
         'uv':bpy.ops.mesh.primitive_uv_sphere_add,'torus':bpy.ops.mesh.primitive_torus_add}
    ops[kind](location=loc, rotation=rot, **kw)
    o=bpy.context.active_object; o.name=name; o.scale=scale
    if m: setmat(o,m)
    for p in o.data.polygons: p.use_smooth=False
    return o

def apply_all(objs):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)

def tris(objs):
    dg=bpy.context.evaluated_depsgraph_get(); n=0
    for o in objs:
        if o.type!='MESH': continue
        me=o.evaluated_get(dg).to_mesh(); me.calc_loop_triangles(); n+=len(me.loop_triangles); o.evaluated_get(dg).to_mesh_clear()
    return n

def export(name, objs, anim=False, extras=False):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    path=os.path.join(BASE, name+".glb")
    kw=dict(filepath=path, export_format='GLB', use_selection=True, export_yup=True, export_apply=True,
            export_extras=extras, export_cameras=False, export_lights=False, export_animations=anim)
    if anim: kw.update(export_animation_mode='ACTIONS', export_force_sampling=True)
    kw.update(export_draco_mesh_compression_enable=True, export_draco_mesh_compression_level=6, export_image_format='AUTO')
    if anim: kw.update(export_skins=True)
    bpy.ops.export_scene.gltf(**kw)
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BASE, name+".blend"))
    return path, os.path.getsize(path)

def glb_json(path):
    with open(path,'rb') as f: data=f.read()
    ln=struct.unpack('<I', data[12:16])[0]
    return json.loads(data[20:20+ln])
