
def _assemble(P,name):
    apply_all(P)
    for o in P:
        for mo in list(o.modifiers):
            bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mo.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in P: o.select_set(True)
    bpy.context.view_layer.objects.active=P[0]; bpy.ops.object.join()
    o=bpy.context.active_object; o.name=name; o.data.name=name
    bpy.ops.object.mode_set(mode='EDIT'); bpy.ops.mesh.select_all(action='SELECT'); bpy.ops.mesh.normals_make_consistent(inside=False); bpy.ops.object.mode_set(mode='OBJECT')
    return o
def correio():
    clear(); P=[]
    VI=mat("Vinho","#8E2F3C"); VI2=mat("VinhoEscuro","#6E2230"); PL=mat("Placa","#F2EEE2"); CO=mat("Concreto","#9C9A8E"); ES=mat("Escuro","#1E1A24"); ST=mat("Estrela","#E0A92E")
    def a(o): P.append(o); return o
    a(prim('cube','base',loc=(0,0,0.06),scale=(0.3,0.3,0.06),m=CO))
    a(prim('cyl','pe',loc=(0,0,0.2),m=VI2,radius=0.17,depth=0.2,vertices=16))
    a(prim('cyl','corpo',loc=(0,0,0.78),m=VI,radius=0.24,depth=0.98,vertices=20))
    a(prim('cyl','anel',loc=(0,0,1.28),m=VI2,radius=0.255,depth=0.04,vertices=20))
    a(prim('uv','topo',loc=(0,0,1.3),scale=(1,1,0.55),m=VI,radius=0.25,segments=20,ring_count=10))
    for z in (1.05,0.88):
        a(prim('cube','fenda_moldura',loc=(0,-0.235,z),scale=(0.12,0.02,0.03),m=VI2)); a(prim('cube','fenda',loc=(0,-0.25,z),scale=(0.1,0.01,0.012),m=ES))
    a(prim('cube','placa',loc=(0,-0.24,0.62),scale=(0.13,0.01,0.12),m=PL))
    a(prim('cube','portinhola',loc=(0,-0.237,0.36),scale=(0.13,0.012,0.1),m=VI2))
    a(prim('cube','fechadura',loc=(0.09,-0.252,0.36),scale=(0.012,0.006,0.02),m=ES))
    a(prim('cone','estrela',loc=(0,-0.235,1.36),rot=(math.pi/2,0,0),m=ST,radius1=0.07,radius2=0.0,depth=0.02,vertices=5))
    a(prim('cube','bandeira_haste',loc=(0.27,0,1.0),scale=(0.012,0.012,0.18),m=ES))
    a(prim('cube','bandeira',loc=(0.33,0,1.12),scale=(0.06,0.006,0.04),m=ST))
    return _assemble(P,"correio")
def casa():
    clear(); P=[]
    PA=mat("Parede@tint","#E9D8A6"); CO=mat("Concreto","#9C9A8E"); MA=mat("Madeira","#8A5A3B"); TL=mat("Telhado","#2F2A44")
    VD=mat("Vidro","#2B4A5E"); LZ=mat("Luz@unlit","#FFD9A0",emit=True); MT=mat("Metal","#B9B6A8"); FO=mat("Folha","#4E8F55"); ES=mat("Escuro","#1E1A24")
    def a(o): P.append(o); return o
    def box(n,c,s,m,rot=(0,0,0),bev=0):
        o=a(prim('cube',n,loc=c,scale=s,m=m,rot=rot))
        if bev: mo=o.modifiers.new("b",'BEVEL'); mo.width=bev; mo.segments=1
        return o
    box('base',(0,0,0.12),(1.05,1.05,0.12),CO,bev=0.02)
    box('parede',(0,0.05,1.2),(0.95,0.9,0.96),PA)
    box('rodape',(0,0.05,0.3),(0.97,0.92,0.06),MA)
    box('beiral_parede',(0,0.05,2.14),(0.98,0.93,0.04),MA)
    # telhado de duas águas
    import bmesh as _bm
    me=bpy.data.meshes.new("telhado"); bm=_bm.new()
    H0,H1,W,D=2.18,2.95,1.2,1.15
    v=[bm.verts.new(p) for p in ((-W,-D,H0),(W,-D,H0),(W,D,H0),(-W,D,H0),(-W,0,H1),(W,0,H1))]
    for f in ((0,1,5,4),(3,4,5,2),(0,4,3),(1,2,5)): bm.faces.new([v[i] for i in f])
    _bm.ops.solidify(bm,geom=bm.faces[:],thickness=0.06)
    bm.to_mesh(me); bm.free(); t=bpy.data.objects.new("telhado",me); bpy.context.scene.collection.objects.link(t); setmat(t,TL); P.append(t)
    for y in (-1.0,-0.75,-0.5,-0.25,0.25,0.5,0.75,1.0):
        z=H0+(H1-H0)*(1-abs(y)/D)+0.05
        box('telha',(0,y,z),(W+0.02,0.02,0.02),ES,rot=(math.atan2(H1-H0,D)*(1 if y<0 else -1),0,0))
    box('cumeeira',(0,0,H1+0.06),(W+0.05,0.06,0.05),MA)
    box('empena',(0,0.05,2.45),(0.9,0.02,0.2),PA)
    # frente: porta, janela acesa, varanda
    box('porta',(0.45,-0.86,0.95),(0.25,0.03,0.6),MA,bev=0.01); box('macaneta',(0.28,-0.9,0.95),(0.02,0.02,0.02),MT)
    box('janela_m',(-0.45,-0.86,1.35),(0.32,0.03,0.28),MA); box('janela',(-0.45,-0.875,1.35),(0.27,0.01,0.23),LZ)
    box('janela_div',(-0.45,-0.89,1.35),(0.01,0.01,0.23),MA); box('janela_div2',(-0.45,-0.89,1.35),(0.27,0.01,0.01),MA)
    box('varanda',(0,-1.25,0.2),(1.0,0.28,0.04),MA)
    for x in (-0.95,-0.5,0.0,0.95): box('corrimao_post',(x,-1.5,0.42),(0.03,0.03,0.2),MA)
    box('corrimao',(-0.48,-1.5,0.6),(0.5,0.025,0.025),MA)
    box('degrau',(0.45,-1.6,0.08),(0.28,0.1,0.08),CO)
    box('toldo_porta',(0.45,-1.0,1.75),(0.35,0.2,0.02),TL,rot=(-0.3,0,0))
    a(prim('cone','vaso',loc=(-0.75,-1.3,0.36),m=mat("Terracota","#C06A45"),radius1=0.1,radius2=0.14,depth=0.28,vertices=10))
    a(prim('ico','planta',loc=(-0.75,-1.3,0.62),m=FO,radius=0.2,subdivisions=1))
    box('ac',(0.95+0.12,0.3,0.9),(0.1,0.28,0.2),MT,bev=0.02); box('ac_grade',(1.18,0.3,0.9),(0.005,0.24,0.15),ES)
    box('medidor',(-1.0,-0.4,1.0),(0.04,0.1,0.14),MT)
    a(bar('cano',Vector((1.0,-0.7,0.25)),Vector((1.0,-0.7,2.1)),0.03,MT))
    box('placa_casa',(0.8,-0.9,1.7),(0.12,0.01,0.06),mat("PlacaCasa","#F2EEE2"))
    return _assemble(P,"casa")
