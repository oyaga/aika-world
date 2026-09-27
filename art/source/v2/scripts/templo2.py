
clear()
PD=mat("Pedra","#9C9A8E"); MD=mat("Madeira","#6B4A34"); OR=mat("Pilar","#FF5A02"); SJ=mat("Shoji","#EFE6CF")
TL=mat("Telhado","#2F2A44"); BR=mat("Brilho@unlit","#FF5A02",emit=True); CY=mat("Ciano@unlit","#5CE1E6",emit=True)
LZ=mat("Luz@unlit","#FFD9A0",emit=True); GD=mat("Dourado","#E0A92E"); SK=mat("Sakura","#F4A6C0")
P=[]
def a(o): P.append(o); return o
def box(n,c,s,m,rot=(0,0,0),bev=0):
    o=a(prim('cube',n,loc=c,scale=s,m=m,rot=rot))
    if bev: mo=o.modifiers.new("b",'BEVEL'); mo.width=bev; mo.segments=1
    return o
CY_=0.35  # centro do corpo do templo em y
# ---- plataforma de blocos ----
PH=0.7
box('plinto',(0,0,PH/2),(2.7,2.35,PH/2),PD,bev=0.04)
box('plinto_topo',(0,0,PH+0.03),(2.78,2.43,0.03),PD,bev=0.015)
for x in (-2.0,-1.0,0.0,1.0,2.0):   # juntas dos blocos (relevo)
    for y in (-2.36,2.36): box('junta',(x,y,PH*0.5),(0.012,0.012,PH*0.45),MD)
for y in (-1.5,-0.5,0.5,1.5):
    for x in (-2.71,2.71): box('junta',(x,y,PH*0.5),(0.012,0.012,PH*0.45),MD)
for y in (-2.37,2.37): box('neon_base',(0,y,PH-0.08),(2.5,0.012,0.018),BR)
for x in (-2.72,2.72): box('neon_base',(x,0,PH-0.08),(0.012,2.2,0.018),CY)
# escadaria (4 degraus) até y=-2.82
for i in range(4):
    top=PH*(i+1)/4; y=-2.35-0.13*(3-i)-0.065
    box('degrau',(0,y,top/2),(1.0,0.068,top/2),PD,bev=0.01)
    box('degrau_luz',(0,y-0.07,top-0.03),(0.85,0.008,0.012),BR)
for x in (-1.08,1.08): box('guarda_escada',(x,-2.55,PH*0.55),(0.08,0.3,PH*0.55),PD,bev=0.02)
# ---- corpo ----
Z0=PH+0.06
box('parede',(0,CY_,Z0+0.85),(1.7,1.3,0.85),SJ)
for x in (-1.2,1.2): box('shoji_luz',(x,CY_-1.305,Z0+0.8),(0.42,0.01,0.6),LZ)
box('porta_luz',(0,CY_-1.305,Z0+0.72),(0.44,0.01,0.7),LZ)
for x in (-1.62,-1.2,-0.78,-0.44,0,0.44,0.78,1.2,1.62): box('grade_v',(x,CY_-1.32,Z0+0.8),(0.018,0.012,0.72),MD)
for z in (0.3,0.62,0.95,1.28): box('grade_h',(0,CY_-1.32,Z0+z),(1.66,0.012,0.016),MD)
for x in (-1.9,-0.62,0.62,1.9):
    for y in (CY_-1.42,CY_+1.42):
        box('pilar',(x,y,Z0+0.9),(0.12,0.12,0.9),OR,bev=0.02)
        if y<0: box('pilar_neon',(x,y-0.125,Z0+0.9),(0.015,0.004,0.75),BR)
        box('base_pilar',(x,y,Z0+0.05),(0.16,0.16,0.05),PD)
box('viga_frente',(0,CY_-1.42,Z0+1.82),(2.05,0.11,0.1),OR)
box('viga_tras',(0,CY_+1.42,Z0+1.82),(2.05,0.11,0.1),OR)
for x in (-1.9,1.9): box('viga_lado',(x,CY_,Z0+1.82),(0.11,1.5,0.1),OR)
for x in [(-1.9+i*0.38) for i in range(11)]:   # mísulas sob o beiral
    box('misula',(x,CY_-1.55,Z0+1.95),(0.05,0.14,0.05),MD)
    box('misula',(x,CY_+1.55,Z0+1.95),(0.05,0.14,0.05),MD)
box('corredor',(0,CY_-1.8,Z0+0.02),(2.4,0.35,0.02),MD)
for x in (-1.3,1.3): box('lanterna_pend',(x,CY_-1.5,Z0+1.55),(0.1,0.1,0.14),LZ)
box('estandarte',(0.62,CY_-1.56,Z0+1.1),(0.18,0.01,0.45),TL)
a(prim('torus','brasao',loc=(0.62,CY_-1.575,Z0+1.2),rot=(math.pi/2,0,0),m=BR,major_radius=0.1,minor_radius=0.018,major_segments=12,minor_segments=4))
a(prim('cyl','brasao_c',loc=(0.62,CY_-1.575,Z0+1.2),rot=(math.pi/2,0,0),m=BR,radius=0.035,depth=0.01,vertices=8))
# corrimão lateral da varanda
for x in (-2.55,2.55):
    for y in (-2.2,-1.4,-0.6,0.2,1.0,1.8): box('corr_post',(x,y,Z0+0.28),(0.04,0.04,0.28),MD)
    box('corr_trilho',(x,-0.2,Z0+0.52),(0.035,2.05,0.03),OR); box('corr_trilho2',(x,-0.2,Z0+0.3),(0.025,2.05,0.02),MD)
# ---- telhado 1 ----
RZ1=Z0+1.98
a(roof('telhado1',2.85,2.45,RZ1,1.15,1.35,1.05,0.55,TL,BR,CY,MD,rim=0.2,center=(0,CY_),seg=8))
for o in roof_ridges(2.85,2.45,RZ1,1.15,1.35,1.05,0.55,BR,center=(0,CY_),r=0.05): a(o)
for o in roof_ribs(2.85,2.45,RZ1,1.15,1.35,1.05,0.55,TL,center=(0,CY_),n=11): a(o)
# ---- nível 2 ----
Z2=RZ1+1.15
box('corpo2',(0,CY_,Z2+0.3),(1.12,0.84,0.36),SJ)
box('janela2',(0,CY_-0.85,Z2+0.3),(0.8,0.01,0.2),LZ)
for x in (-0.6,-0.2,0.2,0.6): box('grade2',(x,CY_-0.862,Z2+0.3),(0.015,0.01,0.22),MD)
for x in (-1.08,1.08):
    for y in (CY_-0.8,CY_+0.8): box('pilar2',(x,y,Z2+0.3),(0.07,0.07,0.38),OR)
box('placa',(0,CY_-0.87,Z2+0.6),(0.3,0.012,0.09),TL); box('placa_neon',(0,CY_-0.885,Z2+0.6),(0.22,0.005,0.02),CY)
RZ2=Z2+0.7
a(roof('telhado2',2.05,1.75,RZ2,1.0,0.32,0.28,0.45,TL,BR,CY,MD,rim=0.16,center=(0,CY_),seg=8))
for o in roof_ridges(2.05,1.75,RZ2,1.0,0.32,0.28,0.45,BR,center=(0,CY_),r=0.04): a(o)
for o in roof_ribs(2.05,1.75,RZ2,1.0,0.32,0.28,0.45,TL,center=(0,CY_),n=8): a(o)
# ---- pináculo dourado ----
PZ=RZ2+1.0
for (z,r,d,m) in ((0.08,0.3,0.16,TL),(0.2,0.33,0.05,CY),(0.32,0.2,0.2,GD),(0.46,0.24,0.05,GD),(0.56,0.15,0.14,GD),(0.66,0.19,0.04,GD),(0.75,0.12,0.14,LZ),(0.85,0.16,0.04,GD)):
    a(prim('cyl','pinaculo',loc=(0,CY_,PZ+z),m=m,radius=r,depth=d,vertices=12))
a(prim('cone','pin_ponta',loc=(0,CY_,PZ+1.02),m=GD,radius1=0.07,radius2=0.0,depth=0.3,vertices=8))
a(prim('uv','pin_brilho',loc=(0,CY_,PZ+1.2),m=BR,radius=0.05,segments=8,ring_count=5))
# ---- placa holográfica (lado esquerdo da escada) ----
box('holo_pe',(-2.05,-1.95,Z0+0.32),(0.05,0.05,0.32),MD)
box('holo_base',(-2.05,-1.95,Z0+0.02),(0.16,0.16,0.03),PD)
box('holo_moldura',(-2.05,-1.95,Z0+0.95),(0.52,0.025,0.38),CY)
box('holo_tela',(-2.05,-1.98,Z0+0.95),(0.47,0.01,0.33),TL)
a(prim('torus','holo_emblema',loc=(-2.05,-1.995,Z0+0.97),rot=(math.pi/2,0,0),m=CY,major_radius=0.15,minor_radius=0.02,major_segments=12,minor_segments=3))
for k in range(6):
    an=k*math.pi/3; a(prim('uv','holo_petala',loc=(-2.05+math.cos(an)*0.08,-1.995,Z0+0.97+math.sin(an)*0.08),m=CY,radius=0.035,segments=6,ring_count=4))
box('holo_linha',(-2.05,-1.995,Z0+0.72),(0.3,0.005,0.012),CY)
# ---- bandeira ----
box('mastro',(2.35,1.95,Z0+1.6),(0.04,0.04,1.6),MD)
box('mastro_topo',(2.35,1.95,Z0+3.22),(0.06,0.06,0.03),BR)
box('bandeira',(2.35,1.95,Z0+2.45),(0.02,0.36,0.72),TL)
a(prim('torus','band_brasao',loc=(2.328,1.95,Z0+2.6),rot=(0,math.pi/2,0),m=BR,major_radius=0.17,minor_radius=0.025,major_segments=12,minor_segments=4))
box('band_borda',(2.33,1.95,Z0+1.75),(0.02,0.36,0.02),BR)
# ---- lanternas de pedra (chão) ----
for x in (-2.4,2.4):
    y=-3.45
    box('lant_base',(x,y,0.1),(0.34,0.34,0.1),PD,bev=0.02)
    box('lant_base2',(x,y,0.26),(0.24,0.24,0.06),PD)
    a(prim('cyl','lant_poste',loc=(x,y,0.62),m=PD,radius=0.12,depth=0.62,vertices=8))
    box('lant_linha',(x,y-0.125,0.62),(0.015,0.004,0.24),CY)
    box('lant_plat',(x,y,0.98),(0.3,0.3,0.045),PD)
    box('lant_luz',(x,y,1.2),(0.19,0.19,0.18),LZ)
    for dx,dy in ((-1,-1),(1,-1),(-1,1),(1,1)): box('lant_col',(x+dx*0.2,y+dy*0.2,1.2),(0.035,0.035,0.19),PD)
    a(prim('cone','lant_teto',loc=(x,y,1.55),rot=(0,0,math.pi/4),m=PD,radius1=0.52,radius2=0.05,depth=0.34,vertices=4))
    a(prim('uv','lant_joia',loc=(x,y,1.78),m=PD,radius=0.07,segments=8,ring_count=5))
# ---- torii ----
TY=-4.8
for x in (-1.45,1.45):
    a(prim('cyl','torii_pilar',loc=(x,TY,1.72),m=OR,radius=0.17,depth=3.35,vertices=12))
    box('torii_neon',(x,TY-0.172,1.6),(0.018,0.004,1.25),BR)
    a(prim('cyl','torii_base',loc=(x,TY,0.2),m=TL,radius=0.22,depth=0.4,vertices=12))
    a(prim('cyl','torii_anel',loc=(x,TY,0.42),m=TL,radius=0.19,depth=0.05,vertices=12))
a(beam('kasagi',4.7,0.14,0.22,3.58,TY,0.35,TL,segs=10))
a(beam('shimaki',4.2,0.09,0.17,3.36,TY,0.2,OR,segs=10))
a(beam('nuki',3.7,0.08,0.1,2.75,TY,0.0,OR,segs=2))
box('gakuzuka',(0,TY,3.05),(0.3,0.07,0.24),TL)
box('placa_borda',(0,TY-0.075,3.05),(0.26,0.005,0.2),BR)
box('placa_centro',(0,TY-0.08,3.05),(0.22,0.005,0.16),TL)
for (dz,sx,sz) in ((0.08,0.1,0.012),(0.0,0.012,0.09),(-0.06,0.08,0.012),(0.03,0.06,0.01)): box('glifo',(0,TY-0.086,3.05+dz),(sx,0.004,sz),BR)
# ---- sakuras ----
for (x,y,s) in ((3.3,1.3,1.05),(-3.3,1.9,0.9)):
    a(prim('cyl','tronco',loc=(x,y,0.75*s),m=MD,radius=0.11*s,depth=1.5*s,vertices=6))
    a(bar('galho',(x,y,1.2*s),(x+0.45*s,y+0.2*s,1.65*s),0.05*s,MD))
    a(bar('galho',(x,y,1.3*s),(x-0.4*s,y-0.1*s,1.7*s),0.05*s,MD))
    for (dx,dy,dz,r) in ((0,0,1.85,0.7),(0.5,0.25,1.65,0.5),(-0.45,-0.1,1.7,0.48),(0.1,0.35,2.25,0.45),(-0.2,-0.3,2.15,0.4)):
        a(prim('ico','copa',loc=(x+dx*s,y+dy*s,dz*s),m=SK,radius=r*s,subdivisions=2))
apply_all([o for o in P])
bpy.ops.object.select_all(action='DESELECT')
for o in P:
    o.select_set(True)
bpy.context.view_layer.objects.active=P[0]
for o in P:
    for mo in list(o.modifiers):
        bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mo.name)
bpy.context.view_layer.objects.active=P[0]; bpy.ops.object.join()
T=bpy.context.active_object; T.name="templo"; T.data.name="templo"
