
J5=dict(hip=0.98,chest=1.2,neck=1.56,top=2.0,sh=(0.19,1.48),el=(0.27,1.2),ha=(0.31,0.9),leg_x=0.1,knee=0.55,ankle=0.13)
HC=1.79
def anime_eyes(bones, iris_hex, cx=0.066, y=-0.152, z=HC-0.005, w=0.037, h=0.052, brow=None, lash=True):
    EW=mat("OlhoBranco","#FFFFFF"); IR=mat("Iris_"+iris_hex.strip('#'),iris_hex); PU=mat("Olho","#1E1A24")
    for s in (1,-1):
        ell('esclera',(cx*s,y,z),(w,0.012,h),EW,bones,12,7)
        ell('iris',(cx*s*0.97,y-0.008,z-0.004),(w*0.72,0.009,h*0.8),IR,bones,12,7)
        ell('pupila',(cx*s*0.97,y-0.014,z-0.006),(w*0.36,0.006,h*0.42),PU,bones,8,5)
        ell('brilho',(cx*s*0.97-0.012*s,y-0.019,z+h*0.35),(w*0.22,0.004,w*0.24),EW,bones,6,4)
        if lash: box('cilio',(cx*s,y-0.004,z+h*0.92),(w*1.08,0.008,0.009),PU,bones,rot=(0,-0.18*s,0))
        box('sobrancelha',(cx*s,y-0.006,z+h+0.03),(w*0.9,0.006,0.008),brow or PU,bones,rot=(0,-0.12*s,0))
def human_body(name, skin_hex="#F2CDB0", iris="#3B2A3A", mouth="#8A3F33", legs=True, torso_skin=True, arms=True):
    piece(name); PE=mat("Pele_"+skin_hex.strip('#'),skin_hex); MO=mat("Boca","#8A3F33")
    ell('cabeca',(0,-0.005,HC),(0.155,0.165,0.19),PE,['head'],16,12)
    ell('queixo',(0,-0.045,HC-0.1),(0.12,0.12,0.095),PE,['head'],12,8)
    for s in (1,-1): ell('orelha',(0.155*s,0.005,HC-0.01),(0.022,0.035,0.05),PE,['head'],8,5)
    anime_eyes(['head'],iris)
    spike('nariz',(0,-0.165,HC-0.035),(0,-0.18,HC-0.06),0.012,PE,['head'],flat=0.9)
    box('boca',(0,-0.158,HC-0.105),(0.022,0.005,0.006),MO,['head'])
    for s in (1,-1): box('boca_canto',(0.024*s,-0.155,HC-0.1),(0.008,0.004,0.005),MO,['head'],rot=(0,-0.5*s,0))
    cyl('pescoco',(0,0,1.5),(0,0,1.66),0.052,PE,['spine','head'],8)
    if torso_skin: cyl('tronco',(0,0,1.0),(0,0,1.48),0.12,PE,['hips','spine'],8)
    for s,sd in ((1,'L'),(-1,'R')):
        if arms:
            cyl('braco',(0.19*s,0,1.46),(0.27*s,0,1.2),0.045,PE,['arm.'+sd,'spine'],8)
            ell('cotovelo',(0.27*s,0,1.2),(0.043,0.043,0.04),PE,['arm.'+sd,'forearm.'+sd],8,5)
            cyl('antebraco',(0.27*s,0,1.2),(0.305*s,0,0.95),0.042,PE,['forearm.'+sd,'arm.'+sd],8,r2=0.036)
        ell('mao',(0.315*s,-0.01,0.875),(0.042,0.034,0.068),PE,['forearm.'+sd],10,6)
        ell('polegar',(0.3*s,-0.045,0.9),(0.016,0.016,0.03),PE,['forearm.'+sd],6,4)
        if legs:
            cyl('coxa',(0.1*s,0,0.98),(0.1*s,-0.01,0.55),0.07,PE,['leg.'+sd,'hips'],8)
            ell('joelho',(0.1*s,-0.01,0.55),(0.058,0.058,0.05),PE,['leg.'+sd,'shin.'+sd],8,5)
            cyl('canela',(0.1*s,-0.01,0.55),(0.1*s,0,0.12),0.055,PE,['shin.'+sd,'leg.'+sd],8,r2=0.045)
    return PE
def c_torso(m, r0=0.215, r1=0.19, top=1.5, sy=0.74, bot=0.95):
    t=cyl('torso',(0,0,bot),(0,0,top),r0,m,['hips','spine'],14,r2=r1); t.scale=(1,sy,1); return t
def c_sleeves(m, long=True, r0=0.088, r1=0.082, end_r=None):
    for s,sd in ((1,'L'),(-1,'R')):
        ell('ombro',(0.165*s,0,1.45),(0.1,0.09,0.08),m,['spine','arm.'+sd],10,6)
        end=(0.27*s,0,1.2) if long else (0.225*s,0,1.33)
        cyl('manga',(0.19*s,0,1.46),end,r0,m,['arm.'+sd,'spine'],10,r2=r1)
        if long:
            ell('cotovelo_m',(0.27*s,0,1.2),(r1,r1,0.06),m,['arm.'+sd,'forearm.'+sd],10,6)
            cyl('manga_ante',(0.27*s,0,1.2),(0.302*s,0,0.97),r1,m,['forearm.'+sd,'arm.'+sd],10,r2=(end_r or r1*0.86))
def c_pants(m, wide=0.13, knee_r=0.118, cuff=0.098, shorts=False, gather=None):
    cyl('cintura',(0,0,0.93),(0,0,1.02),0.2,m,['hips'],12).scale=(1,0.78,1)
    ell('gancho',(0,0,0.9),(0.15,0.11,0.1),m,['hips','leg.L','leg.R'],10,6)
    for s,sd in ((1,'L'),(-1,'R')):
        if shorts:
            cyl('perna',(0.1*s,0,0.97),(0.108*s,-0.01,0.58),wide,m,['leg.'+sd,'hips'],12,r2=knee_r); continue
        cyl('coxa_c',(0.1*s,0,0.97),(0.105*s,-0.01,0.55),wide,m,['leg.'+sd,'hips'],12,r2=knee_r)
        ell('joelho_c',(0.105*s,-0.01,0.55),(knee_r,knee_r,0.07),m,['leg.'+sd,'shin.'+sd],12,6)
        cyl('canela_c',(0.105*s,-0.01,0.55),(0.1*s,0,0.22),knee_r,m,['shin.'+sd,'leg.'+sd],12,r2=cuff)
        if gather: cyl('barra',(0.1*s,0,0.16),(0.1*s,0,0.23),0.074,gather,['shin.'+sd],12,r2=cuff)
def c_shoes(up, sole, lace=None, high=False):
    for s,sd in ((1,'L'),(-1,'R')):
        b=['shin.'+sd]
        box('cabedal',(0.1*s,-0.035,0.085),(0.075,0.135,0.06),up,b,bevel=0.025)
        ell('bico',(0.1*s,-0.14,0.07),(0.075,0.06,0.05),up,b,10,6)
        box('sola',(0.1*s,-0.045,0.025),(0.082,0.16,0.025),sole,b,bevel=0.01)
        cyl('colar',(0.1*s,0.01,0.12),(0.1*s,0.01,0.27 if high else 0.17),0.062,up,b,10)
        if lace:
            for k,y in enumerate((-0.1,-0.06,-0.02)): box('cadarco',(0.1*s,y,0.15-0.008*k),(0.04,0.007,0.007),lace,b,rot=(0.35,0,0))
def spiky_hair(m, n=16, fringe=5, h=0.12, seed=8, color2=None):
    import random as _r; _r.seed(seed)
    ell('calota',(0,0.02,HC+0.05),(0.172,0.182,0.168),m,['head'],14,9)
    ell('nuca',(0,0.07,HC-0.04),(0.16,0.13,0.15),m,['head'],12,7)
    for k in range(n):
        a=k/n*2*math.pi; x=math.sin(a)*0.15; y=-math.cos(a)*0.15+0.02
        if y<-0.08: continue
        tip=(x*1.6,y*1.5+0.03,HC+0.06+_r.uniform(-0.08,0.12)+(0.08 if y>0.05 else 0))
        spike('mecha',(x,y,HC+0.12),tip,0.07,(color2 if (color2 and k%4==0) else m),['head'],flat=0.5)
    for i in range(3):
        a=math.radians(-40+i*40); spike('topo',(math.sin(a)*0.07,0.02,HC+0.18),(math.sin(a)*0.16,0.1,HC+0.33+0.03*(i%2)),0.07,m,['head'],flat=0.5)
    xs=[(-0.11+i*0.22/(fringe-1)) for i in range(fringe)]
    for i,x in enumerate(xs): spike('franja',(x,-0.12,HC+0.15),(x*1.35+_r.uniform(-0.02,0.02),-0.185,HC+0.06+0.015*(i%2)),0.05,m,['head'],flat=0.45)
    for s in (1,-1): spike('lateral',(0.14*s,-0.05,HC+0.07),(0.18*s,-0.08,HC-0.08),0.05,m,['head'],flat=0.5)
def pose_between(arm, side, poses):
    """poses: lista de (cotovelo, mão) -> lista de (rot_braço, rot_antebraço)"""
    return [solve_arm(arm,side,e,h,step=6)[:2] for e,h in poses]
def idle_actions(arm, L=None, R=None, frames=(1,25,49,73,97)):
    """L/R: listas de poses (rot_braço, rot_antebraço) que se alternam no Idle"""
    def extra(f):
        i=frames.index(f) if f in frames else 0; d={}
        if L: u,fo=L[i%len(L)]; d.update(arm_L={'rot':u}, forearm_L={'rot':fo})
        if R: u,fo=R[i%len(R)]; d.update(arm_R={'rot':u}, forearm_R={'rot':fo})
        return d
    return extra
def finish_character(name, rig, anims=("Idle","Walk","Run","Jump","Swim","Wave"), talk=False, idle_arms=None, idle_extra=None, join_all=True):
    objs=[build_piece(n,rig) for n in list(PIECES.keys())]
    if join_all and len(objs)>1:
        bpy.ops.object.select_all(action='DESELECT')
        for o in objs: o.select_set(True)
        bpy.context.view_layer.objects.active=objs[0]; bpy.ops.object.join()
        o=bpy.context.active_object; o.name=name; o.data.name=name; objs=[o]
    make_anims3(rig, set_=anims, idle_arms=idle_arms, idle_extra=idle_extra, talk=talk)
    return objs
