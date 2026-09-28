
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
