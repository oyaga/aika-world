
import random
from mathutils import noise
clear()
R0=20.0
def D(lat,lon):
    la,lo=math.radians(lat),math.radians(lon); return Vector((math.cos(la)*math.cos(lo), math.cos(la)*math.sin(lo), math.sin(la)))
def arc(a,b): return R0*a.angle(b)
def smooth(x): x=max(0,min(1,x)); return x*x*(3-2*x)
def tangent(n, toward):
    t=toward-n*toward.dot(n)
    if t.length<1e-6: t=Vector((1,0,0))-n*n.x
    return t.normalized()
def offset(n, t, dist):
    a=dist/R0; return (n*math.cos(a)+t*math.sin(a)).normalized()
def frame(n, face_to=None):
    n=n.normalized(); f=tangent(n, face_to if face_to is not None else Vector((0,0,1)))
    y=-f; x=y.cross(n); return Matrix((x,y,n)).transposed().to_4x4()
def local(n, fwd_to, right, fwd):
    """ponto na superfície a 'right' m à direita e 'fwd' m à frente de n (olhando para fwd_to)"""
    f=tangent(n,fwd_to); r=f.cross(n)
    p=n*R0+f*fwd+r*right; return p.normalized()
# ---- materiais (<=16) ----
GR=mat("Grama","#6FAF6A"); TE=mat("Terra","#C9B98A"); PE=mat("Pedra","#8E8A96"); AG=mat("Agua","#3FA9D8")
MA=mat("Madeira","#8A5A3B"); FO=mat("Folha","#4E8F55"); SK=mat("Sakura","#F4A6C0"); AS=mat("Asfalto","#6E7478")
CO=mat("Concreto","#B9B6A8"); BR=mat("Branco","#F2EEE2"); CY=mat("Ciano@unlit","#5CE1E6",emit=True); NE=mat("Brilho@unlit","#FF5A02",emit=True)
LZ=mat("Luz@unlit","#FFD9A0",emit=True); VI=mat("Vinho","#8E2F3C"); LA=mat("Laranja","#E8742A"); ES=mat("Escuro","#1E1A24")
# ---- layout ----
POLE=Vector((0,0,1))
TEMPLO=D(55,-90); TFWD=tangent(TEMPLO,POLE)                    # templo olha para o polo
TEAST=TFWD.cross(TEMPLO).normalized()
PLAT_R=6.0; PLAT_H=2.0; STAIR_A=6.0; STAIR_B=9.4; STAIR_W=1.3
CORREIO=local(TEMPLO,POLE,3.8,2.2)
SERV=D(35,62); VILA=D(28,172)
LAGO=offset(TEMPLO,-TEAST,10.4)   # lago fundo ao lado da colina (a oeste), com cachoeira
LAGO_R=4.3; LAGO_D=1.9
RASA=D(-42,140); RASA_R=3.4; RASA_D=0.75
TRAIL_LAT=-15; TRAIL_HALF=1.2
def trail_d(n): return abs(math.degrees(math.asin(max(-1,min(1,n.z))))-TRAIL_LAT)*math.pi/180*R0
def stair_coords(n):
    """(ao longo, lateral) no referencial do templo: ao longo = distância à frente do centro"""
    p=n*R0-TEMPLO*R0
    return p.dot(TFWD), p.dot(TEAST)
def in_corridor(n, pad=0.0):
    al,lat=stair_coords(n)
    return STAIR_A-0.5<al<STAIR_B+0.8 and abs(lat)<STAIR_W+pad and n.dot(TEMPLO)>0.5
flats=[(POLE,3.2,1.5),(SERV,9.8,2.5),(VILA,12.5,3.5)]
def height(n):
    h=0.75*noise.noise(n*2.4)+0.3*noise.noise(n*6.0+Vector((3,1,2)))
    h=max(h,-0.25); m=1.0
    for c,r,fall in flats: m=min(m, smooth((arc(n,c)-r)/fall))
    m=min(m, smooth((trail_d(n)-TRAIL_HALF-0.4)/2.0))
    for c,r in ((LAGO,LAGO_R),(RASA,RASA_R)): m=min(m, smooth((arc(n,c)-r-0.8)/2.2))
    dT=arc(n,TEMPLO)
    m=min(m, smooth((dT-PLAT_R-2.5)/2.5))
    if in_corridor(n,1.2): m=0
    h*=m
    # colina do templo
    if dT<PLAT_R: H=PLAT_H
    elif dT<PLAT_R+2.2: H=PLAT_H*(1-smooth((dT-PLAT_R)/2.2))
    else: H=0
    al,lat=stair_coords(n)
    if in_corridor(n,1.0) and al>STAIR_A-0.5:
        ramp=PLAT_H*max(0,min(1,1-(al-STAIR_A)/(STAIR_B-STAIR_A)))-0.12
        H=min(max(ramp,0), H) if al>STAIR_A else H
    h=max(h,H) if H>0 else h
    # lagos
    for c,r,dep in ((LAGO,LAGO_R,LAGO_D),(RASA,RASA_R,RASA_D)):
        d=arc(n,c)
        if d<r: h=-dep*(1-(d/r)**2)*1.2-0.05
        elif d<r+1.0 and h<0.3: h=max(h,0.1*math.sin((d-r)*math.pi))
    return h
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=R0, location=(0,0,0))
ter=bpy.context.active_object; ter.name="terreno"; ter.data.name="terreno"
setmat(ter,GR); ter.data.materials.append(TE); ter.data.materials.append(PE)
for v in ter.data.vertices:
    n=v.co.normalized(); v.co=n*(R0+height(n))
for p in ter.data.polygons:
    n=p.center.normalized(); p.use_smooth=False
    r=p.center.length-R0; dT=arc(n,TEMPLO)
    if any(arc(n,c)<rr+0.4 for c,rr in ((LAGO,LAGO_R),(RASA,RASA_R))): p.material_index=1
    elif PLAT_R-0.1<dT<PLAT_R+2.3 and not in_corridor(n,0.3): p.material_index=2   # barranco de pedra
    elif noise.noise(n*14+Vector((7,7,7)))>0.5: p.material_index=1   # manchas de terra
G=[ter]; DECO=[]; objs=[ter]
def link(o): objs.append(o); return o
def place(o,n,sink=0.0,face=None,lift=0.0,h=None):
    bpy.context.view_layer.update()
    M=frame(n,face if face is not None else Vector((random.random()-.5,random.random()-.5,random.random()-.5)))
    M.translation=n*(R0+(height(n) if h is None else h)-sink+lift); o.matrix_world=M @ o.matrix_world
    return o
def join(lst,name):
    lst=[o for o in lst if o]
    bpy.ops.object.select_all(action='DESELECT')
    for o in lst: o.select_set(True)
    bpy.context.view_layer.objects.active=lst[0]
    for o in lst:
        for mo in list(o.modifiers):
            bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mo.name)
    bpy.context.view_layer.objects.active=lst[0]; bpy.ops.object.join()
    o=bpy.context.active_object; o.name=name; o.data.name=name
    bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
    for p in o.data.polygons: p.use_smooth=False
    return link(o)
def B(n,c,s,m,rot=(0,0,0),bev=0):
    o=prim('cube',n,loc=c,scale=s,m=m,rot=rot)
    if bev: mo=o.modifiers.new("b",'BEVEL'); mo.width=bev; mo.segments=1
    return o
# ---- água ----
for nm,c,r in (("agua_lago",LAGO,LAGO_R),("agua_lagoa_rasa",RASA,RASA_R)):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=6, radius=R0, location=(0,0,0))
    w=bpy.context.active_object; w.name=nm; w.data.name=nm; setmat(w,AG)
    bm=bmesh.new(); bm.from_mesh(w.data)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if arc(f.calc_center_median().normalized(),c)>r+0.6], context='FACES')
    bm.to_mesh(w.data); bm.free(); link(w)
# ---- trilha (anel de terra) ----
bm=bmesh.new(); N=120; rows=[]
for i in range(N):
    a=2*math.pi*i/N; rr=[]
    for dz in (-TRAIL_HALF,TRAIL_HALF):
        lat=math.radians(TRAIL_LAT)+dz/R0
        n=Vector((math.cos(lat)*math.cos(a),math.cos(lat)*math.sin(a),math.sin(lat)))
        rr.append(bm.verts.new(n*(R0+max(height(n),0)+0.05)))
    rows.append(rr)
for i in range(N):
    a,b=rows[i],rows[(i+1)%N]; bm.faces.new((a[0],b[0],b[1],a[1]))
me=bpy.data.meshes.new("trilha"); bm.to_mesh(me); bm.free()
tr=bpy.data.objects.new("trilha",me); bpy.context.scene.collection.objects.link(tr); setmat(tr,TE); link(tr)
# ---- escadaria do templo (chão) ----
steps=[]; neon=[]; NS=12
for i in range(NS):
    al=STAIR_A+(STAIR_B-STAIR_A)*(i+0.5)/NS
    top=PLAT_H*(1-(i+1)/NS)+0.02+PLAT_H/NS*0.0
    top=PLAT_H-(i)*(PLAT_H/NS)- (PLAT_H/NS)*0.0
    top=PLAT_H*(NS-i)/NS - 0.001
    n=offset(TEMPLO,TFWD,al)
    tread=(STAIR_B-STAIR_A)/NS
    s=B('laje',(0,0,-0.35),(STAIR_W,tread/2+0.02,0.35),PE,bev=0.02); place(s,n,face=POLE,h=top); steps.append(s)
    ln=B('neon',(0,-tread/2-0.005,-0.035),(STAIR_W*0.85,0.006,0.012),NE); place(ln,n,face=POLE,h=top); neon.append(ln)
for sx in (-1,1):
    for i in range(0,NS,2):
        al=STAIR_A+(STAIR_B-STAIR_A)*(i+1)/NS; n=offset(offset(TEMPLO,TFWD,al),TEAST,sx*(STAIR_W+0.25))
        top=PLAT_H*(NS-i)/NS
        w=B('mureta',(0,0,-0.3),(0.22,(STAIR_B-STAIR_A)/NS+0.03,0.45),PE,bev=0.03); place(w,n,face=POLE,h=top); DECO.append(w)
        if i%4==0:
            c=B('neon_mureta',(0,0,0.16),(0.23,0.02,0.012),CY); place(c,n,face=POLE,h=top); neon.append(c)
join(steps,"laje_escadaria"); join(neon,"escadaria_neon"); join(DECO,"escadaria_mureta")
# ---- camadas de pedra no barranco ----
random.seed(5); strata=[]
for k in range(34):
    ang=2*math.pi*k/34
    t=(TFWD*math.cos(ang)+TEAST*math.sin(ang))
    n=offset(TEMPLO,t,PLAT_R+0.9)
    if in_corridor(n,0.8): continue
    for lay,(z,th) in enumerate(((0.35,0.34),(1.0,0.3),(1.6,0.26))):
        w=random.uniform(0.7,1.1)
        s=B('estrato',(0,0,0),(w,0.35+0.1*lay,th/2),PE if lay!=1 else CO,bev=0.05)
        s.rotation_euler=(random.uniform(-0.05,0.05),0,random.uniform(-0.1,0.1))
        place(s,offset(n,t,-0.35*lay+0.2),face=TEMPLO*0-t+TEMPLO*0 + (n - t),h=z)
        strata.append(s)
    if k%5==0:
        c=B('veio',(0,-0.4,0),(0.5,0.01,0.012),CY); c.rotation_euler=(0,0.3,0); place(c,n,face=n-t,h=1.25); strata.append(c)
join(strata,"barranco_pedras")
# ---- cachoeira: do platô para o lago ----
LT=tangent(TEMPLO,LAGO); LS=LT.cross(TEMPLO).normalized()
edge=offset(TEMPLO,LT,PLAT_R)
casc=[]
def at(al,side=0.0): return offset(offset(TEMPLO,LT,PLAT_R+al),LS,side)
q=B('canal',(0,0,0.03),(0.42,0.9,0.03),CY); place(q,at(-0.9),face=LAGO,h=PLAT_H); casc.append(q)
for sd in (-1,1):
    b_=B('canal_borda',(0,0,0.1),(0.08,0.9,0.1),PE); place(b_,at(-0.9,sd*0.5),face=LAGO,h=PLAT_H); casc.append(b_)
q=B('lamina',(0,0,0),(0.42,0.05,PLAT_H/2+0.15),CY); place(q,at(0.12),face=LAGO,h=PLAT_H/2-0.1); casc.append(q)
for k,(sd,z) in enumerate(((-0.25,1.4),(0.2,0.8),(-0.1,0.3))):
    q=B('lamina_fio',(0,0,0),(0.05,0.03,0.22),BR); place(q,at(0.07,sd),face=LAGO,h=z); casc.append(q)
sp=prim('cyl','espuma',loc=(0,0,0.02),m=CY,radius=0.75,depth=0.04,vertices=12); place(sp,at(0.7),h=-0.02); casc.append(sp)
sp2=prim('torus','espuma_anel',loc=(0,0,0.03),m=BR,major_radius=1.0,minor_radius=0.04,major_segments=14,minor_segments=3); place(sp2,at(0.7),h=-0.02); casc.append(sp2)
for sd in (-1,1):
    r=prim('ico','rocha_queda',loc=(0,0,0.9),scale=(0.55,0.6,1.25),m=PE,radius=1,subdivisions=1); place(r,at(0.25,sd*0.95),sink=0.9,h=0.6); casc.append(r)
join(casc,"cachoeira")
b=prim('cyl','bloqueio_cachoeira',loc=(0,0,1.0),radius=0.7,depth=2.5,vertices=8); place(b,at(-0.9),h=PLAT_H-0.2); b.display_type='WIRE'; b.hide_render=True; link(b)
# ---- margens de pedra dos lagos ----
marg=[]
for c,r,k0 in ((LAGO,LAGO_R,22),(RASA,RASA_R,16)):
    for k in range(k0):
        ang=2*math.pi*k/k0; t=tangent(c,POLE)*math.cos(ang)+tangent(c,POLE).cross(c)*math.sin(ang)
        n=offset(c,t,r+0.25)
        if arc(n,TEMPLO)<PLAT_R+2.4: continue
        s=random.uniform(0.25,0.5)
        o=prim('ico','margem',loc=(0,0,0.05),scale=(s*1.3,s,s*0.6),m=PE,radius=1,subdivisions=1); place(o,n,sink=0.08); marg.append(o)
join(marg,"lagos_margem")
# ---- praça: mini-esquina ----
PF=tangent(SERV,POLE); PR=PF.cross(SERV).normalized()
def pp(right,fwd): return local(SERV,POLE,right,fwd)
def heading_pt(deg,r): 
    th=math.radians(deg); return pp(math.sin(th)*r, math.cos(th)*r)
# asfalto: disco sob toda a praça + rua saindo pela abertura -> chão
STREET_HW=1.75; SW_IN=3.75; SW_OUT=9.6
def surf(x,y,lift):
    n=pp(x,y); return n*(R0+max(height(n),0)+lift)
bm=bmesh.new()
rings=[0.0,1.2,2.4,3.75,5.0,6.5,8.0,9.55]; NA=64; grid={}
for ri,r in enumerate(rings):
    for k in range(NA if r>0 else 1):
        th=2*math.pi*k/NA
        grid[(ri,k)]=bm.verts.new(surf(r*math.sin(th),r*math.cos(th),0.03))
for ri in range(1,len(rings)):
    for k in range(NA):
        k2=(k+1)%NA
        if ri==1: bm.faces.new((grid[(0,0)],grid[(1,k)],grid[(1,k2)]))
        else: bm.faces.new((grid[(ri-1,k)],grid[(ri,k)],grid[(ri,k2)],grid[(ri-1,k2)]))
ys=[8.6+i*0.6 for i in range(6)]; xs=[-STREET_HW,-0.6,0.6,STREET_HW]
sv={(i,j):bm.verts.new(surf(x,y,0.031)) for i,x in enumerate(xs) for j,y in enumerate(ys)}
for i in range(len(xs)-1):
    for j in range(len(ys)-1): bm.faces.new((sv[(i,j)],sv[(i+1,j)],sv[(i+1,j+1)],sv[(i,j+1)]))
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
me=bpy.data.meshes.new("chao_asfalto"); bm.to_mesh(me); bm.free()
asf=bpy.data.objects.new("chao_asfalto",me); bpy.context.scene.collection.objects.link(asf); setmat(asf,AS); link(asf)
for f_ in asf.data.polygons:
    if f_.normal.dot(f_.center.normalized())<0: f_.flip()
# calçada: anel polar com a borda da rua reta (x = ±STREET_HW), meio-fio branco
bm=bmesh.new(); SR=[SW_IN,4.3,5.2,6.2,7.2,8.2,9.0,SW_OUT]; NS_=72; vv={}
for ri,r in enumerate(SR):
    tmin=math.asin(min(1,STREET_HW/r))
    for k in range(NS_+1):
        th=tmin+(2*math.pi-2*tmin)*k/NS_
        vv[(ri,k)]=bm.verts.new(surf(r*math.sin(th),r*math.cos(th),0.12))
for ri in range(1,len(SR)):
    for k in range(NS_): bm.faces.new((vv[(ri-1,k)],vv[(ri-1,k+1)],vv[(ri,k+1)],vv[(ri,k)]))
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
for f_ in bm.faces:
    if f_.normal.dot(f_.calc_center_median().normalized())<0: f_.normal_flip()
edges=[e for e in bm.edges if e.is_boundary]
ret=bmesh.ops.extrude_edge_only(bm,edges=edges)
for v in [g for g in ret['geom'] if isinstance(g,bmesh.types.BMVert)]: v.co=v.co.normalized()*(v.co.length-0.3)
me=bpy.data.meshes.new("piso_calcada"); bm.to_mesh(me); bm.free()
pc=bpy.data.objects.new("piso_calcada",me); bpy.context.scene.collection.objects.link(pc)
pc.data.materials.append(CO); pc.data.materials.append(BR)
for f_ in pc.data.polygons:
    f_.use_smooth=False
    if abs(f_.normal.normalized().dot(f_.center.normalized()))<0.5: f_.material_index=1
link(pc)
meio=[]
pint=[]
for k in range(6):   # faixa de pedestre: listras paralelas à rua, atravessando-a
    x=-1.35+k*0.54; s_=B('faixa',(0,0,0.036),(0.17,0.6,0.005),BR); place(s_,pp(x,4.7),face=PF,h=0.0); pint.append(s_)
s_=B('parada',(0,0,0.036),(1.6,0.08,0.005),BR); place(s_,pp(0,5.75),face=PF,h=0.0); pint.append(s_)
for fwd in (6.8,8.4,10.0,11.4):
    s_=B('linha',(0,0,0.036),(0.06,0.4,0.005),BR); place(s_,pp(0,fwd),face=PF,h=0.0); pint.append(s_)
props=pint+meio
bu=prim('cyl','bueiro',loc=(0,0,0.04),m=ES,radius=0.38,depth=0.02,vertices=14); place(bu,pp(-1.2,-1.0),h=0.0); props.append(bu)
bu2=prim('torus','bueiro_aro',loc=(0,0,0.04),m=CO,major_radius=0.38,minor_radius=0.03,major_segments=14,minor_segments=3); place(bu2,pp(-1.2,-1.0),h=0.0); props.append(bu2)
# postes com fios
poles=[]
for sx in (-1,1):
    n=pp(sx*2.3,3.9); bpos=n
    for o in (prim('cyl','poste',loc=(0,0,2.6),m=CO,radius=0.11,depth=5.2,vertices=8),
              B('cruzeta',(0,0,4.7),(0.9,0.05,0.05),MA),
              B('transformador',(0.18*sx,0.14,3.9),(0.16,0.12,0.26),ES),
              B('placa_poste',(0,-0.12,2.2),(0.14,0.01,0.3),VI)):
        place(o,n,face=SERV,h=0.12); props.append(o)
    poles.append(n)
def wire(a,b,za,zb,sag=0.35,m=ES):
    A=a*(R0+height(a)+za); Bb=b*(R0+height(b)+zb); out=[]
    prev=A
    for i in range(1,7):
        t=i/6; P=A.lerp(Bb,t); P=P - P.normalized()*sag*4*t*(1-t)
        out.append(bar('fio',prev,P,0.012,m)); prev=P
    return out
for zz in (4.72,4.45):
    props+=wire(poles[0],poles[1],zz,zz)
    props+=wire(poles[0],pp(-4.5,9.5),zz,4.6-(4.72-zz)); props+=wire(poles[1],pp(4.5,9.5),zz,4.6-(4.72-zz))
    props+=wire(poles[0],heading_pt(-70,7.4),zz,3.6); props+=wire(poles[1],heading_pt(70,7.4),zz,3.6)
# placa triangular com glifo
n=heading_pt(40,4.35)
for o in (prim('cyl','haste',loc=(0,0,1.1),m=CO,radius=0.035,depth=2.2,vertices=6),
          prim('cone','triangulo',loc=(0,0,2.2),rot=(math.pi/2,0,0),scale=(1,1,0.1),m=VI,radius1=0.42,radius2=0.0,depth=0.06,vertices=3),
          B('glifo_placa',(0,-0.035,2.17),(0.04,0.005,0.13),BR), B('glifo_placa2',(0,-0.035,2.12),(0.12,0.005,0.03),BR)):
    place(o,n,face=SERV+PF*0,h=0.12); props.append(o)
# máquina de venda
n=heading_pt(-32,5.3)
for o in (B('maquina',(0,0,0.95),(0.45,0.36,0.95),CO,bev=0.03), B('maquina_tela',(0,-0.365,1.25),(0.36,0.01,0.45),LZ),
          B('maquina_faixa',(0,-0.365,0.62),(0.38,0.012,0.08),VI), B('maquina_saida',(0,-0.365,0.25),(0.3,0.015,0.1),ES)):
    place(o,n,face=SERV,h=0.12); props.append(o)
for k in range(4):
    o=B('botao',(-0.24+k*0.16,-0.37,0.8),(0.035,0.01,0.035),CY); place(o,n,face=SERV,h=0.12); props.append(o)
# cones
for (x,y) in ((-0.3,-0.2),(-1.9,-1.5),(-0.6,-1.9)):
    n=pp(x,y)
    for o in (prim('cone','cone',loc=(0,0,0.3),m=LA,radius1=0.17,radius2=0.03,depth=0.55,vertices=8),
              prim('cyl','cone_faixa',loc=(0,0,0.33),m=BR,radius=0.1,depth=0.08,vertices=8), B('cone_base',(0,0,0.02),(0.22,0.22,0.02),LA)):
        place(o,n,h=0.0); props.append(o)
# vasos nos vãos entre os prédios
for deg in (84,132,180,228,276):
    n=heading_pt(deg,6.4)
    for o in (prim('cone','vaso',loc=(0,0,0.25),m=MA,radius1=0.22,radius2=0.3,depth=0.5,vertices=10),
              prim('ico','planta',loc=(0,0,0.75),scale=(1,1,0.9),m=FO,radius=0.42,subdivisions=1)):
        place(o,n,h=0.12); props.append(o)
# banco
n=heading_pt(-47,4.5)
for o in (B('banco',(0,0,0.45),(0.7,0.2,0.04),MA), B('banco_pe',(-0.55,0,0.22),(0.05,0.18,0.22),CO), B('banco_pe',(0.55,0,0.22),(0.05,0.18,0.22),CO)):
    place(o,n,face=SERV,h=0.12); props.append(o)
join(props,"praca_props")
# ---- vila: caminhos de terra (chão) ----
paths=[]
for ang in (20,110,200,290):
    t=tangent(VILA,POLE); t=(t*math.cos(math.radians(ang))+t.cross(VILA)*math.sin(math.radians(ang))).normalized()
    for k in range(9):
        n=offset(VILA,t,0.6+k*1.3)
        s=B('caminho',(0,0,0.02),(0.55,0.68,0.03),TE); place(s,n,face=n+t,h=max(height(n),0)); paths.append(s)
cen=prim('cyl','largo',loc=(0,0,0.02),m=TE,radius=1.6,depth=0.04,vertices=14); place(cen,VILA,h=max(height(VILA),0)); paths.append(cen)
join(paths,"trilha_vila")
# ---- Empties ----
def empty(name, n, face_to=None, size=1.0, props=None, h=None):
    e=bpy.data.objects.new(name,None); e.empty_display_type='SINGLE_ARROW' if name.startswith(('poi','historia')) else 'CIRCLE'
    e.empty_display_size=size
    n=n.normalized(); M=frame(n,face_to); M.translation=n*(R0+(height(n) if h is None else h))
    e.matrix_world=M; bpy.context.scene.collection.objects.link(e)
    for k,v in (props or {}).items(): e[k]=v
    return link(e)
empty("poi_templo",TEMPLO,face_to=POLE,size=3,h=PLAT_H)
empty("poi_correio",CORREIO,face_to=POLE,size=1,h=PLAT_H)
empty("area_servicos",SERV,face_to=POLE,size=9,h=0.12)
empty("area_vila",VILA,face_to=POLE,size=12,props={"raio":12.0})
HIST_LON=(-30,40,110,180,250)
for i,lon in enumerate(HIST_LON,1):
    n=D(TRAIL_LAT+4.2,lon); empty(f"historia_{i}",n,face_to=D(TRAIL_LAT,lon)-n+n*0,size=1)
# ---- decoração: pinheiros, sakuras, arbustos, pedras ----
def ok_spot(n,pad=1.2):
    if arc(n,POLE)<5 or arc(n,TEMPLO)<PLAT_R+2.6 or in_corridor(n,2.2) or arc(n,SERV)<11 or arc(n,VILA)<13.5: return False
    if trail_d(n)<TRAIL_HALF+pad: return False
    for c,r in ((LAGO,LAGO_R),(RASA,RASA_R)):
        if arc(n,c)<r+1.6: return False
    return True
def rnd(): return Vector((random.gauss(0,1),random.gauss(0,1),random.gauss(0,1))).normalized()
random.seed(21); spots=[]; tries=0
# anel denso em volta da colina do templo
while len(spots)<22 and tries<8000:
    tries+=1; ang=random.uniform(0,2*math.pi); t=TFWD*math.cos(ang)+TEAST*math.sin(ang)
    n=offset(TEMPLO,t,random.uniform(PLAT_R+2.7,PLAT_R+6.5))
    if ok_spot(n) and all(arc(n,s)>2.2 for s in spots): spots.append(n)
tries=0
while len(spots)<66 and tries<12000:
    tries+=1; n=rnd()
    if ok_spot(n) and all(arc(n,s)>2.6 for s in spots): spots.append(n)
trees=[]; rocks=[]; bushes=[]; saks=[]
for i,n in enumerate(spots):
    f=rnd()
    if i%7==3:   # sakura
        s=random.uniform(0.85,1.15); ps=[prim('cyl','sk_tronco',loc=(0,0,0.7*s),m=MA,radius=0.11*s,depth=1.4*s,vertices=6)]
        for (dx,dy,dz,r) in ((0,0,1.8,0.68),(0.45,0.2,1.6,0.48),(-0.42,-0.1,1.65,0.46),(0.05,0.3,2.2,0.42)):
            ps.append(prim('ico','sk_copa',loc=(dx*s,dy*s,dz*s),m=SK,radius=r*s,subdivisions=1))
        for o in ps: place(o,n,face=f,sink=0.05); saks.append(o)
    elif i%5==4:   # pedra com veio
        s=random.uniform(0.6,1.3)
        r=prim('ico','pedra',loc=(0,0,0.3*s),scale=(s,s*0.8,s*0.75),m=PE,radius=0.85,subdivisions=1)
        c=B('veio',(0,-0.62*s,0.35*s),(0.02,0.02,0.3*s),CY,rot=(0,0.5,0))
        for o in (r,c): place(o,n,sink=0.2,face=f); rocks.append(o)
    else:   # pinheiro com veio neon
        s=random.uniform(0.85,1.4)
        ps=[prim('cyl','tronco',loc=(0,0,0.45*s),m=MA,radius=0.17*s,depth=0.9*s,vertices=6),
            B('veio_tronco',(0,-0.17*s,0.45*s),(0.018,0.01,0.3*s),CY)]
        for (z,r,dh) in ((1.25,1.0,1.35),(1.95,0.78,1.15),(2.6,0.52,1.0)):
            ps.append(prim('cone','copa',loc=(0,0,z*s),m=FO,radius1=r*s,radius2=0.06*s,depth=dh*s,vertices=7))
        if i%2==0: ps.append(prim('cyl','anel',loc=(0,0,1.08*s),m=CY,radius=0.66*s,depth=0.04*s,vertices=7))
        for o in ps: place(o,n,face=f,sink=0.05); trees.append(o)
# sakuras extras no platô do templo (nas bordas de trás)
for sx in (-1,1):
    n=local(TEMPLO,POLE,sx*5.2,-3.5)
    ps=[prim('cyl','sk_tronco',loc=(0,0,0.75),m=MA,radius=0.11,depth=1.5,vertices=6)]
    for (dx,dy,dz,r) in ((0,0,1.85,0.7),(0.45,0.2,1.65,0.5),(-0.42,-0.1,1.7,0.48)):
        ps.append(prim('ico','sk_copa',loc=(dx,dy,dz),m=SK,radius=r,subdivisions=1))
    for o in ps: place(o,n,face=POLE,sink=0.05,h=PLAT_H); saks.append(o)
bsp=[]; tries=0
while len(bsp)<80 and tries<12000:
    tries+=1; n=rnd() if len(bsp)<50 else offset(TEMPLO,rnd().cross(TEMPLO).normalized(),random.uniform(PLAT_R+2.4,PLAT_R+6))
    if ok_spot(n,pad=0.8) and all(arc(n,s)>1.3 for s in spots+bsp): bsp.append(n)
for n in bsp:
    s=random.uniform(0.3,0.55)
    b=prim('ico','arbusto',loc=(0,0,0.15*s),scale=(s,s,s*0.7),m=FO,radius=1,subdivisions=1); place(b,n,sink=0.05); bushes.append(b)
join(trees,"arvores"); join(saks,"sakuras"); join(rocks,"pedras"); join(bushes,"arbustos")
# ---- rochas flutuantes ----
fl=[]
for k in range(24):
    while True:
        n=rnd()
        if n.z<0.45 and arc(n,SERV)>12 and arc(n,VILA)>14: break
    s=random.uniform(0.35,1.0)
    r=prim('ico','flutuante',loc=(0,0,0),scale=(s,s*0.85,s*1.2),m=PE,radius=1,subdivisions=1)
    r.rotation_euler=(random.random()*3,random.random()*3,random.random()*3)
    place(r,n,lift=random.uniform(4.5,8.5),h=0); fl.append(r)
    if k%3==0:
        c=B('veio_fl',(0,0,0),(0.03,0.03,0.45*s),CY); bpy.context.view_layer.update()
        c.matrix_world=r.matrix_world@Matrix.Translation((0,-0.82,0))@Matrix.Diagonal((1/s,1/(s*0.85),1/(s*1.2),1))@Matrix.Diagonal((0.03,0.03,0.45*s,1)); fl.append(c)
join(fl,"rochas_flutuantes")
PLANET_OBJS=[o.name for o in objs]
