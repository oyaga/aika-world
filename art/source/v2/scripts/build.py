
import shutil, time, os
V2=os.path.join(os.path.expanduser('~'),'Documents','AikaWorld','v2')
def _x(*files):
    for f in files: exec(open(os.path.join(V2,f)).read(), globals())
LIBS=("_helpers.py","_geo.py","_paint.py","_texmap.py","_show.py","_vitrine.py","_rig3.py","_anim3.py","_chars.py")
_x(*LIBS)
REN=os.path.join(V2,"renders")
def _shot(name,loc,tgt,lens=42,res=800,up=(0,0,1)):
    p=shot("_r",loc,tgt,lens=lens,res=res,up=up); shutil.copy(p,os.path.join(REN,name+".png"))
def _char_renders(name,rig,acts):
    sc=bpy.context.scene; g=floor_disc(2.0,"#9C9A8E"); vitrine_setup(bg="#8FD8CF",emit=3.0)
    for tag,act,fr,loc,tgt in [("frente","Idle",1,(0.3,-5.2,1.35),(0,0,1.03)),("34","Idle",49,(3.2,-3.9,1.5),(0,0,1.03)),("costas","Idle",1,(-1.2,5.0,1.4),(0,0,1.0))]+acts:
        rig.animation_data.action=bpy.data.actions[act]; sc.frame_set(fr); _shot(name+"_"+tag,loc,tgt)
    rig.animation_data.action=bpy.data.actions["Idle"]; sc.frame_set(1)
    bpy.data.objects.remove(g,do_unlink=True); showcase_teardown()
POSES=[("walk","Walk",7,(4.6,-1.4,1.2),(0,0,0.95)),("run","Run",1,(4.6,-1.4,1.2),(0,0,0.95)),("jump","Jump",7,(3.5,-3.5,1.4),(0,0,1.0)),("swim","Swim",9,(3.5,-3.2,1.3),(0,-0.3,0.2)),("wave","Wave",7,(1.8,-4.4,1.4),(0,0,1.1))]
def B_templo(render=True):
    _x("_templo2.py","_templo2_tex.py"); T=bpy.data.objects["templo"]
    r=export("templo",[T])
    if render:
        g=floor_disc(7.5,"#6FAF6A"); vitrine_setup(bg="#2A2F5A",emit=4.0)
        for tag,loc in (("frente",(0,-15,4.2)),("34",(10,-11,6.5)),("costas",(-8,10,5.5))): _shot("templo_"+tag,loc,(0,-1.2,2.8),40)
        bpy.data.objects.remove(g,do_unlink=True); showcase_teardown()
    return r
def B_planeta():
    global make_tile
    _mt=make_tile
    def make_tile(name,spec,size=1024,seed=3):
        pth=os.path.join(TEX,name+".jpg"); return pth if os.path.exists(pth) else _mt(name,spec,size,seed)
    _x("_planeta2.py"); globals()['PLANET_OBJS']=PLANET_OBJS; _x("_planeta2_tex.py")
    return export("planeta",[bpy.data.objects[n] for n in PLANET_OBJS],extras=True)
def B_visitante(render=True):
    _x("_visitante.py","_visitante_tex.py")
    objs=[o for o in bpy.data.objects if o.type in ('MESH','ARMATURE')]
    r=export("visitante",objs,anim=True,extras=True)
    return r
def B_aika(render=True):
    _x("_aika2.py","_aika2_tex.py"); objs=[o for o in bpy.data.objects if o.type in ('MESH','ARMATURE')]
    r=export("aika",objs,anim=True)
    if render: _char_renders("aika",bpy.data.objects["aika_rig"],POSES)
    return r
def B_felipe(render=True):
    _x("_felipe2.py","_felipe2_tex.py"); objs=[o for o in bpy.data.objects if o.type in ('MESH','ARMATURE')]
    r=export("felipe",objs,anim=True)
    if render: _char_renders("felipe",bpy.data.objects["felipe_rig"],[("talk","Talk",13,(1.6,-4.6,1.4),(0,0,1.05)),("wave","Wave",7,(1.6,-4.6,1.4),(0,0,1.1))])
    return r
def B_npc(slug,render=True):
    _x("_npcs.py"); objs=npc(slug); _x("_npcs_tex.py")
    texture_all([o for o in objs if o.type=='MESH'],atlas_name="npc_"+slug+"_atlas",size=1024,seed=sum(map(ord,slug))%97)
    nm="npc" if slug=="generico" else "npc_"+slug
    r=export(nm,objs,anim=True)
    if render: _char_renders(nm,[o for o in objs if o.type=='ARMATURE'][0],[("talk","Talk",13,(1.6,-4.6,1.4),(0,0,1.05)),("wave","Wave",7,(1.6,-4.6,1.4),(0,0,1.1))])
    return r
def B_predio(slug,render=True):
    _x("_predios.py"); o=predio(slug); _x("_predios_tex.py")
    texture_all([o],atlas_name=o.name+"_atlas",size=1024,seed=sum(map(ord,slug))%89)
    r=export(o.name,[o])
    if render:
        g=floor_disc(4.0,"#B9B6A8"); vitrine_setup(bg="#8FD8CF",emit=3.0)
        for tag,loc in (("frente",(0.4,-9.5,2.6)),("34",(6.0,-7.0,4.2)),("costas",(-5.0,6.5,3.8))): _shot(o.name+"_"+tag,loc,(0,-0.3,1.9),40,700)
        bpy.data.objects.remove(g,do_unlink=True); showcase_teardown()
    return r
def B_cc(which,render=True):
    _x("_correio_casa.py"); o=correio() if which=="correio" else casa(); _x("_correio_casa_tex.py")
    texture_all([o],atlas_name=o.name+"_atlas",size=512 if which=="correio" else 1024,seed=7)
    r=export(o.name,[o])
    if render:
        g=floor_disc(2.5,"#9C9A8E"); vitrine_setup(bg="#8FD8CF",emit=3.0)
        c=(0,0,0.75) if which=="correio" else (0,-0.2,1.5); d=3.2 if which=="correio" else 7.5
        for tag,loc in (("frente",(0.2,-d,c[2]+0.4)),("34",(d*0.7,-d*0.7,c[2]+1.2)),("costas",(-d*0.6,d*0.8,c[2]+1.0))): _shot(o.name+"_"+tag,loc,c,40,700)
        bpy.data.objects.remove(g,do_unlink=True); showcase_teardown()
    return r
