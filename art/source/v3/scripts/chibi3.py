
# ---- Personagens chibi V3 ----
# Deforma as peças (antes do rig) para ~2,5 cabeças: cabeça maior, corpo curto e largo.
# O esqueleto, os alvos de IK (solve_arm) e as translações das animações passam pela mesma
# deformação, então pesos, guarda-roupa e animações da v2 continuam valendo.
import math
from mathutils import Vector
CHIBI=dict(neck=1.56, a=1.50, b=1.62, kh=1.55, sb=0.60, wb=0.82, u=1.0, drop=0.06)
def _sm(x):
    x=max(0.0,min(1.0,x)); return x*x*(3-2*x)
def W(p):
    p=Vector(p); c=CHIBI
    body=Vector((p.x*c['wb'], p.y*c['wb'], p.z*c['sb']))
    q=(p-Vector((0,0,c['neck'])))*c['kh']
    head=Vector((q.x, q.y, q.z+c['neck']*c['sb']-c['drop']))   # quase sem pescoço
    t=_sm((p.z-c['a'])/(c['b']-c['a']))
    return body.lerp(head,t)*c['u']
EYE_NAMES={'olho','olho_brilho','esclera','iris','pupila','brilho','cilio','sobrancelha'}
HEAD_NAMES=('cabeca','cranio')
def _base(n): return n.split('.')[0]
def _add_blush():
    for pname,items in list(PIECES.items()):
        heads=[o for o,_ in items if _base(o.name) in HEAD_NAMES]
        if not heads: continue
        h=heads[0]; z=h.location.z; BL=mat("Bochecha","#F59AA8")
        prev=CUR[0]; CUR[0]=pname
        for s in (1,-1): ell('bochecha_cor',(0.105*s,-0.14,z-0.065),(0.03,0.008,0.017),BL,['head'],10,6)
        CUR[0]=prev
def chibify_pieces():
    _add_blush()
    objs=[o for items in PIECES.values() for o,_ in items]
    bpy.context.view_layer.update()
    for o in objs:
        b=_base(o.name)
        if b in EYE_NAMES:
            o.scale=o.scale*1.25; o.location.x*=1.06
            if b=='sobrancelha':   # mais fina e com a ponta de dentro levantada (expressão simpática)
                o.scale.z*=0.5; o.location.z+=0.012; o.rotation_euler.y*=-0.5
            if b=='cilio': o.scale.z*=0.55
        elif b=='nariz' and o.location.z>1.5:      # nariz humano pequeno (o focinho da Aika é outro)
            o.scale=o.scale*0.5; o.location.y+=0.012
        elif b=='queixo':                           # rosto redondo
            o.scale.z*=0.72; o.location.z+=0.03; o.scale.x*=1.05
    for o in objs:
        bpy.context.view_layer.objects.active=o
        for mo in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=mo.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    for o in objs:
        for v in o.data.vertices: v.co=W(v.co)
        o.data.update()
_orig_make_rig3=make_rig3
_orig_solve_arm=solve_arm
def make_rig3(name, J, extra=()):
    chibify_pieces()
    J2={}
    for k,v in J.items():
        if isinstance(v,(tuple,list)): p=W((v[0],0,v[1])); J2[k]=(p.x,p.z)
        elif k=='leg_x': J2[k]=v*CHIBI['wb']*CHIBI['u']
        else: J2[k]=W((0,0,v)).z
    ex=[(e[0],tuple(W(e[1])),tuple(W(e[2])))+tuple(e[3:]) for e in extra]
    return _orig_make_rig3(name,J2,ex)
def solve_arm(arm, side, elbow_t, hand_t, step=4):
    return _orig_solve_arm(arm,side,tuple(W(elbow_t)),tuple(W(hand_t)),step)

SMOOTH_MATS=('Pele','OlhoBranco','Iris','Olho','Bochecha','Pelo','Mascara','Boca','Nariz','OrelhaInterna')
def smooth_skin(objs):
    """Pele, pelagem e olhos com sombreamento suave; cabelo e roupas continuam facetados."""
    for o in objs:
        if o.type!='MESH': continue
        mats=[m.name if m else '' for m in o.data.materials]
        for p in o.data.polygons:
            n=mats[p.material_index] if p.material_index<len(mats) else ''
            if n.startswith(SMOOTH_MATS): p.use_smooth=True
