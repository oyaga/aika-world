
clear(); PIECES.clear()
bpy.context.scene.render.fps=24
PE=mat("Pele","#F2CDB0"); OL=mat("Olho","#1E1A24"); BR=mat("Branco","#F7F3EA"); CB=mat("Cabelo","#3B2A3A")
CI=mat("Cima@tint","#E8742A"); BA=mat("Baixo@tint","#2E3A4F"); PS=mat("Pes@tint","#E0A92E"); VI=mat("Vinho","#8E2F3C"); ES=mat("Escuro","#1E1A24")
J=dict(hip=0.98,chest=1.2,neck=1.56,top=2.0,sh=(0.19,1.48),el=(0.27,1.2),ha=(0.31,0.9),leg_x=0.1,knee=0.55,ankle=0.13)
HC=1.79
# ---------------- corpo ----------------
piece('corpo')
ell('cabeca',(0,-0.005,HC),(0.155,0.165,0.19),PE,['head'],16,12)
ell('queixo',(0,-0.045,HC-0.1),(0.12,0.12,0.095),PE,['head'],12,8)
for s in (1,-1):
    ell('orelha',(0.155*s,0.005,HC-0.01),(0.022,0.035,0.05),PE,['head'],8,5)
    ell('olho',(0.066*s,-0.152,HC-0.005),(0.036,0.012,0.05),OL,['head'],10,6)
    ell('olho_brilho',(0.056*s,-0.162,HC+0.015),(0.011,0.005,0.013),BR,['head'],6,4)
    box('sobrancelha',(0.068*s,-0.158,HC+0.07),(0.032,0.006,0.007),OL,['head'],rot=(0,-0.15*s,0))
spike('nariz',(0,-0.165,HC-0.035),(0,-0.18,HC-0.06),0.012,PE,['head'],flat=0.9)
box('boca',(0,-0.158,HC-0.105),(0.022,0.005,0.006),OL,['head'])
cyl('pescoco',(0,0,1.5),(0,0,1.66),0.052,PE,['spine','head'],8)
cyl('tronco',(0,0,1.0),(0,0,1.48),0.12,PE,['hips','spine'],8)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('braco',(0.19*s,0,1.46),(0.27*s,0,1.2),0.045,PE,['arm.'+sd,'spine'],6)
    cyl('antebraco',(0.27*s,0,1.2),(0.305*s,0,0.95),0.04,PE,['forearm.'+sd,'arm.'+sd],6)
    ell('mao',(0.315*s,-0.01,0.875),(0.042,0.034,0.068),PE,['forearm.'+sd],10,6)
    ell('polegar',(0.3*s,-0.045,0.9),(0.016,0.016,0.03),PE,['forearm.'+sd],6,4)
    cyl('coxa',(0.1*s,0,0.98),(0.1*s,-0.01,0.55),0.07,PE,['leg.'+sd,'hips'],6)
    cyl('canela',(0.1*s,-0.01,0.55),(0.1*s,0,0.12),0.055,PE,['shin.'+sd,'leg.'+sd],6)
# ---------------- cabelo_curto ----------------
piece('cabelo_curto')
ell('calota',(0,0.02,HC+0.055),(0.172,0.182,0.17),CB,['head'],14,9)
ell('nuca',(0,0.07,HC-0.04),(0.16,0.13,0.15),CB,['head'],12,7)
for i,x in enumerate((-0.11,-0.06,-0.01,0.045,0.1)):
    spike('franja',(x,-0.12,HC+0.14),(x*1.25,-0.18,HC+0.045+0.012*(i%2)),0.05,CB,['head'],flat=0.45)
for s in (1,-1):
    spike('lateral',(0.14*s,-0.06,HC+0.07),(0.175*s,-0.08,HC-0.07),0.05,CB,['head'],flat=0.5)
    spike('lateral2',(0.15*s,0.04,HC+0.05),(0.18*s,0.06,HC-0.09),0.055,CB,['head'],flat=0.5)
# ---------------- cima_moletom ----------------
piece('cima_moletom')
t=cyl('corpo_moletom',(0,0,0.95),(0,0,1.5),0.215,CI,['hips','spine'],14,r2=0.19); t.scale=(1,0.74,1)
cyl('barra',(0,0,0.93),(0,0,0.99),0.222,CI,['hips'],14).scale=(1,0.76,1)
for s,sd in ((1,'L'),(-1,'R')):
    ell('ombro',(0.165*s,0,1.45),(0.1,0.09,0.08),CI,['spine','arm.'+sd],10,6)
    cyl('manga',(0.19*s,0,1.46),(0.27*s,0,1.2),0.088,CI,['arm.'+sd,'spine'],10,r2=0.082)
    ell('cotovelo',(0.27*s,0,1.2),(0.08,0.08,0.06),CI,['arm.'+sd,'forearm.'+sd],10,6)
    cyl('manga_ante',(0.27*s,0,1.2),(0.302*s,0,0.97),0.082,CI,['forearm.'+sd,'arm.'+sd],10,r2=0.07)
    cyl('punho',(0.302*s,0,0.93),(0.305*s,0,0.98),0.058,CI,['forearm.'+sd],10)
    box('cordao',(0.035*s,-0.148,1.39),(0.006,0.006,0.075),BR,['spine'])
add(prim('torus','capuz',loc=(0,0.045,1.53),rot=(0.3,0,0),m=CI,major_radius=0.12,minor_radius=0.06,major_segments=14,minor_segments=6),['spine','head'])
ell('capuz_costas',(0,0.14,1.44),(0.14,0.06,0.11),CI,['spine'],10,6)
box('bolso',(0,-0.158,1.07),(0.12,0.012,0.06),CI,['spine','hips'])
# ---------------- baixo_calca_larga ----------------
piece('baixo_calca_larga')
cyl('cintura',(0,0,0.93),(0,0,1.02),0.2,BA,['hips'],12).scale=(1,0.78,1)
ell('gancho',(0,0,0.9),(0.15,0.11,0.1),BA,['hips','leg.L','leg.R'],10,6)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('coxa_calca',(0.1*s,0,0.97),(0.105*s,-0.01,0.55),0.13,BA,['leg.'+sd,'hips'],12,r2=0.118)
    ell('joelho_calca',(0.105*s,-0.01,0.55),(0.118,0.118,0.07),BA,['leg.'+sd,'shin.'+sd],12,6)
    cyl('canela_calca',(0.105*s,-0.01,0.55),(0.1*s,0,0.22),0.118,BA,['shin.'+sd,'leg.'+sd],12,r2=0.1)
    cyl('barra_franzida',(0.1*s,0,0.16),(0.1*s,0,0.23),0.074,BA,['shin.'+sd],12,r2=0.098)
# ---------------- pes_tenis_grosso ----------------
piece('pes_tenis_grosso')
for s,sd in ((1,'L'),(-1,'R')):
    b=['shin.'+sd]
    box('cabedal',(0.1*s,-0.035,0.085),(0.075,0.135,0.06),PS,b,bevel=0.025)
    ell('bico',(0.1*s,-0.14,0.07),(0.075,0.06,0.05),PS,b,10,6)
    cyl('colar',(0.1*s,0.01,0.12),(0.1*s,0.01,0.17),0.062,PS,b,10)
    box('sola',(0.1*s,-0.045,0.025),(0.082,0.16,0.025),BR,b,bevel=0.01)
    for k,y in enumerate((-0.1,-0.06,-0.02)): box('cadarco',(0.1*s,y,0.15-0.008*k),(0.04,0.007,0.007),BR,b,rot=(0.35,0,0))
    box('calcanhar',(0.1*s,0.1,0.11),(0.03,0.015,0.04),BR,b)
# ---------------- acess_bolsa_carteiro ----------------
piece('acess_bolsa_carteiro')
box('bolsa',(-0.225,0.03,1.0),(0.045,0.14,0.115),VI,['hips','spine'],rot=(0,0,-0.1),bevel=0.02)
box('aba',(-0.272,0.03,1.05),(0.01,0.142,0.075),VI,['hips','spine'],rot=(0,0,-0.1))
# glifo "AIKA" estilizado (blockout)
for (y,z,sy,sz) in ((-0.06,1.06,0.008,0.04),(-0.03,1.08,0.03,0.008),(0.0,1.06,0.008,0.04),(0.04,1.06,0.02,0.008),(0.06,1.045,0.008,0.03)):
    box('glifo',(-0.284,0.03+y,z),(0.004,sy,sz),BR,['hips','spine'],rot=(0,0,-0.1))
cyl('alca_frente',(-0.21,-0.13,1.08),(0.14,-0.17,1.5),0.017,ES,['spine','hips'],6)
cyl('alca_costas',(0.14,0.15,1.5),(-0.21,0.17,1.08),0.017,ES,['spine','hips'],6)
cyl('alca_ombro',(0.14,-0.17,1.5),(0.14,0.15,1.5),0.02,ES,['spine'],6)
arm=make_rig3("visitante_rig",J)
OBJS=[arm]
for name in list(PIECES.keys()): OBJS.append(build_piece(name,arm))
make_anims3(arm)
