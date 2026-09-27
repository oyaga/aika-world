
import random
from mathutils import noise
clear()
R0=20.0
def D(lat,lon):
    la,lo=math.radians(lat),math.radians(lon)
    return Vector((math.cos(la)*math.cos(lo), math.cos(la)*math.sin(lo), math.sin(la)))
def arc(a,b): return R0*a.angle(b)
def smooth(x): x=max(0,min(1,x)); return x*x*(3-2*x)
GR=mat("Grama","#5FAE4E"); CA=mat("Caminho","#E9D8A6"); AR=mat("Areia","#D9C58E"); AG=mat("Agua","#3FA9D8")
TR=mat("Tronco","#6B4432"); FO=mat("Pinheiro","#2E7D46"); FO2=mat("PinheiroClaro","#3D9A55"); AB=mat("Arbusto","#3F8A3E")
PE=mat("Pedra","#5B5670"); LJ=mat("Laje","#7A7688"); NA=mat("NeonAzul@unlit","#39D5FF",emit=True); BR=mat("Brilho@unlit","#FF7A1A",emit=True)
CQ=mat("Cachoeira@unlit","#5FD0FF",emit=True); SK=mat("Sakura","#FF9EC7"); SK2=mat("SakuraEscura","#F06C9B")
POLE=Vector((0,0,1))
TEMPLO=D(48,-90); TORII=D(48+math.degrees(4.8/R0),-90); CORREIO=D(47.5,-78); SERV=D(8,30); VILA=D(10,150)
LAKES=[("agua_lago",D(-40,60),4.5,1.4),("agua_lagoa_rasa",D(-42,215),3.2,0.7)]
FALL=D(-40-math.degrees(6.2/R0),60)
flats=[(POLE,6.0,3.0),(TEMPLO,6.5,3.0),(SERV,9.5,3.0),(VILA,12.0,4.0)]
TRAIL_HALF=1.3
def stair_d(n):  # distância ao caminho polo -> torii (meridiano -90)
    if n.y<0 and n.z>math.sin(math.radians(55)): return abs(n.x)*R0
    return 99
def height(n):
    h=0.9*noise.noise(n*2.6)+0.35*noise.noise(n*6.0+Vector((3,1,2)))
    h=max(h,-0.3); m=1.0
    for c,r,fall in flats: m=min(m, smooth((arc(n,c)-r)/fall))
    lat_d=abs(math.asin(max(-1,min(1,n.z))))*R0
    m=min(m, smooth((lat_d-TRAIL_HALF-0.5)/2.5))
    m=min(m, smooth((stair_d(n)-1.5)/2.0))
    for nm,c,r,dep in LAKES: m=min(m, smooth((arc(n,c)-r-0.6)/2.5))
    h*=m
    for nm,c,r,dep in LAKES:
        d=arc(n,c)
        if d<r: h=-dep*(1-(d/r)**2)*1.25
        elif d<r+1.2: h=max(h,0.12*math.sin((d-r)/1.2*math.pi))
    return h
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=5, radius=R0, location=(0,0,0))
ter=bpy.context.active_object; ter.name="terreno"; ter.data.name="terreno"
setmat(ter,GR); ter.data.materials.append(CA); ter.data.materials.append(AR)
for v in ter.data.vertices:
    n=v.co.normalized(); v.co=n*(R0+height(n))
for p in ter.data.polygons:
    n=p.center.normalized(); p.use_smooth=False
    if any(arc(n,c)<r+0.3 for nm,c,r,dep in LAKES): p.material_index=2
    elif arc(n,SERV)<9.0: p.material_index=1
objs=[ter]
for nm,c,r,dep in LAKES:
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=R0, location=(0,0,0))
    w=bpy.context.active_object; w.name=nm; w.data.name=nm; setmat(w,AG)
    bm=bmesh.new(); bm.from_mesh(w.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if arc(f.calc_center_median().normalized(),c)>r+0.5], context='FACES')
    bm.to_mesh(w.data); bm.free(); objs.append(w)
bm=bmesh.new(); N=96; rows=[]
for i in range(N):
    a=2*math.pi*i/N; rr=[]
    for z in (-TRAIL_HALF,TRAIL_HALF):
        lat=z/R0; rr.append(bm.verts.new(Vector((math.cos(lat)*math.cos(a),math.cos(lat)*math.sin(a),math.sin(lat)))*(R0+0.06)))
    rows.append(rr)
for i in range(N):
    a,b=rows[i],rows[(i+1)%N]; bm.faces.new((a[0],b[0],b[1],a[1]))
me=bpy.data.meshes.new("trilha"); bm.to_mesh(me); bm.free()
tr=bpy.data.objects.new("trilha",me); bpy.context.scene.collection.objects.link(tr); setmat(tr,CA); objs.append(tr)
def frame(n, face_to=None):
    n=n.normalized()
    f=(face_to - n*face_to.dot(n)) if face_to is not None else Vector((0,0,1))-n*n.z
    if f.length<1e-4: f=Vector((1,0,0))-n*n.x
    f.normalize(); y=-f; x=y.cross(n)
    return Matrix((x,y,n)).transposed().to_4x4()
def empty(name, n, face_to=None, size=1.0, props=None):
    e=bpy.data.objects.new(name,None); e.empty_display_type='SINGLE_ARROW' if name.startswith(('poi','historia')) else 'CIRCLE'
    e.empty_display_size=size
    n=n.normalized(); M=frame(n,face_to); M.translation=n*(R0+height(n))
    e.matrix_world=M; bpy.context.scene.collection.objects.link(e)
    for k,v in (props or {}).items(): e[k]=v
    objs.append(e); return e
empty("poi_templo",TEMPLO,face_to=POLE,size=3)
empty("poi_correio",CORREIO,face_to=POLE,size=1)
empty("area_servicos",SERV,face_to=POLE,size=9)
empty("area_vila",VILA,face_to=POLE,size=12,props={"raio":12.0})
for i,lon in enumerate((-135,-95,-55,-15,85),1):
    n=D(3.8,lon); empty(f"historia_{i}",n,face_to=D(0,lon)-n,size=1)
random.seed(11)
def ok_spot(n, pad=1.5):
    if arc(n,POLE)<8 or arc(n,TEMPLO)<8.5 or arc(n,SERV)<12 or arc(n,VILA)<14 or stair_d(n)<2.5: return False
    if abs(math.asin(n.z))*R0<TRAIL_HALF+pad: return False
    if arc(n,FALL)<3.5: return False
    for nm,c,r,dep in LAKES:
        if arc(n,c)<r+1.8: return False
    return True
def place(o,n,sink=0.05,face=None,lift=0.0):
    bpy.context.view_layer.update()
    M=frame(n,face if face is not None else Vector((random.random()-.5,random.random()-.5,random.random()-.5)))
    M.translation=n*(R0+height(n)-sink+lift); o.matrix_world=M @ o.matrix_world
trees=[]; rocks=[]; bushes=[]; floats=[]; spots=[]; tries=0
def rnd_dir(): return Vector((random.gauss(0,1),random.gauss(0,1),random.gauss(0,1))).normalized()
while len(spots)<58 and tries<10000:
    tries+=1; n=rnd_dir()
    if ok_spot(n) and all(arc(n,s)>2.8 for s in spots): spots.append(n)
near=[]; tries=0
while len(near)<16 and tries<6000:
    tries+=1
    n=(TEMPLO+rnd_dir()*random.uniform(0.3,0.75)).normalized()
    d=arc(n,TEMPLO)
    if 8.2<d<14 and stair_d(n)>2.5 and all(arc(n,s)>2.3 for s in near+spots) and abs(math.asin(n.z))*R0>TRAIL_HALF+1.5: near.append(n)
spots=near+spots
NT=38+len(near)
for i,n in enumerate(spots):
    f=rnd_dir()
    if i<NT:
        s=random.uniform(0.85,1.35); col=FO if i%3 else FO2
        ps=[prim('cyl','t',loc=(0,0,0.4*s),m=TR,radius=0.16*s,depth=0.8*s,vertices=5)]
        for (z,r,dh) in ((1.2,0.95,1.3),(1.9,0.72,1.1),(2.55,0.48,0.95)):
            ps.append(prim('cone','c',loc=(0,0,z*s),m=col,radius1=r*s,radius2=0.05*s,depth=dh*s,vertices=6))
        if i%2==0: ps.append(prim('cyl','anel',loc=(0,0,(1.2-0.15)*s),m=NA,radius=0.62*s,depth=0.05*s,vertices=6))
        if i%3==0: ps.append(prim('cyl','anel',loc=(0,0,(1.9-0.1)*s),m=NA,radius=0.46*s,depth=0.04*s,vertices=6))
        for o in ps: place(o,n,face=f); trees.append(o)
    else:
        s=random.uniform(0.7,1.4)
        r=prim('ico','r',loc=(0,0,0.25*s),scale=(s,s*0.8,s*0.75),m=PE,radius=0.8,subdivisions=1)
        c=prim('cube','fenda',loc=(0,-0.6*s,0.35*s),rot=(0,0.5,0),scale=(0.025,0.03,0.28*s),m=NA)
        for o in (r,c): place(o,n,sink=0.2,face=f); rocks.append(o)
# arbustos
bsp=[]; tries=0
while len(bsp)<80 and tries<12000:
    tries+=1; n=rnd_dir() if len(bsp)<45 else (TEMPLO+rnd_dir()*random.uniform(0.3,0.7)).normalized()
    if (ok_spot(n,pad=1.0) or (7.2<arc(n,TEMPLO)<14 and stair_d(n)>1.8 and abs(math.asin(n.z))*R0>TRAIL_HALF+1)) and all(arc(n,s)>1.4 for s in spots+bsp): bsp.append(n)
for n in bsp:
    s=random.uniform(0.35,0.6)
    b=prim('ico','b',loc=(0,0,0.15*s),scale=(s,s,s*0.7),m=AB if random.random()<0.6 else FO2,radius=1,subdivisions=1)
    place(b,n,sink=0.05); bushes.append(b)
# pedras flutuantes
for k in range(16):
    while True:
        n=rnd_dir()
        if n.z<0.35 and arc(n,SERV)>11 and arc(n,VILA)>13: break
    s=random.uniform(0.35,0.9)
    r=prim('ico','f',loc=(0,0,0),scale=(s,s*0.8,s*1.1),m=PE,radius=1,subdivisions=1)
    r.rotation_euler=(random.random()*3,random.random()*3,random.random()*3)
    place(r,n,sink=0,lift=random.uniform(4.0,7.5)); floats.append(r)
    if k%3==0:
        c=prim('cube','fl',loc=(0,-0.8*s,0),scale=(0.03,0.03,0.4*s),m=NA); place(c,n,sink=0,lift=0); 
        c.matrix_world=r.matrix_world@Matrix.Translation((0,-0.8,0))@Matrix.Diagonal((0.03/s,0.03/s,0.4,1)); floats.append(c)
# caminho de lajes polo -> torii
steps=[]
lat=math.degrees(math.asin(TORII.z))+math.degrees(1.2/R0)
while lat<84:
    n=D(lat,-90)
    sl=prim('cube','laje',loc=(0,0,0.04),scale=(0.95,0.42,0.06),m=LJ); place(sl,n,sink=0.0,face=POLE)
    ln=prim('cube','laje_luz',loc=(0,-0.43,0.06),scale=(0.8,0.01,0.018),m=BR); place(ln,n,sink=0.0,face=POLE)
    steps+=[sl,ln]; lat+=math.degrees(1.05/R0)
# cachoeira
casc=[]
mound=[(0,0,0.9,1.6,1.3,1.1),(0.5,0.4,2.0,1.1,1.0,0.8),(-0.2,0.3,2.8,0.8,0.8,0.6)]
for (x,y,z,sx,sy,sz) in mound:
    casc.append(prim('ico','morro',loc=(x,y,z-0.3),scale=(sx,sy,sz),m=PE,radius=1,subdivisions=1))
for i,(y,z,hz) in enumerate(((-0.55,2.9,0.35),(-0.95,2.2,0.55),(-1.25,1.35,0.6),(-1.55,0.55,0.55),(-1.85,-0.05,0.35))):
    casc.append(prim('cube','queda',loc=(0.1,y,z),scale=(0.32,0.12,hz),m=CQ))
casc.append(prim('cube','fenda',loc=(0.9,-0.9,1.2),rot=(0,0.3,0),scale=(0.03,0.03,0.5),m=NA))
casc.append(prim('cylinder' if False else 'cyl','espuma',loc=(0.1,-2.3,-0.02),m=CQ,radius=0.55,depth=0.06,vertices=8))
LAKEC=LAKES[0][1]
for o in casc: place(o,FALL,sink=0.0,face=LAKEC-FALL)
blk=prim('cyl','bloqueio_cachoeira',loc=(0,0,1.5),radius=2.0,depth=3.0,vertices=8); place(blk,FALL,sink=0.0,face=LAKEC-FALL); blk.display_type='WIRE'; blk.hide_render=True
# pedrão
bn=D(-15,-40)
big=[prim('ico','pedrao',loc=(0,0,0.8),scale=(2.2,1.8,1.6),m=PE,radius=1,subdivisions=2),prim('cube','fenda',loc=(0,-1.75,1.0),rot=(0,0.4,0),scale=(0.04,0.04,0.7),m=NA)]
for o in big: place(o,bn,0.3,face=POLE)
blk2=prim('cyl','bloqueio_pedrao',loc=(0,0,1.2),radius=2.6,depth=2.4,vertices=8); place(blk2,bn,0.3,face=POLE); blk2.display_type='WIRE'; blk2.hide_render=True
def join(lst,name):
    bpy.ops.object.select_all(action='DESELECT')
    for o in lst: o.select_set(True)
    bpy.context.view_layer.objects.active=lst[0]; bpy.ops.object.join()
    o=bpy.context.active_object; o.name=name; o.data.name=name
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); return o
objs+=[join(trees,"arvores"), join(rocks+big,"pedras"), join(bushes,"arbustos"), join(floats,"rochas_flutuantes"), join(steps,"lajes_templo"), join(casc,"cachoeira"), blk, blk2]
PLANET_OBJS=[o.name for o in objs]
