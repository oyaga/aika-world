
clear()
bpy.context.scene.world = bpy.context.scene.world or bpy.data.worlds.new("World")
PD=mat("PedraEscura","#4A4658"); PT=mat("PedraTopo","#6A6678"); OR=mat("Pilar","#FF5A02"); MD=mat("Madeira","#3A2A2A")
SJ=mat("Shoji","#E8DCC4"); SL=mat("ShojiLuz@unlit","#FFE3B3",emit=True); GD=mat("Grade","#4A2E1E")
TL=mat("Telhado","#25222F"); TU=mat("TelhadoBaixo","#3A2630"); BR=mat("Brilho@unlit","#FF7A1A",emit=True)
NA=mat("NeonAzul@unlit","#39D5FF",emit=True); LZ=mat("Luz@unlit","#FFD27A",emit=True); DK=mat("Escuro","#0D0A08")
PK=mat("Sakura","#FF9EC7"); PK2=mat("SakuraEscura","#F06C9B"); TR=mat("Tronco","#5A3A2E"); HO=mat("Holo@unlit","#1B5E86",emit=True)
P=[]
def a(o): P.append(o); return o
def box(n,c,s,m,rot=(0,0,0)): return a(prim('cube',n,loc=c,scale=s,m=m,rot=rot))
# plataforma
box('plinto',(0,0,0.3),(2.6,2.3,0.3),PD)
box('plinto_topo',(0,0,0.64),(2.68,2.38,0.04),PT)
for y in (-2.39,2.39): box('brilho',(0,y,0.45),(2.4,0.015,0.025),BR)
for x in (-2.69,2.69): box('brilho',(x,0,0.45),(0.015,2.1,0.025),BR)
for i,x in enumerate((-2.2,-1.5,1.5,2.2)):
    box('pedra_linha',(x,-2.305,0.2+0.15*(i%2)),(0.25,0.005,0.015),NA if i%2 else BR)
for y in (-1.6,-0.4,0.9,1.9):
    for sx in (-1,1): box('pedra_linha',(sx*2.605,y,0.22+0.12*((int(y*10))%2)),(0.005,0.22,0.015),NA)
# escadas
for i in range(3):
    top=0.2*(i+1); y=-2.38-0.17*(2-i)-0.085
    box('degrau',(0,y,top/2),(0.95,0.09,top/2),PT)
    box('degrau_luz',(0,y-0.092,top-0.05),(0.8,0.01,0.018),BR)
# corpo
box('parede',(0,0.35,1.5),(1.65,1.25,0.82),SJ)
for x in (-1.15,1.15): box('shoji_luz',(x,-0.91,1.45),(0.45,0.01,0.6),SL)
box('porta_luz',(0,-0.91,1.35),(0.42,0.01,0.68),SL)
for x in (-1.45,-0.85,-0.45,0.45,0.85,1.45): box('grade_v',(x,-0.93,1.45),(0.02,0.015,0.7),GD)
for z in (1.05,1.45,1.85): box('grade_h',(0,-0.93,z),(1.5,0.015,0.018),GD)
for x in (-1.8,-0.6,0.6,1.8):
    for y in (-1.0,1.7):
        box('pilar',(x,y,1.5),(0.11,0.11,0.84),OR)
for x in (-1.8,-0.6,0.6,1.8): box('pilar_luz',(x,-1.115,1.5),(0.02,0.005,0.7),BR)
box('viga_frente',(0,-1.0,2.3),(1.95,0.1,0.08),OR)
box('viga_tras',(0,1.7,2.3),(1.95,0.1,0.08),OR)
for x in (-1.2,1.2): box('lanterna_pend',(x,-1.1,2.05),(0.1,0.1,0.13),LZ)
box('estandarte',(0.6,-1.13,1.65),(0.16,0.01,0.4),DK)
a(prim('cyl','emblema',loc=(0.6,-1.15,1.7),rot=(math.pi/2,0,0),m=BR,radius=0.09,depth=0.01,vertices=8))
# grades laterais da varanda
for x in (-2.5,2.5):
    for y in (-2.15,-1.4,-0.6):
        box('corr_post',(x,y,0.95),(0.04,0.04,0.28),MD)
    box('corr_trilho',(x,-1.37,1.2),(0.035,0.8,0.03),OR)
    box('corr_trilho2',(x,-1.37,0.95),(0.025,0.8,0.02),MD)
# telhado 1 e 2
a(roof('telhado1',2.75,2.3,2.45,1.1,1.3,1.0,0.5,TL,BR,NA,TU,rim=0.16,center=(0,0.35)))
for o in roof_ridges(2.75,2.3,2.45,1.1,1.3,1.0,0.5,BR,center=(0,0.35)): a(o)
box('corpo2',(0,0.35,3.75),(1.1,0.82,0.3),SJ)
box('janela2',(0,-0.48,3.75),(0.8,0.01,0.2),SL)
for x in (-1.1,1.1):
    for y in (-0.45,1.15): box('pilar2',(x,y,3.75),(0.07,0.07,0.32),OR)
a(roof('telhado2',2.0,1.7,4.07,0.95,0.34,0.3,0.42,TL,BR,NA,TU,rim=0.14,center=(0,0.35)))
for o in roof_ridges(2.0,1.7,4.07,0.95,0.34,0.3,0.42,BR,center=(0,0.35),r=0.04): a(o)
# pináculo
a(prim('cyl','pin_base',loc=(0,0.35,5.1),m=DK,radius=0.3,depth=0.2,vertices=8))
a(prim('cyl','pin_anel',loc=(0,0.35,5.23),m=NA,radius=0.33,depth=0.05,vertices=8))
a(prim('cyl','pin_meio',loc=(0,0.35,5.36),m=DK,radius=0.2,depth=0.22,vertices=8))
a(prim('cyl','pin_luz',loc=(0,0.35,5.3),m=LZ,radius=0.13,depth=0.14,vertices=8))
a(prim('cyl','pin_disco',loc=(0,0.35,5.65),m=DK,radius=0.19,depth=0.06,vertices=8))
a(prim('cone','pin_ponta',loc=(0,0.35,5.82),m=BR,radius1=0.07,radius2=0.0,depth=0.32,vertices=6))
for x in (-0.55,0.55): a(prim('cyl','pin_haste',loc=(x,0.35,5.19),m=DK,radius=0.025,depth=0.3,vertices=4))
# placa holográfica
box('holo_pe',(-2.0,-1.95,0.9),(0.05,0.05,0.24),DK)
box('holo_moldura',(-2.0,-1.95,1.5),(0.5,0.03,0.36),NA)
box('holo_tela',(-2.0,-1.99,1.5),(0.45,0.01,0.31),HO)
a(prim('torus','holo_emblema',loc=(-2.0,-2.01,1.52),rot=(math.pi/2,0,0),m=NA,major_radius=0.16,minor_radius=0.025,major_segments=8,minor_segments=3))
# bandeira
box('mastro',(2.35,1.95,2.3),(0.04,0.04,1.65),MD)
box('mastro_topo',(2.35,1.95,3.97),(0.06,0.06,0.03),BR)
box('bandeira',(2.35,1.95,3.1),(0.02,0.35,0.7),DK)
a(prim('cyl','band_emblema',loc=(2.33,1.95,3.3),rot=(0,math.pi/2,0),m=BR,radius=0.18,depth=0.01,vertices=8))
box('band_borda',(2.34,1.95,2.41),(0.02,0.35,0.02),BR)
# lanternas de pedra
for x in (-2.35,2.35):
    box('lant_base',(x,-3.35,0.12),(0.32,0.32,0.12),PD)
    box('lant_poste',(x,-3.35,0.62),(0.12,0.12,0.4),PD)
    box('lant_linha',(x,-3.475,0.62),(0.02,0.005,0.3),NA)
    box('lant_plat',(x,-3.35,1.05),(0.3,0.3,0.04),PT)
    box('lant_luz',(x,-3.35,1.28),(0.2,0.2,0.2),LZ)
    for dx,dy in ((-1,-1),(1,-1),(-1,1),(1,1)): box('lant_col',(x+dx*0.2,-3.35+dy*0.2,1.28),(0.035,0.035,0.2),PD)
    a(prim('cone','lant_teto',loc=(x,-3.35,1.64),rot=(0,0,math.pi/4),m=PD,radius1=0.5,radius2=0.04,depth=0.34,vertices=4))
    a(prim('cone','lant_topo',loc=(x,-3.35,1.87),m=PD,radius1=0.07,radius2=0.0,depth=0.16,vertices=4))
# torii a 4,8 m
for x in (-1.4,1.4):
    a(prim('cyl','torii_pilar',loc=(x,-4.8,1.7),m=OR,radius=0.16,depth=3.3,vertices=8))
    box('torii_luz',(x,-4.965,1.6),(0.02,0.005,1.2),BR)
    a(prim('cyl','torii_base',loc=(x,-4.8,0.18),m=DK,radius=0.21,depth=0.36,vertices=8))
a(beam('kasagi',4.4,0.13,0.2,3.5,-4.8,0.3,DK))
a(beam('shimaki',4.0,0.08,0.16,3.29,-4.8,0.18,OR))
box('nuki',(0,-4.8,2.72),(1.85,0.1,0.08),OR)
box('gakuzuka',(0,-4.8,3.0),(0.28,0.07,0.22),DK)
box('placa_borda',(0,-4.875,3.0),(0.24,0.005,0.18),BR)
box('placa_centro',(0,-4.88,3.0),(0.2,0.005,0.14),DK)
a(prim('torus','placa_emblema',loc=(0,-4.888,3.0),rot=(math.pi/2,0,0),m=BR,major_radius=0.08,minor_radius=0.015,major_segments=8,minor_segments=3))
# sakuras
for (x,y,s) in ((3.25,1.4,1.0),(-3.2,1.9,0.85)):
    a(prim('cyl','sak_tronco',loc=(x,y,0.7*s),m=TR,radius=0.1*s,depth=1.4*s,vertices=5))
    for (dx,dy,dz,r,mm) in ((0,0,1.6,0.65,PK),(0.4,0.2,1.35,0.45,PK2),(-0.35,-0.15,1.4,0.45,PK),(0.05,0.3,1.95,0.4,PK2)):
        a(prim('ico','sak_copa',loc=(x+dx*s,y+dy*s,dz*s),m=mm,radius=r*s,subdivisions=1))
apply_all(P)
bpy.ops.object.select_all(action='DESELECT')
for o in P: o.select_set(True)
bpy.context.view_layer.objects.active=P[0]; bpy.ops.object.join()
t=bpy.context.active_object; t.name="templo"; t.data.name="templo"
