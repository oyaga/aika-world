# Gera _planeta3.py a partir de _planeta2.py (mesmo layout, arte V3).
import os
H = os.path.join(os.path.expanduser("~"), "Documents", "AikaWorld")
src = open(os.path.join(H, "v2", "_planeta2.py"), encoding="utf-8").read()

def rep(old, new, count=1):
    global src
    n = src.count(old)
    assert n == count, (n, old[:80])
    src = src.replace(old, new)

# ---- paleta V3: mais escura e saturada, pedra arroxeada ----
rep('GR=mat("Grama","#6FAF6A"); TE=mat("Terra","#C9B98A"); PE=mat("Pedra","#8E8A96"); AG=mat("Agua","#3FA9D8")',
    'GR=mat("Grama","#3F7A3A"); TE=mat("Terra","#7A6448"); PE=mat("Pedra","#5E5A72"); AG=mat("Agua","#2F8FD0")')
rep('MA=mat("Madeira","#8A5A3B"); FO=mat("Folha","#4E8F55"); SK=mat("Sakura","#F4A6C0"); AS=mat("Asfalto","#6E7478")',
    'MA=mat("Madeira","#4A3226"); FO=mat("Folha","#2F6B3A"); SK=mat("Sakura","#F59AC4"); AS=mat("Asfalto","#4E5360")')
rep('CO=mat("Concreto","#B9B6A8")', 'CO=mat("Concreto","#7C7888")')

# ---- terreno facetado + sem manchas bege ----
rep("""    elif noise.noise(n*14+Vector((7,7,7)))>0.5: p.material_index=1   # manchas de terra
""", "")
rep("""for v in ter.data.vertices:
    n=v.co.normalized(); v.co=n*(R0+height(n))
""", """def rough_ok(n):
    if arc(n,POLE)<5.5 or arc(n,SERV)<11 or arc(n,VILA)<14 or arc(n,TEMPLO)<PLAT_R+3.0 or in_corridor(n,2.0): return 0.0
    if trail_d(n)<TRAIL_HALF+1.6: return 0.0
    for c,r in ((LAGO,LAGO_R),(RASA,RASA_R)):
        if arc(n,c)<r+2.2: return 0.0
    return 1.0
for v in ter.data.vertices:
    n=v.co.normalized(); j=rough_ok(n)*(0.16*noise.noise(n*23+Vector((1,2,3)))+0.07*noise.noise(n*61))
    v.co=n*(R0+height(n)+j)
""")

# ---- barranco: blocos de pedra com costuras neon laranja ----
i0 = src.index("# ---- camadas de pedra no barranco ----")
i1 = src.index("# ---- cachoeira")
src = src[:i0] + """# ---- barranco V3: fiadas de blocos com costuras neon ----
random.seed(5); strata=[]
for lay,(z,th,out) in enumerate(((0.28,0.56,1.05),(0.86,0.56,0.8),(1.42,0.56,0.55),(1.9,0.22,0.3))):
    circ=2*math.pi*(PLAT_R+out); nb=int(circ/1.25)
    for k in range(nb):
        ang=2*math.pi*(k+0.5*(lay%2))/nb
        t=(TFWD*math.cos(ang)+TEAST*math.sin(ang))
        n=offset(TEMPLO,t,PLAT_R+out)
        if in_corridor(n,0.7): continue
        w=circ/nb/2-0.05
        m_=PE if (k*7+lay*3)%5 else CO
        s=B('bloco',(0,0,0),(w,0.5,th/2-0.025),m_,bev=0.07)
        s.rotation_euler=(random.uniform(-0.04,0.04),random.uniform(-0.03,0.03),random.uniform(-0.05,0.05))
        place(s,n,face=n-t,h=z); strata.append(s)
        if lay<3 and (k+lay)%2==0:
            c=B('costura',(0,0.505,th/2-0.05),(w*0.9,0.012,0.014),NE); place(c,n,face=n-t,h=z); strata.append(c)
        if lay==1 and k%6==2:
            for (x0,z0,x1,z1) in ((-0.3,0.2,-0.05,-0.02),(-0.05,-0.02,0.2,0.12)):
                v=B('veio',((x0+x1)/2,0.51,(z0+z1)/2),(math.hypot(x1-x0,z1-z0)/2,0.01,0.016),CY,rot=(0,-math.atan2(z1-z0,x1-x0),0))
                place(v,n,face=n-t,h=z); strata.append(v)
join(strata,"barranco_pedras")
""" + src[i1:]

# ---- pedras (rochedos esculpidos com rachadura ciano) e pinheiros de 4 camadas ----
i0 = src.index("    elif i%5==4:   # pedra com veio")
i1 = src.index("# sakuras extras no platô do templo")
src = src[:i0] + """    elif i%4==1:   # rochedo esculpido com rachadura neon
        s=random.uniform(0.7,1.6)
        r=prim('ico','pedra',loc=(0,0,0.32*s),scale=(s,s*0.85,s*0.8),m=PE,radius=0.9,subdivisions=2)
        sd=Vector((random.random()*9,random.random()*9,random.random()*9))
        for v in r.data.vertices: v.co*=1+0.22*noise.noise(v.co*1.6+sd)
        parts=[r]
        z=0.3*s; x=-0.25*s
        for k in range(3):
            x2=x+0.2*s; z2=z+random.uniform(-0.12,0.16)*s
            parts.append(bar('rachadura',(x,-0.86*s,z),(x2,-0.86*s,z2),0.022,CY))
            x,z=x2,z2
        for o in parts: place(o,n,sink=0.25,face=f); rocks.append(o)
    else:   # pinheiro facetado de 4 camadas com traços neon
        s=random.uniform(0.85,1.45)
        ps=[prim('cyl','tronco',loc=(0,0,0.4*s),m=MA,radius=0.16*s,depth=0.8*s,vertices=6)]
        tiers=((1.05,1.05,1.1),(1.65,0.86,1.0),(2.2,0.66,0.9),(2.7,0.44,0.8))
        for ti,(z,r,dh) in enumerate(tiers):
            c=prim('cone','copa',loc=(0,0,z*s),m=FO,radius1=r*s,radius2=0.04*s,depth=dh*s,vertices=8)
            for v in c.data.vertices:
                if v.co.z<0: v.co.x*=1+random.uniform(-0.1,0.1); v.co.y*=1+random.uniform(-0.1,0.1); v.co.z+=random.uniform(-0.06,0.06)
            ps.append(c)
            if (ti+i)%2==0:
                a=random.uniform(0,2*math.pi)
                ps.append(B('traco',(math.cos(a)*r*0.9*s,math.sin(a)*r*0.9*s,(z-dh/2+0.07)*s),(0.2*r*s,0.022,0.018),CY,rot=(0,0,a+math.pi/2)))
        for o in ps: place(o,n,face=f,sink=0.05); trees.append(o)
""" + src[i1:]
rep("while len(spots)<66 and tries<12000:", "while len(spots)<104 and tries<16000:")
rep("    if ok_spot(n) and all(arc(n,s)>2.6 for s in spots): spots.append(n)",
    "    if ok_spot(n) and all(arc(n,s)>2.2 for s in spots): spots.append(n)")

# ---- arbustos + samambaias ----
rep("""for n in bsp:
    s=random.uniform(0.3,0.55)
    b=prim('ico','arbusto',loc=(0,0,0.15*s),scale=(s,s,s*0.7),m=FO,radius=1,subdivisions=1); place(b,n,sink=0.05); bushes.append(b)
""", """for bi,n in enumerate(bsp):
    s=random.uniform(0.3,0.55)
    if bi%2:
        b=prim('ico','arbusto',loc=(0,0,0.15*s),scale=(s,s,s*0.7),m=FO,radius=1,subdivisions=1); place(b,n,sink=0.05); bushes.append(b)
    else:   # samambaia: folhas finas abertas em leque
        for k in range(6):
            a=2*math.pi*k/6+random.uniform(-0.3,0.3)
            lf=prim('cone','samambaia',loc=(0,0,0),m=FO,radius1=0.07,radius2=0.0,depth=0.7*s+0.25,vertices=3)
            bpy.context.view_layer.update()
            lf.matrix_world=Matrix.Rotation(a,4,'Z')@Matrix.Rotation(0.75,4,'X')@Matrix.Translation((0,0,(0.7*s+0.25)/2))@lf.matrix_world
            place(lf,n,sink=0.03,face=Vector((0,0,1))); bushes.append(lf)
""")
rep("while len(bsp)<80 and tries<12000:", "while len(bsp)<150 and tries<20000:")
rep("    if ok_spot(n,pad=0.8) and all(arc(n,s)>1.3 for s in spots+bsp): bsp.append(n)",
    "    if ok_spot(n,pad=0.8) and all(arc(n,s)>1.05 for s in spots+bsp): bsp.append(n)")

# ---- pétalas + lanternas tōrō ----
rep('join(trees,"arvores"); join(saks,"sakuras"); join(rocks,"pedras"); join(bushes,"arbustos")', """petals=[]
for o in list(saks):
    if o.name.startswith('sk_tronco'):
        bpy.context.view_layer.update(); base=o.matrix_world.translation.copy(); nn=base.normalized()
        for k in range(7):
            p=B('petala',(0,0,0),(0.06,0.04,0.008),SK,rot=(random.random()*3,random.random()*3,0))
            nd=offset(nn,rnd().cross(nn).normalized(),random.uniform(0.6,2.2))
            place(p,nd,lift=random.uniform(0.1,2.4)); petals.append(p)
saks+=petals
def toro(n,face,h=None,s=1.0):
    out=[B('toro_base',(0,0,0.1*s),(0.3*s,0.3*s,0.1*s),PE,bev=0.02),
         B('toro_base2',(0,0,0.25*s),(0.2*s,0.2*s,0.05*s),PE),
         prim('cyl','toro_poste',loc=(0,0,0.58*s),m=PE,radius=0.1*s,depth=0.62*s,vertices=8),
         B('toro_linha',(0,-0.105*s,0.58*s),(0.012,0.004,0.22*s),CY),
         B('toro_plat',(0,0,0.92*s),(0.27*s,0.27*s,0.04*s),PE),
         B('toro_luz',(0,0,1.12*s),(0.17*s,0.17*s,0.16*s),LZ)]
    for dx,dy in ((-1,-1),(1,-1),(-1,1),(1,1)): out.append(B('toro_col',(dx*0.18*s,dy*0.18*s,1.12*s),(0.03*s,0.03*s,0.17*s),PE))
    out.append(prim('cone','toro_teto',loc=(0,0,1.44*s),rot=(0,0,math.pi/4),m=PE,radius1=0.46*s,radius2=0.05*s,depth=0.3*s,vertices=4))
    out.append(B('toro_beiral',(0,-0.33*s,1.3*s),(0.33*s,0.008,0.012),NE,rot=(0,0,0)))
    out.append(prim('uv','toro_joia',loc=(0,0,1.64*s),m=PE,radius=0.06*s,segments=8,ring_count=5))
    for o in out: place(o,n,face=face,h=h)
    return out
lant=[]
for sx in (-1,1):   # pé da escadaria e caminho até o spawn
    for al in (STAIR_B+0.9,STAIR_B+4.2):
        n=offset(offset(TEMPLO,TFWD,al),TEAST,sx*(STAIR_W+1.0)); lant+=toro(n,POLE)
for ang in (40,160,280):   # lago
    t=tangent(LAGO,POLE); t=(t*math.cos(math.radians(ang))+t.cross(LAGO)*math.sin(math.radians(ang))).normalized()
    n=offset(LAGO,t,LAGO_R+1.3)
    if arc(n,TEMPLO)>PLAT_R+2.6: lant+=toro(n,LAGO,s=0.9)
for i,lon in enumerate(HIST_LON):   # trilha da história
    n=D(TRAIL_LAT-2.6,lon+9); lant+=toro(n,D(TRAIL_LAT,lon+9),s=0.8)
join(lant,"lanternas")
join(trees,"arvores"); join(saks,"sakuras"); join(rocks,"pedras"); join(bushes,"arbustos")""")

# ---- rochas flutuantes com cristais ----
rep("""    if k%3==0:
        c=B('veio_fl',(0,0,0),(0.03,0.03,0.45*s),CY); bpy.context.view_layer.update()""",
"""    if k%2==1:
        c=prim('cone','cristal',loc=(0,0,0),m=CY,radius1=0.22,radius2=0.0,depth=0.8,vertices=4); bpy.context.view_layer.update()
        c.matrix_world=r.matrix_world@Matrix.Translation((0,0,0.95))@Matrix.Diagonal((1/s,1/(s*0.85),1/(s*1.2),1))@Matrix.Diagonal((s,s,s,1))@Matrix.Translation((0,0,0.35)); fl.append(c)
    if k%3==0:
        c=B('veio_fl',(0,0,0),(0.03,0.03,0.45*s),CY); bpy.context.view_layer.update()""")
rep("for k in range(24):\n    while True:", "for k in range(30):\n    while True:")

# ---- frisos da escada mais grossos ----
rep("ln=B('neon',(0,-tread/2-0.005,-0.035),(STAIR_W*0.85,0.006,0.012),NE)","ln=B('neon',(0,-tread/2-0.012,-0.05),(STAIR_W*0.9,0.012,0.03),NE)")
rep("n=offset(offset(TEMPLO,TFWD,al),TEAST,sx*(STAIR_W+1.0)); lant+=toro(n,POLE)","n=offset(offset(TEMPLO,TFWD,al),TEAST,sx*(STAIR_W+1.1)); lant+=toro(n,POLE,s=1.3)")

# ================= correções de lógica do mapa (V3.1) =================
# 1) Trilhas: escadaria do templo -> spawn -> rua da praça, e spawn -> vila.
rep("""def rough_ok(n):
    if arc(n,POLE)<5.5""", """def _polar(r,lon):
    return D(90-math.degrees(r/R0),lon)
def _path(a,b,wig,seg):
    # a,b=(dist ao polo em m, longitude em graus); espiral em volta do spawn
    (r0,l0),(r1,l1)=a,b
    dl=((l1-l0+180)%360)-180
    pts=[]
    for i in range(seg+1):
        t=i/seg; r=r0+(r1-r0)*t; lon=l0+dl*t
        lon+=math.degrees(wig*math.sin(t*math.pi*2)/max(r,1.0))
        pts.append(_polar(r,lon))
    return pts
_TL=math.degrees(math.atan2(TEMPLO.y,TEMPLO.x)); _SL=math.degrees(math.atan2(SERV.y,SERV.x)); _VL=math.degrees(math.atan2(VILA.y,VILA.x))
_ARC_T=R0*POLE.angle(TEMPLO); _ARC_S=R0*POLE.angle(SERV); _ARC_V=R0*POLE.angle(VILA)
def _pol(v):
    v=v.normalized(); return (R0*POLE.angle(v), math.degrees(math.atan2(v.y,v.x)))
_A=_pol(offset(TEMPLO,TFWD,STAIR_B-0.05))      # rente ao último degrau
_E=_pol(local(SERV,POLE,0,12.35))              # começa na calçada do fim da rua (a rua usa deslocamento plano)
_A2=(max(_A[0]-1.1,1.4),_A[1])                  # sai reto da escada
PATHS=[_path(_A,_A2,0.0,3)+_path(_A2,(2.3,_TL+70),0.25,10)[1:]+_path((2.3,_TL+70),_E,0.6,20)[1:],
       _path((1.6,_VL),(_ARC_V-2.2,_VL),0.9,26)]
PATH_PTS=[q for P in PATHS for q in P]
def near_path(n,pad):
    return any(arc(n,q)<pad for q in PATH_PTS)
def rough_ok(n):
    if near_path(n,2.2): return 0.0
    if arc(n,POLE)<5.5""")
rep("""def ok_spot(n,pad=1.2):
    if arc(n,POLE)<5""", """def ok_spot(n,pad=1.2):
    if near_path(n,1.6+pad*0.3): return False
    if arc(n,POLE)<5""")
# terreno plano ao longo das trilhas (a fita fica rente ao chão)
rep("""    for c,r in ((LAGO,LAGO_R),(RASA,RASA_R)): m=min(m, smooth((arc(n,c)-r-0.8)/2.2))
""", """    for c,r in ((LAGO,LAGO_R),(RASA,RASA_R)): m=min(m, smooth((arc(n,c)-r-0.8)/2.2))
    if 'PATH_PTS' in globals(): m=min(m, smooth((min(arc(n,q) for q in PATH_PTS)-1.3)/1.8))
""")
rep("    for al in (STAIR_B+0.9,STAIR_B+4.2):","    for al in (STAIR_B+0.9,):")
# fita de terra com pedras de borda (chão caminhável: nome começa com 'trilha')
rep('join(lant,"lanternas")', r"""def ribbon(P,half,lift,name,m):
    bm=bmesh.new(); rows=[]
    for i,n in enumerate(P):
        nb=P[min(i+1,len(P)-1)]; na=P[max(i-1,0)]
        tdir=(nb-na); tdir=(tdir-n*tdir.dot(n)).normalized(); side=tdir.cross(n).normalized()
        row=[]
        for sd in (-half,half):
            q=(n*R0+side*sd).normalized(); row.append(bm.verts.new(q*(R0+max(height(q),0)+lift)))
        rows.append(row)
    for i in range(len(rows)-1):
        a,b=rows[i],rows[i+1]; bm.faces.new((a[0],b[0],b[1],a[1]))
    bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
    for f_ in bm.faces:
        if f_.normal.dot(f_.calc_center_median().normalized())<0: f_.normal_flip()
    me=bpy.data.meshes.new(name); bm.to_mesh(me); bm.free()
    o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o); setmat(o,m)
    for f_ in o.data.polygons: f_.use_smooth=False
    return link(o)
ribbon(PATHS[0],0.75,0.05,"trilha_templo",PE); ribbon(PATHS[1],0.7,0.05,"trilha_spawn_vila",PE)
# fim da rua: calçada de concreto com meio-fio; o caminho de pedra sai dela
_fr=[]
_nf=local(SERV,POLE,0,12.05); _hf=max(height(_nf),0)
_fr.append(B('fim_calcada',(0,0,0.045),(2.7,0.62,0.09),CO)); _fr.append(B('fim_meiofio',(0,0.64,0.07),(2.7,0.05,0.1),BR))
for o in _fr: place(o,_nf,face=PF,h=_hf)
join(_fr,"piso_fim_rua")
bm=bmesh.new(); NR=24; ring=[]
cen=bm.verts.new(POLE*(R0+max(height(POLE),0)+0.045))
for k in range(NR):
    a=2*math.pi*k/NR; q=D(90-math.degrees(2.4/R0),math.degrees(a)); ring.append(bm.verts.new(q*(R0+max(height(q),0)+0.045)))
for k in range(NR): bm.faces.new((cen,ring[k],ring[(k+1)%NR]))
bmesh.ops.recalc_face_normals(bm,faces=bm.faces)
for f_ in bm.faces:
    if f_.normal.dot(f_.calc_center_median().normalized())<0: f_.normal_flip()
me=bpy.data.meshes.new("trilha_spawn"); bm.to_mesh(me); bm.free()
_sp=bpy.data.objects.new("trilha_spawn",me); bpy.context.scene.collection.objects.link(_sp); setmat(_sp,PE)
for f_ in _sp.data.polygons: f_.use_smooth=False
link(_sp)
LANT_PTS=[offset(offset(TEMPLO,TFWD,STAIR_B+0.9),TEAST,sx*(STAIR_W+1.1)) for sx in (-1,1)]
def lant_ok(q):
    if arc(q,SERV)<11.8 or arc(q,POLE)<3.0 or in_corridor(q,1.2) or arc(q,TEMPLO)<PLAT_R+2.4: return False
    if min(arc(q,p_) for p_ in PATH_PTS)<1.3: return False
    if any(arc(q,l)<3.0 for l in LANT_PTS): return False
    for c,rr in ((LAGO,LAGO_R),(RASA,RASA_R)):
        if arc(q,c)<rr+0.8: return False
    return True
edge=[]
random.seed(33)
for P in PATHS:
    for i in range(1,len(P)-1):
        n=P[i]; tdir=(P[i+1]-P[i-1]); tdir=(tdir-n*tdir.dot(n)).normalized(); side=tdir.cross(n).normalized()
        for sd in (-1,1):
            if random.random()<0.55:
                q=(n*R0+side*sd*random.uniform(0.95,1.15)).normalized(); sz=random.uniform(0.14,0.26)
                if arc(q,SERV)<10.9 or arc(q,POLE)<2.6 or in_corridor(q,0.4) or min(arc(q,p_) for p_ in PATH_PTS)<0.8: continue
                o=prim('ico','borda',loc=(0,0,0.03),scale=(sz*1.4,sz,sz*0.5),m=PE,radius=1,subdivisions=1); place(o,q,sink=0.04,h=max(height(q),0)); edge.append(o)
    for i in range(3,len(P)-2,5):   # lanternas ao longo do caminho, alternando os lados
        n=P[i]; tdir=(P[i+1]-P[i-1]); tdir=(tdir-n*tdir.dot(n)).normalized(); side=tdir.cross(n).normalized()
        sd=1 if (i//5)%2 else -1
        q=(n*R0+side*sd*1.8).normalized()
        if lant_ok(q): LANT_PTS.append(q); lant+=toro(q,n,s=0.85)
join(edge,"trilha_bordas")
join(lant,"lanternas")""")
# 2) Postes: fios só entre postes de verdade (novos postes no fim da rua), nada solto no ar.
rep("""for zz in (4.72,4.45):
    props+=wire(poles[0],poles[1],zz,zz)
    props+=wire(poles[0],pp(-4.5,9.5),zz,4.6-(4.72-zz)); props+=wire(poles[1],pp(4.5,9.5),zz,4.6-(4.72-zz))
    props+=wire(poles[0],heading_pt(-70,7.4),zz,3.6); props+=wire(poles[1],heading_pt(70,7.4),zz,3.6)""",
"""poles2=[]
for sx in (-1,1):
    n=pp(sx*2.45,10.6)
    for o in (prim('cyl','poste',loc=(0,0,2.6),m=CO,radius=0.11,depth=5.2,vertices=8),
              B('cruzeta',(0,0,4.7),(0.9,0.05,0.05),MA)):
        place(o,n,face=SERV,h=max(height(n),0)); props.append(o)
    poles2.append(n)
for zz in (4.72,4.45):
    props+=wire(poles[0],poles[1],zz,zz)
    props+=wire(poles[0],poles2[0],zz,zz,sag=0.45); props+=wire(poles[1],poles2[1],zz,zz,sag=0.45)""")

# ================= física: bloqueios invisíveis (V3.2) =================
rep("POLE=Vector((0,0,1))\n", "POLE=Vector((0,0,1))\nBLOQ=[]   # (direção, raio em m) de cada obstáculo sólido\n")
# pinheiros e rochedos (código inserido pelo V3)
rep("        for o in parts: place(o,n,sink=0.25,face=f); rocks.append(o)\n",
    "        for o in parts: place(o,n,sink=0.25,face=f); rocks.append(o)\n        BLOQ.append((n,0.85*s))\n")
rep("        for o in ps: place(o,n,face=f,sink=0.05); trees.append(o)\n",
    "        for o in ps: place(o,n,face=f,sink=0.05); trees.append(o)\n        BLOQ.append((n,0.42*s))\n")
# sakuras (v2): espalhadas e no platô
rep("        for o in ps: place(o,n,face=f,sink=0.05); saks.append(o)\n",
    "        for o in ps: place(o,n,face=f,sink=0.05); saks.append(o)\n        BLOQ.append((n,0.3*s))\n")
rep("    for o in ps: place(o,n,face=POLE,sink=0.05,h=PLAT_H); saks.append(o)\n",
    "    for o in ps: place(o,n,face=POLE,sink=0.05,h=PLAT_H); saks.append(o)\n    BLOQ.append((n,0.3))\n")
# lanternas
rep("    for o in out: place(o,n,face=face,h=h)\n    return out\n",
    "    for o in out: place(o,n,face=face,h=h)\n    BLOQ.append((n,0.34*s))\n    return out\n")
# praça: postes, máquina, banco, vasos, placa
rep("    poles.append(n)\n", "    poles.append(n); BLOQ.append((n,0.2))\n")
rep("    poles2.append(n)\n", "    poles2.append(n); BLOQ.append((n,0.2))\n")
rep("""n=heading_pt(-32,5.3)
""", """n=heading_pt(-32,5.3); BLOQ.append((n,0.55))
""")
rep("""n=heading_pt(-47,4.5)
""", """n=heading_pt(-47,4.5); BLOQ.append((n,0.6))
""")
rep("""for deg in (84,132,180,228,276):
    n=heading_pt(deg,6.4)
""", """for deg in (84,132,180,228,276):
    n=heading_pt(deg,6.4); BLOQ.append((n,0.35))
""")
rep("""n=heading_pt(40,4.35)
""", """n=heading_pt(40,4.35); BLOQ.append((n,0.12))
""")
# monta os meshes de bloqueio no fim (antes da lista de objetos)
rep("PLANET_OBJS=[o.name for o in objs]", """bq=[]
for n_,r_ in BLOQ:
    c_=prim('cyl','bq',loc=(0,0,1.2),m=PE,radius=r_,depth=3.0,vertices=8); place(c_,n_,face=POLE,h=max(height(n_),0)-0.8); bq.append(c_)
j1=join(bq,"bloqueio_decor")
# barranco do templo: parede em volta do platô, aberta só na escadaria
wall=[]
NW=72; RW=PLAT_R+0.75
for k in range(NW):
    ang=2*math.pi*(k+0.5)/NW; t=(TFWD*math.cos(ang)+TEAST*math.sin(ang))
    n_=offset(TEMPLO,t,RW)
    if in_corridor(n_,0.2): continue
    w_=B('parede',(0,0,1.0),(math.pi*RW/NW+0.06,0.8,1.8),PE); place(w_,n_,face=n_-t,h=0.0); wall.append(w_)
# muretas da escadaria (não dá para sair pelos lados da escada)
al=STAIR_A-0.4
while al<STAIR_B+0.2:
    for sx in (-1,1):
        n_=offset(offset(TEMPLO,TFWD,al),TEAST,sx*(STAIR_W+0.32))
        c_=prim('cyl','mureta_bq',loc=(0,0,1.2),m=PE,radius=0.25,depth=3.0,vertices=6); place(c_,n_,face=POLE,h=max(height(n_),0)-0.8); wall.append(c_)
    al+=0.4
j2=join(wall,"bloqueio_barranco")
for o_ in (j1,j2): o_.display_type='WIRE'; o_.hide_render=True
PLANET_OBJS=[o.name for o in objs]""")

open(os.path.join(H, "v3", "_planeta3.py"), "w", encoding="utf-8").write(src)
