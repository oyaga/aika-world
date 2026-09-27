
# ---------- peças com pesos suaves ----------
PIECES={}   # nome da peça -> lista de (obj, bones permitidos)
CUR=[None]
def piece(name): CUR[0]=name; PIECES.setdefault(name,[])
def add(o, bones):
    PIECES[CUR[0]].append((o, bones if isinstance(bones,(list,tuple)) else [bones])); return o
def orient(o, d):
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(d).normalized())
def cyl(n,a,b,r,m,bones,verts=10,r2=None,cap=True):
    a=Vector(a); b=Vector(b); d=b-a
    if r2 is None: o=prim('cyl',n,loc=(a+b)/2,m=m,radius=r,depth=d.length,vertices=verts)
    else: o=prim('cone',n,loc=(a+b)/2,m=m,radius1=r,radius2=r2,depth=d.length,vertices=verts)
    orient(o,d); return add(o,bones)
def ell(n,c,s,m,bones,seg=12,ring=8,rot=(0,0,0)):
    return add(prim('uv',n,loc=c,scale=s,rot=rot,m=m,radius=1,segments=seg,ring_count=ring),bones)
def ellab(n,a,b,rx,ry,m,bones,seg=10,ring=6):
    a=Vector(a); b=Vector(b); d=b-a
    o=prim('uv',n,loc=(a+b)/2,m=m,radius=1,segments=seg,ring_count=ring); o.scale=(rx,ry,d.length/2); orient(o,d); return add(o,bones)
def box(n,c,s,m,bones,rot=(0,0,0),bevel=0):
    o=add(prim('cube',n,loc=c,scale=s,rot=rot,m=m),bones)
    if bevel:
        mo=o.modifiers.new("b",'BEVEL'); mo.width=bevel; mo.segments=1
    return o
def spike(n,base,tip,r,m,bones,flat=0.55,verts=4):
    base=Vector(base); tip=Vector(tip); d=tip-base
    o=prim('cone',n,loc=base+d/2,m=m,radius1=r,radius2=0.0,depth=d.length,vertices=verts)
    o.scale=(1,flat,1); orient(o,d); return add(o,bones)

def seg_dist(p,a,b):
    ab=b-a; t=max(0,min(1,(p-a).dot(ab)/max(ab.length_squared,1e-9))); return (a+t*ab-p).length
def build_piece(name, arm, subdiv=0):
    """junta as sub-partes da peça, aplica transformações e calcula pesos suaves."""
    items=PIECES[name]; objs=[o for o,_ in items]
    bpy.context.view_layer.update()
    B={b.name:(arm.matrix_world@b.head_local, arm.matrix_world@b.tail_local) for b in arm.data.bones}
    for o,bones in items:
        bpy.context.view_layer.objects.active=o
        for mo in list(o.modifiers): bpy.ops.object.modifier_apply(modifier=mo.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs: o.select_set(True)
    bpy.context.view_layer.objects.active=objs[0]
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    # pesos por sub-parte
    for o,bones in items:
        vgs={bn:o.vertex_groups.new(name=bn) for bn in bones}
        for v in o.data.vertices:
            p=v.co; ws=[]
            for bn in bones:
                a,b=B[bn]; d=seg_dist(p,a,b); ws.append((bn,1.0/(d+0.015)**4))
            ws.sort(key=lambda x:-x[1]); ws=ws[:2]; tot=sum(w for _,w in ws)
            for bn,w in ws: vgs[bn].add([v.index],w/tot,'REPLACE')
    bpy.ops.object.join()
    o=bpy.context.active_object; o.name=name; o.data.name=name
    for p in o.data.polygons: p.use_smooth=False
    o.parent=arm; mo=o.modifiers.new("Armature",'ARMATURE'); mo.object=arm
    return o

def make_rig3(name, J, extra=()):
    bpy.ops.object.armature_add(location=(0,0,0))
    arm=bpy.context.active_object; arm.name=name; arm.data.name=name
    bpy.ops.object.mode_set(mode='EDIT')
    eb=arm.data.edit_bones; eb.remove(eb[0])
    def bone(n,h,t,p=None):
        b=eb.new(n); b.head=h; b.tail=t; b.roll=0
        if p: b.parent=eb[p]; b.use_connect=False
    bone('root',(0,0,0),(0,0,0.25))
    bone('hips',(0,0,J['hip']),(0,0,J['chest']),'root')
    bone('spine',(0,0,J['chest']),(0,0,J['neck']),'hips')
    bone('head',(0,0,J['neck']),(0,0,J['top']),'spine')
    for s,side in ((1,'L'),(-1,'R')):
        bone('arm.'+side,(J['sh'][0]*s,0,J['sh'][1]),(J['el'][0]*s,0,J['el'][1]),'spine')
        bone('forearm.'+side,(J['el'][0]*s,0,J['el'][1]),(J['ha'][0]*s,0,J['ha'][1]),'arm.'+side)
        bone('leg.'+side,(J['leg_x']*s,0,J['hip']),(J['leg_x']*s,-0.01,J['knee']),'hips')
        bone('shin.'+side,(J['leg_x']*s,-0.01,J['knee']),(J['leg_x']*s,0,J['ankle']),'leg.'+side)
    for e in extra: bone(*e)
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm
