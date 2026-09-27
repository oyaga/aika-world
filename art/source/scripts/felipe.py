
import random
clear(); parts.clear()
bpy.context.scene.render.fps=24
SK=mat("Pele","#F6D2B8"); SK2=mat("PeleSombra","#E4B294"); HR=mat("Cabelo","#16121A"); HR2=mat("CabeloBrilho","#2E2742")
EW=mat("OlhoBranco","#FFFFFF"); EY=mat("Olho","#5FA83A"); DK=mat("Escuro","#0D0A08"); HL=mat("Brilho@unlit","#FFFFFF",emit=True)
MO=mat("Boca","#8A3F33"); TS=mat("Camiseta","#0D0A08"); CL=mat("Gola","#2A2628"); OR=mat("Laranja","#FF5A02"); OR2=mat("LaranjaEscuro","#C94400")
SH=mat("Bermuda","#1E1A1C"); SH2=mat("BermudaBarra","#2C2729"); WH=mat("Branco","#FFFFFF"); SO=mat("Tenis","#141214")
H=1.68; hb='head'
sph('cranio',(0,0,H),(0.26,0.25,0.28),SK,hb,16,10)
sph('queixo',(0,-0.05,H-0.12),(0.19,0.17,0.13),SK,hb,12,7)
for s in (1,-1):
    sph('orelha',(0.255*s,0.01,H-0.02),(0.035,0.05,0.07),SK,hb,8,5)
    sph('orelha_in',(0.27*s,0.0,H-0.02),(0.015,0.03,0.045),SK2,hb,6,4)
    sph('olho_b',(0.095*s,-0.212,H-0.01),(0.066,0.03,0.072),EW,hb,10,6)
    sph('iris',(0.098*s,-0.236,H-0.015),(0.046,0.018,0.052),EY,hb,10,6)
    sph('pupila',(0.1*s,-0.249,H-0.015),(0.024,0.01,0.028),DK,hb,8,5)
    sph('brilho',(0.083*s,-0.256,H+0.012),(0.012,0.005,0.012),HL,hb,6,4)
    bx('palpebra',(0.097*s,-0.232,H+0.055),(0.07,0.012,0.012),DK,hb,rot=(0,0.12*s,0))
    bx('sobrancelha',(0.1*s,-0.235,H+0.115),(0.075,0.016,0.019),HR,hb,rot=(0,-0.12*s,0))
    sph('bochecha',(0.14*s,-0.19,H-0.09),(0.04,0.012,0.022),SK2,hb,6,4)
spike('nariz',(0,-0.225,H-0.03),(0,-0.285,H-0.085),0.032,SK2,hb,flat=0.9,verts=4)
bx('boca',(0.0,-0.233,H-0.152),(0.03,0.006,0.008),MO,hb)
for s_ in (1,-1): bx('boca_l',(0.035*s_,-0.228,H-0.145),(0.015,0.005,0.007),MO,hb,rot=(0,-0.45*s_,0))
# cabelo
sph('cabelo',(0,0.03,H+0.08),(0.285,0.285,0.25),HR,hb,14,9)
sph('cabelo_nuca',(0,0.1,H-0.02),(0.27,0.22,0.25),HR,hb,12,7)
random.seed(4)
for x in (-0.16,-0.09,-0.02,0.05,0.12,0.18):
    m=HR2 if abs(x-0.05)<0.01 else HR
    spike('franja',(x,-0.15,H+0.22),(x*1.3+random.uniform(-0.03,0.03),-0.275,H+0.125+random.uniform(-0.015,0.02)),0.07,m,hb,flat=0.45)
for s in (1,-1):
    spike('lateral',(0.22*s,-0.04,H+0.12),(0.3*s,-0.08,H-0.1),0.07,HR,hb,flat=0.5)
    spike('lateral2',(0.24*s,0.06,H+0.1),(0.33*s,0.1,H-0.07),0.075,HR,hb,flat=0.5)
    spike('lateral3',(0.2*s,0.14,H+0.05),(0.29*s,0.22,H-0.14),0.07,HR,hb,flat=0.5)
for k in range(7):
    a=math.radians(-70+k*23); x=math.sin(a)*0.14; y=0.04+math.cos(a)*0.05
    spike('topo',(x,y,H+0.24),(x*2.4+random.uniform(-0.04,0.04),y+0.14+random.uniform(0,0.08),H+0.46+random.uniform(-0.04,0.06)),0.09,HR2 if k==3 else HR,hb,flat=0.5)
for x in (-0.14,-0.05,0.05,0.14):
    spike('nuca',(x,0.2,H+0.06),(x*1.4,0.32,H-0.16),0.08,HR,hb,flat=0.5)
# pescoço e camiseta
part(prim('cyl','pescoco',loc=(0,0,1.42),m=SK,radius=0.07,depth=0.12,vertices=10),'spine')
t=part(prim('cone','camiseta',loc=(0,0,1.16),m=TS,radius1=0.23,radius2=0.25,depth=0.5,vertices=14),'spine'); t.scale=(1,0.76,1)
for s in (1,-1): sph('ombro',(0.22*s,0,1.33),(0.11,0.1,0.09),TS,'spine',10,6)
part(prim('torus','gola',loc=(0,-0.01,1.405),m=CL,major_radius=0.085,minor_radius=0.02,major_segments=12,minor_segments=4),'spine')
# estampa laranja
part(prim('torus','espiral',loc=(-0.07,-0.192,1.05),rot=(math.pi/2,0,0),m=OR,major_radius=0.055,minor_radius=0.011,major_segments=12,minor_segments=3),'spine')
part(prim('torus','espiral_in',loc=(-0.07,-0.193,1.05),rot=(math.pi/2,0,0),m=OR,major_radius=0.025,minor_radius=0.009,major_segments=8,minor_segments=3),'spine')
for k in range(6):
    a=k*math.pi/3
    spike('petala',(-0.07+math.cos(a)*0.06,-0.19,1.05+math.sin(a)*0.06),(-0.07+math.cos(a+0.5)*0.1,-0.19,1.05+math.sin(a+0.5)*0.1),0.018,OR,'spine',flat=0.3)
for (b,tp) in (((0.0,-0.19,1.22),(0.13,-0.19,1.3)),((0.02,-0.19,1.2),(0.16,-0.19,1.22)),((0.03,-0.19,1.17),(0.12,-0.19,1.12)),((0.0,-0.19,1.22),(-0.06,-0.19,1.3))):
    spike('chama',b,tp,0.03,OR,'spine',flat=0.3)
# braços
for s,side in ((1,'L'),(-1,'R')):
    A='arm.'+side; F='forearm.'+side
    limb('manga',(0.24*s,0,1.33),(0.3*s,0,1.18),0.095,TS,A,verts=10,r2=0.088)
    part(prim('cyl','manga_barra',loc=(0.3*s,0,1.185),rot=(0,0.26*s,0),m=OR,radius=0.089,depth=0.02,vertices=10),A)
    spike('manga_chama',(0.31*s,-0.03,1.26),(0.33*s,-0.06,1.33),0.025,OR,A,flat=0.3)
    limb('braco',(0.3*s,0,1.18),(0.33*s,0,1.1),0.055,SK,A,verts=8)
    sph('cotovelo',(0.33*s,0,1.1),(0.052,0.052,0.05),SK,F,8,5)
    limb('antebraco',(0.33*s,0,1.1),(0.365*s,0,0.87),0.052,SK,F,verts=8,r2=0.043)
    sph('mao',(0.37*s,0,0.83),(0.045,0.04,0.065),SK,F,8,6)
    sph('polegar',(0.355*s,-0.04,0.855),(0.018,0.018,0.03),SK,F,6,4)
# bermuda e pernas
part(prim('cyl','quadril',loc=(0,0,0.92),m=SH,radius=0.235,depth=0.14,vertices=12),'hips').scale=(1,0.78,1)
for s,side in ((1,'L'),(-1,'R')):
    Lg='leg.'+side
    limb('bermuda',(0.12*s,0,0.94),(0.125*s,0,0.52),0.115,SH,Lg,verts=10,r2=0.1)
    part(prim('cyl','bermuda_barra',loc=(0.125*s,0,0.53),m=SH2,radius=0.102,depth=0.03,vertices=10),Lg)
    sph('joelho',(0.125*s,-0.01,0.45),(0.058,0.058,0.05),SK,Lg,8,5)
    limb('canela',(0.125*s,0,0.5),(0.12*s,0,0.15),0.058,SK,Lg,verts=8,r2=0.048)
    part(prim('cyl','meia',loc=(0.12*s,0,0.15),m=WH,radius=0.052,depth=0.06,vertices=8),Lg)
    bx('tenis',(0.12*s,-0.03,0.075),(0.085,0.135,0.055),SO,Lg)
    sph('biqueira',(0.12*s,-0.155,0.065),(0.085,0.055,0.048),SO,Lg,10,6)
    bx('sola',(0.12*s,-0.045,0.016),(0.092,0.165,0.016),WH,Lg)
    bx('faixa',(0.2*s,-0.03,0.07),(0.006,0.1,0.012),WH,Lg)
    for k,y in enumerate((-0.11,-0.065,-0.02)): bx('cadarco',(0.12*s,y,0.132-0.006*k),(0.045,0.008,0.007),WH,Lg,rot=(0.3,0,0))
body=join_parts("felipe_corpo")
arm=make_rig("felipe_rig",dict(hip=0.92,chest=1.1,neck=1.42,top=2.0,sh=(0.24,1.33),el=(0.33,1.1),ha=(0.37,0.78),leg_x=0.12))
body.parent=arm; mo=body.modifiers.new("Armature",'ARMATURE'); mo.object=arm
uL,fL,eL,hL=solve_arm(arm,'L',(0.21,-0.13,1.17),(-0.1,-0.25,1.25),step=4)
uR,fR,eR,hR=solve_arm(arm,'R',(-0.22,-0.15,1.14),(0.1,-0.29,1.2),step=4)
make_anims(arm,set_=("Idle",),idle_arms=((uL,fL),(uR,fR)))
CROSS=dict(uL=uL,fL=fL,uR=uR,fR=fR,err=[round(eL,3),round(hL,3),round(eR,3),round(hR,3)])
