
import shutil, os
V2=os.path.join(os.path.expanduser('~'),'Documents','AikaWorld','v2')
V3=os.path.join(os.path.expanduser('~'),'Documents','AikaWorld','v3')
def _x2(*files):
    for f in files: exec(open(os.path.join(V2,f),encoding='utf-8').read(), globals())
def _x3(*files):
    for f in files: exec(open(os.path.join(V3,f),encoding='utf-8').read(), globals())
_x2("_helpers.py")
BASE=V3
_x2("_geo.py"); _x3("_paint.py"); _x2("_texmap.py","_show.py","_vitrine.py")
os.makedirs(os.path.join(V3,"tex"),exist_ok=True); os.makedirs(os.path.join(V3,"_preview"),exist_ok=True); os.makedirs(os.path.join(V3,"renders"),exist_ok=True)
REN=os.path.join(V3,"renders")
def _shot(name,loc,tgt,lens=42,res=800,up=(0,0,1)):
    p=shot("_r",loc,tgt,lens=lens,res=res,up=up); shutil.copy(p,os.path.join(REN,name+".png")); return os.path.join(REN,name+".png")
def P3_geo():
    exec(open(os.path.join(V3,"_mk_planeta3.py"),encoding='utf-8').read(), {})
    _x3("_planeta3.py"); globals()['PLANET_OBJS']=PLANET_OBJS
def P3_tex():
    _x3("_planeta3_tex.py")
def P3_export():
    return export("planeta",[bpy.data.objects[n] for n in PLANET_OBJS],extras=True)
def T3():
    _x3("_templo3.py","_templo3_tex.py")
    return export("templo",[bpy.data.objects["templo"]])

# ---- builds dos personagens chibi (acrescentado ao _build3.py) ----
def load_char_libs(u=1.0):
    _x2("_rig3.py")
    src=open(os.path.join(V2,"_anim3.py"),encoding='utf-8').read()
    a="Matrix.Translation((0,0.9,0.85))"; b="            if 'loc' in v: P[n].location=v['loc']"
    assert src.count(a)==1 and src.count(b)==1
    src=src.replace(a,"Matrix.Translation((0,0.9*CHIBI['sb']*CHIBI['u'],0.95*CHIBI['u']))")
    src=src.replace(b,"            if 'loc' in v: P[n].location=Vector(v['loc'])*(CHIBI['sb']*CHIBI['u'])")
    exec(src, globals())
    _x2("_chars.py")
    _x3("_chibi3.py")
    CHIBI['u']=u
def _char_objs():
    return [o for o in bpy.data.objects if o.type in ('MESH','ARMATURE')]
def C3_visitante():
    load_char_libs(1.0)
    src=open(os.path.join(V2,"_visitante.py"),encoding="utf-8").read()
    old="""    ell('olho',(0.066*s,-0.152,HC-0.005),(0.036,0.012,0.05),OL,['head'],10,6)
    ell('olho_brilho',(0.056*s,-0.162,HC+0.015),(0.011,0.005,0.013),BR,['head'],6,4)
    box('sobrancelha',(0.068*s,-0.158,HC+0.07),(0.032,0.006,0.007),OL,['head'],rot=(0,-0.15*s,0))
"""
    assert src.count(old)==1
    src=src.replace(old,"").replace("spike('nariz',(0,-0.165,HC-0.035)","anime_eyes(['head'],'#6B4430',brow=CB)\nspike('nariz',(0,-0.165,HC-0.035)",1)
    exec(src,globals()); smooth_skin(_char_objs()); _x2("_visitante_tex.py")
    return export("visitante",_char_objs(),anim=True,extras=True)
def C3_aika():
    load_char_libs(0.51); _x2("_aika2.py"); smooth_skin(_char_objs()); _x2("_aika2_tex.py")
    return export("aika",_char_objs(),anim=True)
def C3_felipe():
    load_char_libs(1.0); _x2("_felipe2.py"); smooth_skin(_char_objs()); _x2("_felipe2_tex.py")
    return export("felipe",_char_objs(),anim=True)
def C3_npc(slug):
    load_char_libs(1.0); _x2("_npcs.py"); objs=npc(slug); smooth_skin(objs); _x2("_npcs_tex.py")
    texture_all([o for o in objs if o.type=='MESH'],atlas_name="npc3_"+slug+"_atlas",size=1024,seed=sum(map(ord,slug))%97)
    nm="npc" if slug=="generico" else "npc_"+slug
    return export(nm,objs,anim=True)
def char_shots(prefix, rig, tgt_z, dist, acts=(("frente","Idle",1),)):
    sc=bpy.context.scene; showcase_setup(emit=3.0); out=[]
    for tag,act,fr in acts:
        if act in bpy.data.actions:
            rig.animation_data.action=bpy.data.actions[act]
            try:
                if bpy.data.actions[act].slots: rig.animation_data.action_slot=bpy.data.actions[act].slots[0]
            except Exception: pass
            sc.frame_set(fr)
        loc=(dist*0.35,-dist,tgt_z*1.15) if tag!="costas" else (-dist*0.3,dist,tgt_z*1.1)
        out.append(_shot(prefix+"_"+tag,loc,(0,0,tgt_z),40,520))
    showcase_teardown(); return out

# ---- prédios da praça, casa e correio no estilo V3 (acrescentado ao _build3.py) ----
V3_PALETTE=(('"Concreto","#9C9A8E"','"Concreto","#7C7888"'),('"Metal","#B9B6A8"','"Metal","#8E8A9C"'),
            ('"Madeira","#8A5A3B"','"Madeira","#5A3A2A"'))
def _v3_src(fname):
    s=open(os.path.join(V2,fname),encoding='utf-8').read()
    for a,b in V3_PALETTE: s=s.replace(a,b)
    return s
def _trim_join(o, bars):
    """junta frisos (lista de objetos) ao objeto principal."""
    bpy.ops.object.select_all(action='DESELECT')
    for b in bars:
        b.select_set(True)
        bpy.context.view_layer.objects.active=b
        bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    o.select_set(True); bpy.context.view_layer.objects.active=o
    bpy.ops.object.join()
    for p in o.data.polygons: p.use_smooth=False
    return o
def C3_predio(slug):
    exec(_v3_src("_predios.py"),globals())
    o=predio(slug)
    bpy.context.view_layer.update()
    W,F,PB=1.5,-1.3,3.62   # meia-largura, frente e altura da platibanda (ver _predios.py)
    NE=mat("Brilho@unlit","#FF5A02",emit=True); CY=mat("Ciano@unlit","#5CE1E6",emit=True)
    bars=[prim('cube','friso_topo',loc=(0,F-0.05-0.014,PB),scale=(W+0.06,0.012,0.022),m=NE)]
    for sx in (-1,1):
        bars.append(prim('cube','friso_quina',loc=(sx*(W+0.012),F-0.012,1.83),scale=(0.012,0.012,1.68),m=CY))
        bars.append(prim('cube','friso_lado',loc=(sx*(W+0.05+0.014),0,PB),scale=(0.012,1.36,0.022),m=NE))
    _trim_join(o,bars)
    _x2("_predios_tex.py")
    texture_all([o],atlas_name=o.name+"3_atlas",size=1024,seed=sum(map(ord,slug))%89)
    return export(o.name,[o])
def C3_cc(which):
    exec(_v3_src("_correio_casa.py"),globals())
    o=correio() if which=="correio" else casa()
    if which=="casa":
        bpy.context.view_layer.update()
        xs=[v.co.x for v in o.data.vertices]; ys=[v.co.y for v in o.data.vertices]
        CY=mat("Ciano@unlit","#5CE1E6",emit=True)
        x0,x1=min(xs),max(xs); y0=-1.15; y1=1.15
        bars=[prim('cube','rodape',loc=(0,y0-0.02,0.1),scale=(1.2,0.012,0.015),m=CY),
              prim('cube','rodape',loc=(0,y1+0.02,0.1),scale=(1.2,0.012,0.015),m=CY)]
        for sx in (-1,1): bars.append(prim('cube','rodape',loc=(sx*1.22,0,0.1),scale=(0.012,1.15,0.015),m=CY))
        _trim_join(o,bars)
    _x2("_correio_casa_tex.py")
    texture_all([o],atlas_name=o.name+"3_atlas",size=512 if which=="correio" else 1024,seed=7)
    return export(o.name,[o])
def prop_shot(name,obj_center_z,dist):
    showcase_setup(emit=3.0); bpy.context.scene.eevee.taa_render_samples=4
    p=_shot(name,(dist*0.7,-dist*0.75,obj_center_z*1.4),(0,0,obj_center_z),40,520)
    showcase_teardown(); return p
