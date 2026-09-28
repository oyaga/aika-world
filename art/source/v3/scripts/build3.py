
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
    load_char_libs(1.0); _x2("_visitante.py"); smooth_skin(_char_objs()); _x2("_visitante_tex.py")
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
