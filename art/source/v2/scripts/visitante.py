
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

NE=mat("Neon@unlit","#5CE1E6",emit=True); MO=mat("Mostarda","#E0A92E")
L_,R_=['arm.L','spine'],['arm.R','spine']
def sleeves(m, long=True, r0=0.088, r1=0.082, flare=None, upto=None):
    for s,sd in ((1,'L'),(-1,'R')):
        ell('ombro',(0.165*s,0,1.45),(0.1,0.09,0.08),m,['spine','arm.'+sd],10,6)
        end=(0.27*s,0,1.2) if long else (0.225*s,0,1.33)
        cyl('manga',(0.19*s,0,1.46),end,r0,m,['arm.'+sd,'spine'],10,r2=r1)
        if long:
            ell('cotovelo',(0.27*s,0,1.2),(r1,r1,0.06),m,['arm.'+sd,'forearm.'+sd],10,6)
            cyl('manga_ante',(0.27*s,0,1.2),(0.302*s,0,0.97),r1,m,['forearm.'+sd,'arm.'+sd],10,r2=(flare or r1*0.86))
def torso(m, r0=0.215, r1=0.19, top=1.5, sy=0.74, bot=0.95):
    t=cyl('torso',(0,0,bot),(0,0,top),r0,m,['hips','spine'],14,r2=r1); t.scale=(1,sy,1); return t
# ---------------- cabelos ----------------
piece('cabelo_baguncado')
ell('calota',(0,0.02,HC+0.05),(0.172,0.182,0.165),CB,['head'],14,9)
import random as _r; _r.seed(8)
for k in range(16):
    a=k/16*2*math.pi; x=math.sin(a)*0.15; y=-math.cos(a)*0.15+0.02
    tip=(x*1.55,y*1.45+0.02,HC+0.08+_r.uniform(-0.12,0.12)+ (0.1 if abs(a-math.pi)>2.2 else 0))
    spike('mecha',(x,y,HC+0.12),tip,0.065,CB,['head'],flat=0.5)
for x in (-0.09,-0.03,0.04,0.1): spike('franja',(x,-0.12,HC+0.14),(x*1.4,-0.185,HC+0.03),0.05,CB,['head'],flat=0.45)
piece('cabelo_coque_duplo')
ell('calota',(0,0.02,HC+0.05),(0.172,0.182,0.17),CB,['head'],14,9)
ell('nuca',(0,0.06,HC-0.05),(0.165,0.14,0.15),CB,['head'],12,7)
for s in (1,-1):
    ell('coque',(0.11*s,0.03,HC+0.2),(0.075,0.075,0.07),CB,['head'],10,7)
    add(prim('torus','elastico',loc=(0.11*s,0.03,HC+0.145),m=VI,major_radius=0.045,minor_radius=0.014,major_segments=10,minor_segments=4),['head'])
    spike('lateral',(0.145*s,-0.07,HC+0.05),(0.165*s,-0.1,HC-0.1),0.045,CB,['head'],flat=0.5)
ell('franja',(0,-0.125,HC+0.1),(0.13,0.045,0.06),CB,['head'],10,6)
piece('cabelo_rabo')
ell('calota',(0,0.02,HC+0.055),(0.17,0.18,0.165),CB,['head'],14,9)
add(prim('torus','prendedor',loc=(0,0.17,HC+0.02),rot=(math.pi/2,0,0),m=VI,major_radius=0.04,minor_radius=0.014,major_segments=10,minor_segments=4),['head'])
ellab('rabo1',(0,0.18,HC+0.03),(0,0.26,HC-0.15),0.065,0.06,CB,['head'],10,6)
ellab('rabo2',(0,0.25,HC-0.12),(0,0.27,HC-0.32),0.055,0.05,CB,['head','spine'],10,6)
for x in (-0.08,0.0,0.08): spike('franja',(x,-0.12,HC+0.14),(x*1.2,-0.18,HC+0.06),0.055,CB,['head'],flat=0.45)
piece('cabelo_raspado')
ell('calota',(0,0.015,HC+0.03),(0.16,0.172,0.172),CB,['head'],14,9).scale=(0.162,0.174,0.17)
piece('cabelo_franja')
ell('calota',(0,0.02,HC+0.055),(0.175,0.185,0.172),CB,['head'],14,9)
box('franja_reta',(0,-0.14,HC+0.085),(0.14,0.035,0.055),CB,['head'],bevel=0.02)
for s in (1,-1): box('mecha_lado',(0.15*s,-0.04,HC-0.06),(0.035,0.1,0.15),CB,['head'],bevel=0.02)
ell('costas',(0,0.08,HC-0.08),(0.17,0.12,0.16),CB,['head','spine'],12,7)
# ---------------- cimas ----------------
piece('cima_camiseta')
torso(CI,0.2,0.185)
cyl('barra',(0,0,0.94),(0,0,0.98),0.205,CI,['hips'],14).scale=(1,0.76,1)
sleeves(CI,long=False,r0=0.07,r1=0.066)
add(prim('torus','gola',loc=(0,-0.005,1.51),m=BR,major_radius=0.075,minor_radius=0.014,major_segments=12,minor_segments=4),['spine'])
piece('cima_jaqueta_bomber')
torso(CI,0.235,0.205,sy=0.78)
cyl('barra_rib',(0,0,0.92),(0,0,1.0),0.215,ES,['hips'],14).scale=(1,0.78,1)
add(prim('torus','gola_rib',loc=(0,-0.005,1.515),m=ES,major_radius=0.085,minor_radius=0.025,major_segments=12,minor_segments=4),['spine'])
box('ziper',(0,-0.18,1.22),(0.006,0.006,0.27),BR,['spine','hips'])
box('bolso_l',(0.13,-0.165,1.1),(0.04,0.006,0.012),ES,['spine','hips'],rot=(0,0,0.4))
box('bolso_r',(-0.13,-0.165,1.1),(0.04,0.006,0.012),ES,['spine','hips'],rot=(0,0,-0.4))
sleeves(CI,long=True,r0=0.1,r1=0.092)
for s,sd in ((1,'L'),(-1,'R')): cyl('punho_rib',(0.3*s,0,0.93),(0.304*s,0,0.99),0.06,ES,['forearm.'+sd],10)
piece('cima_sueter')
torso(CI,0.21,0.19)
cyl('gola_alta',(0,0,1.49),(0,0,1.63),0.07,CI,['spine','head'],12,r2=0.062)
sleeves(CI,long=True,r0=0.085,r1=0.078)
for z in (0.97,1.02): cyl('rib',(0,0,z-0.02),(0,0,z+0.02),0.212,CI,['hips'],14).scale=(1,0.75,1)
piece('cima_regata')
torso(CI,0.19,0.165,top=1.45)
for s in (1,-1): box('alca',(0.09*s,0,1.49),(0.025,0.13,0.05),CI,['spine'])
piece('cima_kimono_urbano')
torso(CI,0.22,0.2,sy=0.76)
box('transpasse',(0.0,-0.168,1.28),(0.03,0.01,0.2),BR,['spine'],rot=(0,0.5,0))
cyl('obi',(0,0,1.03),(0,0,1.13),0.225,ES,['hips','spine'],14).scale=(1,0.78,1)
for s,sd in ((1,'L'),(-1,'R')):
    ell('ombro',(0.17*s,0,1.45),(0.1,0.09,0.08),CI,['spine','arm.'+sd],10,6)
    cyl('manga_larga',(0.19*s,0,1.46),(0.27*s,0,1.2),0.09,CI,['arm.'+sd,'spine'],10,r2=0.11)
    cyl('manga_larga2',(0.27*s,0,1.2),(0.3*s,0,1.02),0.11,CI,['forearm.'+sd,'arm.'+sd],10,r2=0.13)
# ---------------- baixos ----------------
def waist(m): 
    cyl('cintura',(0,0,0.93),(0,0,1.02),0.2,m,['hips'],12).scale=(1,0.78,1)
    ell('gancho',(0,0,0.9),(0.15,0.11,0.1),m,['hips','leg.L','leg.R'],10,6)
piece('baixo_bermuda'); waist(BA)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('perna_b',(0.1*s,0,0.97),(0.108*s,-0.01,0.58),0.13,BA,['leg.'+sd,'hips'],12,r2=0.12)
    cyl('barra_b',(0.108*s,-0.01,0.57),(0.108*s,-0.01,0.61),0.123,BA,['leg.'+sd],12)
piece('baixo_saia')
cyl('cos',(0,0,0.96),(0,0,1.02),0.2,BA,['hips'],12).scale=(1,0.78,1)
cyl('saia',(0,0,0.62),(0,0,0.98),0.31,BA,['hips','leg.L','leg.R'],16,r2=0.2).scale=(1,0.82,1)
for k in range(8):
    a=k/8*2*math.pi; box('prega',(math.sin(a)*0.25,-math.cos(a)*0.2,0.8),(0.006,0.006,0.16),BR,['hips','leg.L','leg.R'],rot=(0,0,-a))
piece('baixo_jogger'); waist(BA)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('coxa_j',(0.1*s,0,0.97),(0.103*s,-0.01,0.55),0.115,BA,['leg.'+sd,'hips'],12,r2=0.095)
    ell('joelho_j',(0.103*s,-0.01,0.55),(0.095,0.095,0.06),BA,['leg.'+sd,'shin.'+sd],12,6)
    cyl('canela_j',(0.103*s,-0.01,0.55),(0.1*s,0,0.2),0.095,BA,['shin.'+sd,'leg.'+sd],12,r2=0.07)
    cyl('punho_j',(0.1*s,0,0.15),(0.1*s,0,0.21),0.064,ES,['shin.'+sd],12)
    box('faixa_lat',(0.2*s,0,0.62),(0.004,0.012,0.3),BR,['leg.'+sd,'shin.'+sd])
piece('baixo_macacao'); waist(BA)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('coxa_m',(0.1*s,0,0.97),(0.105*s,-0.01,0.55),0.128,BA,['leg.'+sd,'hips'],12,r2=0.117)
    ell('joelho_m',(0.105*s,-0.01,0.55),(0.117,0.117,0.07),BA,['leg.'+sd,'shin.'+sd],12,6)
    cyl('canela_m',(0.105*s,-0.01,0.55),(0.1*s,0,0.2),0.117,BA,['shin.'+sd,'leg.'+sd],12,r2=0.1)
    box('alca_m',(0.09*s,-0.005,1.43),(0.025,0.165,0.13),BA,['spine'])
    ell('botao',(0.09*s,-0.17,1.33),(0.015,0.006,0.015),MO,['spine'],6,4)
t=cyl('peito',(0,0,0.98),(0,0,1.38),0.2,BA,['hips','spine'],14,r2=0.18); t.scale=(1,0.76,1)
box('bolso_peito',(0,-0.15,1.25),(0.07,0.008,0.06),BA,['spine'])
# ---------------- pés ----------------
def sole_block(s,sd,m_up,h=0.06,collar=0.17,sole=BR):
    b=['shin.'+sd]
    box('cabedal',(0.1*s,-0.035,0.025+h),(0.075,0.135,h),m_up,b,bevel=0.025)
    ell('bico',(0.1*s,-0.14,0.07),(0.075,0.06,0.05),m_up,b,10,6)
    box('sola',(0.1*s,-0.045,0.025),(0.082,0.16,0.025),sole,b,bevel=0.01)
piece('pes_tenis_cano_alto')
for s,sd in ((1,'L'),(-1,'R')):
    sole_block(s,sd,PS)
    cyl('cano',(0.1*s,0.0,0.1),(0.1*s,0.0,0.27),0.07,PS,['shin.'+sd],10)
    for k,z in enumerate((0.13,0.17,0.21,0.25)): box('cadarco',(0.1*s,-0.07,z),(0.035,0.006,0.006),BR,['shin.'+sd])
    ell('estrela',(0.172*s,0.0,0.2),(0.004,0.025,0.025),BR,['shin.'+sd],6,4)
piece('pes_bota')
for s,sd in ((1,'L'),(-1,'R')):
    sole_block(s,sd,PS,sole=ES)
    cyl('cano_bota',(0.1*s,0.0,0.1),(0.1*s,0.0,0.34),0.078,PS,['shin.'+sd],10)
    cyl('dobra',(0.1*s,0.0,0.31),(0.1*s,0.0,0.35),0.085,ES,['shin.'+sd],10)
piece('pes_chinelo_meia')
for s,sd in ((1,'L'),(-1,'R')):
    b=['shin.'+sd]
    cyl('meia',(0.1*s,0,0.03),(0.1*s,0,0.2),0.058,BR,b,10)
    ell('pe_meia',(0.1*s,-0.07,0.045),(0.055,0.1,0.04),BR,b,10,6)
    box('sola_ch',(0.1*s,-0.05,0.012),(0.07,0.15,0.012),ES,b,bevel=0.008)
    box('tira',(0.1*s,-0.08,0.06),(0.072,0.05,0.03),PS,b,bevel=0.01)
# ---------------- acessórios ----------------
piece('acess_mochila')
box('mochila',(0,0.26,1.2),(0.16,0.09,0.2),MO,['spine'],bevel=0.03)
box('bolso_m',(0,0.35,1.12),(0.11,0.02,0.09),VI,['spine'],bevel=0.015)
box('tampa',(0,0.3,1.4),(0.15,0.07,0.04),VI,['spine'],bevel=0.02)
for s in (1,-1):
    cyl('alca_m',(0.1*s,0.17,1.45),(0.11*s,-0.17,1.38),0.018,ES,['spine'],6)
    cyl('alca_m2',(0.11*s,-0.17,1.38),(0.12*s,-0.1,1.05),0.018,ES,['spine'],6)
piece('acess_bone')
ell('copa',(0,0.0,HC+0.1),(0.18,0.19,0.13),VI,['head'],14,8)
box('aba',(0,-0.2,HC+0.06),(0.13,0.1,0.012),VI,['head'],rot=(-0.12,0,0),bevel=0.02)
ell('botao_b',(0,0,HC+0.23),(0.02,0.02,0.012),VI,['head'],6,4)
box('logo_b',(0,-0.172,HC+0.13),(0.035,0.004,0.03),BR,['head'])
piece('acess_fone_neon')
add(prim('torus','arco',loc=(0,0,HC+0.02),rot=(math.pi/2,0,0),m=ES,major_radius=0.19,minor_radius=0.016,major_segments=20,minor_segments=4),['head'])
for s in (1,-1):
    add(prim('cyl','concha',loc=(0.175*s,0,HC-0.02),rot=(0,math.pi/2,0),m=ES,radius=0.065,depth=0.05,vertices=12),['head'])
    add(prim('torus','led',loc=(0.2*s,0,HC-0.02),rot=(0,math.pi/2,0),m=NE,major_radius=0.042,minor_radius=0.008,major_segments=12,minor_segments=3),['head'])
piece('acess_oculos')
for s in (1,-1):
    add(prim('torus','lente',loc=(0.066*s,-0.172,HC-0.005),rot=(math.pi/2,0,0),m=ES,major_radius=0.043,minor_radius=0.007,major_segments=14,minor_segments=4),['head'])
    cyl('haste',(0.108*s,-0.17,HC),(0.15*s,0.02,HC+0.01),0.006,ES,['head'],4)
cyl('ponte',(-0.024,-0.175,HC),(0.024,-0.175,HC),0.006,ES,['head'],4)
arm=make_rig3("visitante_rig",J)
OBJS=[arm]
for name in list(PIECES.keys()): OBJS.append(build_piece(name,arm))
make_anims3(arm)
bpy.data.objects['baixo_macacao']['esconde']='cima'
