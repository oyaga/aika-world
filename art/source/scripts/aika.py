
clear(); parts.clear()
bpy.context.scene.render.fps=24
FD=mat("PeloEscuro","#34363F"); FG=mat("Pelo","#7D808C"); FW=mat("PeloBranco","#F4F1EC"); FC=mat("PeloCreme","#E8D9C4")
EAR=mat("OrelhaInterna","#F2A7B8"); EW=mat("OlhoBranco","#FFFFFF"); EYE=mat("Olho","#2E9BE0"); DK=mat("Escuro","#0D0A08")
HL=mat("Brilho@unlit","#FFFFFF",emit=True); NS=mat("Nariz","#2A2226")
HO=mat("Moletom","#FF5A02"); HO2=mat("MoletomSombra","#D94A00"); JE=mat("Jeans","#4A5A78"); JE2=mat("JeansClaro","#6B7D9C")
PK=mat("Rosa","#F06C9B"); PK2=mat("RosaEscuro","#C94A78"); WH=mat("Branco","#FFFFFF"); GY=mat("Cinza","#B8B8C0"); NE=mat("Neon@unlit","#00FF41",emit=True)
H=1.64
hb='head'
# --- cabeça ---
sph('cranio',(0,0.03,H+0.01),(0.31,0.29,0.28),FD,hb,16,10)
sph('mascara',(0,-0.07,H-0.06),(0.28,0.22,0.22),FW,hb,16,10)
sph('testa_escura',(0,-0.2,H+0.13),(0.06,0.05,0.1),FD,hb,8,6)
for s in (1,-1):
    sph('mancha_sobr',(0.1*s,-0.24,H+0.11),(0.045,0.02,0.03),FW,hb,8,5)
    # bochechas fofas
    spike('bochecha',(0.22*s,-0.06,H-0.1),(0.37*s,-0.02,H-0.17),0.09,FW,hb,flat=0.6,verts=5)
    spike('bochecha2',(0.2*s,-0.03,H-0.03),(0.35*s,0.02,H-0.05),0.07,FW,hb,flat=0.6,verts=5)
    # olhos
    sph('olho_b',(0.105*s,-0.235,H+0.01),(0.075,0.035,0.08),EW,hb,10,6)
    sph('iris',(0.108*s,-0.262,H),(0.052,0.02,0.06),EYE,hb,10,6)
    sph('pupila',(0.11*s,-0.276,H),(0.028,0.012,0.036),DK,hb,8,5)
    sph('brilho',(0.09*s,-0.285,H+0.03),(0.014,0.006,0.014),HL,hb,6,4)
    bx('delineado',(0.11*s,-0.255,H+0.083),(0.08,0.012,0.012),DK,hb,rot=(0,-0.28*s,0))
    bx('delineado_asa',(0.19*s,-0.235,H+0.07),(0.03,0.01,0.01),DK,hb,rot=(0,0.5*s,0))
    # orelhas
    o=spike('orelha',(0.17*s,0.03,H+0.18),(0.24*s,0.05,H+0.47),0.12,FD,hb,flat=0.5,verts=6)
    spike('orelha_in',(0.165*s,0.0,H+0.19),(0.225*s,0.02,H+0.41),0.075,EAR,hb,flat=0.35,verts=5)
    spike('orelha_tufo',(0.16*s,-0.01,H+0.18),(0.18*s,-0.02,H+0.28),0.05,FW,hb,flat=0.5,verts=4)
    # fone
    c=part(prim('cyl','fone',loc=(0.3*s,0.01,H+0.02),rot=(0,math.pi/2,0),m=PK,radius=0.105,depth=0.08,vertices=12),hb)
    part(prim('cyl','fone_tampa',loc=(0.345*s,0.01,H+0.02),rot=(0,math.pi/2,0),m=PK2,radius=0.075,depth=0.02,vertices=12),hb)
    part(prim('torus','fone_led',loc=(0.357*s,0.01,H+0.02),rot=(0,math.pi/2,0),m=NE,major_radius=0.06,minor_radius=0.008,major_segments=12,minor_segments=3),hb)
    part(prim('cyl','fone_haste',loc=(0.31*s,0.01,H+0.17),m=PK2,radius=0.02,depth=0.14,vertices=6),hb)
part(prim('torus','arco_fone',loc=(0,0.01,H+0.05),rot=(math.pi/2,0,0),scale=(1,1,1),m=PK,major_radius=0.315,minor_radius=0.028,major_segments=20,minor_segments=5),hb)
sph('focinho',(0,-0.265,H-0.1),(0.12,0.1,0.085),FW,hb,10,6)
sph('nariz',(0,-0.36,H-0.065),(0.048,0.032,0.032),NS,hb,8,5)
sph('nariz_brilho',(0.012,-0.385,H-0.052),(0.012,0.005,0.008),HL,hb,5,3)
bx('boca',(0,-0.358,H-0.14),(0.006,0.004,0.02),DK,hb)
for s in (1,-1): bx('boca_l',(0.03*s,-0.35,H-0.155),(0.03,0.005,0.006),DK,hb,rot=(0,-0.35*s,0))
# pescoço / juba
part(prim('cone','juba',loc=(0,-0.01,1.4),m=FW,radius1=0.2,radius2=0.12,depth=0.12,vertices=10),'spine')
# --- moletom ---
t=part(prim('cone','moletom',loc=(0,0,1.16),m=HO,radius1=0.3,radius2=0.25,depth=0.5,vertices=14),'spine'); t.scale=(1,0.82,1)
for s in (1,-1): sph('ombro',(0.23*s,0,1.33),(0.13,0.12,0.11),HO,'spine',10,6)
part(prim('torus','capuz',loc=(0,0.07,1.42),rot=(0.35,0,0),m=HO,major_radius=0.17,minor_radius=0.085,major_segments=14,minor_segments=6),'spine')
sph('capuz_costas',(0,0.2,1.33),(0.19,0.09,0.15),HO2,'spine',10,6)
part(prim('cyl','barra',loc=(0,0,0.93),m=HO2,radius=0.305,depth=0.08,vertices=14),'hips').scale=(1,0.83,1)
bx('bolso',(0,-0.235,1.03),(0.16,0.02,0.075),HO2,'spine')
for s in (1,-1):
    bx('bolso_abertura',(0.14*s,-0.245,1.03),(0.018,0.01,0.07),HO,'spine',rot=(0,0.35*s,0))
    bx('cordao',(0.05*s,-0.235,1.3),(0.008,0.008,0.085),WH,'spine')
    bx('ponteira',(0.05*s,-0.236,1.205),(0.011,0.011,0.018),GY,'spine')
# --- braços ---
for s,side in ((1,'L'),(-1,'R')):
    A='arm.'+side; F='forearm.'+side
    limb('manga',(0.26*s,0,1.3),(0.33*s,0,1.12),0.1,HO,A,verts=10,r2=0.105)
    sph('cotovelo',(0.335*s,0,1.11),(0.1,0.1,0.07),HO,F,10,6)
    limb('manga_ante',(0.335*s,0,1.1),(0.38*s,0,0.96),0.1,HO,F,verts=10,r2=0.085)
    part(prim('cyl','punho',loc=(0.385*s,0,0.94),m=HO2,radius=0.072,depth=0.05,vertices=10),F)
    sph('mao',(0.39*s,0,0.87),(0.06,0.055,0.075),FW,F,10,6)
    sph('polegar',(0.37*s,-0.05,0.89),(0.025,0.025,0.035),FW,F,6,4)
# --- pernas ---
part(prim('cyl','quadril',loc=(0,0,0.9),m=JE,radius=0.24,depth=0.12,vertices=12),'hips').scale=(1,0.8,1)
for s,side in ((1,'L'),(-1,'R')):
    Lg='leg.'+side
    limb('perna',(0.12*s,0,0.92),(0.12*s,0,0.2),0.11,JE,Lg,verts=10,r2=0.08)
    bx('rasgo',(0.125*s,-0.095,0.52),(0.045,0.012,0.03),FW,Lg)
    bx('rasgo2',(0.11*s,-0.088,0.33),(0.03,0.01,0.018),FW,Lg)
    part(prim('cyl','barra_jeans',loc=(0.12*s,0,0.2),m=JE2,radius=0.088,depth=0.05,vertices=10),Lg)
    sph('tornozelo',(0.12*s,0,0.16),(0.06,0.06,0.04),FW,Lg,8,5)
    bx('tenis',(0.12*s,-0.03,0.085),(0.09,0.14,0.06),PK,Lg)
    sph('biqueira',(0.12*s,-0.16,0.07),(0.09,0.06,0.05),PK,Lg,10,6)
    bx('sola',(0.12*s,-0.05,0.018),(0.098,0.17,0.018),WH,Lg)
    for k,y in enumerate((-0.12,-0.07,-0.02)): bx('cadarco',(0.12*s,y,0.15-0.01*k),(0.05,0.008,0.008),WH,Lg,rot=(0.3,0,0))
    bx('lingueta',(0.12*s,0.0,0.16),(0.05,0.03,0.03),PK2,Lg)
# --- rabo ---
ell('rabo1',(0,0.16,0.94),(0.05,0.42,0.72),0.13,0.14,FD,'tail.1',10,6)
ell('rabo1_b',(0.0,0.2,0.88),(0.05,0.4,0.66),0.1,0.12,FG,'tail.1',8,5)
ell('rabo2',(0.04,0.38,0.8),(0.15,0.58,0.46),0.17,0.18,FG,'tail.2',10,7)
ell('rabo2_b',(0.05,0.36,0.72),(0.15,0.54,0.44),0.13,0.15,FC,'tail.2',8,5)
ell('rabo_ponta',(0.12,0.52,0.56),(0.22,0.64,0.3),0.14,0.15,FC,'tail.2',10,6)
body=join_parts("aika_corpo")
arm=make_rig("aika_rig",dict(hip=0.92,chest=1.1,neck=1.4,top=2.0,sh=(0.25,1.31),el=(0.335,1.11),ha=(0.39,0.83),leg_x=0.12),
    extra=[('tail.1',(0,0.16,0.94),(0.05,0.42,0.72),'hips'),('tail.2',(0.05,0.42,0.72),(0.22,0.64,0.3),'tail.1')])
body.parent=arm; mo=body.modifiers.new("Armature",'ARMATURE'); mo.object=arm
make_anims(arm)
