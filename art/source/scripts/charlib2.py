
parts=[]
def part(o, bone):
    vg=o.vertex_groups.new(name=bone); vg.add(list(range(len(o.data.vertices))),1.0,'REPLACE'); parts.append(o); return o
def orient(o, d):
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(Vector(d).normalized())
def limb(name,a,b,r,m,bone,verts=8,r2=None):
    a=Vector(a); b=Vector(b); d=b-a
    if r2 is None: o=prim('cyl',name,loc=(a+b)/2,m=m,radius=r,depth=d.length,vertices=verts)
    else: o=prim('cone',name,loc=(a+b)/2,m=m,radius1=r,radius2=r2,depth=d.length,vertices=verts)
    orient(o,d); return part(o,bone)
def ell(name,a,b,rx,ry,m,bone,seg=8,ring=6):
    """elipsoide entre a e b"""
    a=Vector(a); b=Vector(b); d=b-a
    o=prim('uv',name,loc=(a+b)/2,m=m,radius=1,segments=seg,ring_count=ring); o.scale=(rx,ry,d.length/2)
    orient(o,d); return part(o,bone)
def sph(name,c,s,m,bone,seg=8,ring=6,rot=(0,0,0)):
    o=prim('uv',name,loc=c,scale=s,rot=rot,m=m,radius=1,segments=seg,ring_count=ring); return part(o,bone)
def bx(name,c,s,m,bone,rot=(0,0,0)): return part(prim('cube',name,loc=c,scale=s,rot=rot,m=m),bone)
def spike(name,base,tip,r,m,bone,flat=0.55,verts=4):
    base=Vector(base); tip=Vector(tip); d=tip-base
    o=prim('cone',name,loc=base+d/2,m=m,radius1=r,radius2=0.0,depth=d.length,vertices=verts)
    o.scale=(1,flat,1); orient(o,d); return part(o,bone)
def join_parts(name):
    apply_all(parts)
    bpy.ops.object.select_all(action='DESELECT')
    for o in parts: o.select_set(True)
    bpy.context.view_layer.objects.active=parts[0]
    bpy.ops.object.join()
    b=bpy.context.active_object; b.name=name; b.data.name=name
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    return b
def make_rig(name, j, extra=()):
    bpy.ops.object.armature_add(location=(0,0,0))
    arm=bpy.context.active_object; arm.name=name; arm.data.name=name
    bpy.ops.object.mode_set(mode='EDIT')
    eb=arm.data.edit_bones; eb.remove(eb[0])
    def bone(n,h,t,p=None):
        b=eb.new(n); b.head=h; b.tail=t; b.roll=0
        if p: b.parent=eb[p]; b.use_connect=False
    bone('root',(0,0,0),(0,0,0.25))
    bone('hips',(0,0,j['hip']),(0,0,j['chest']),'root')
    bone('spine',(0,0,j['chest']),(0,0,j['neck']),'hips')
    bone('head',(0,0,j['neck']),(0,0,j['top']),'spine')
    for s,side in ((1,'L'),(-1,'R')):
        sh=(j['sh'][0]*s,0,j['sh'][1]); el=(j['el'][0]*s,0,j['el'][1]); ha=(j['ha'][0]*s,0,j['ha'][1])
        bone('arm.'+side,sh,el,'spine'); bone('forearm.'+side,el,ha,'arm.'+side)
        bone('leg.'+side,(j['leg_x']*s,0,j['hip']),(j['leg_x']*s,0,0.06),'hips')
    for e in extra: bone(*e)
    bpy.ops.object.mode_set(mode='OBJECT')
    return arm
