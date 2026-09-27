
def hair_bob(m):
    ell('calota',(0,0.02,HC+0.055),(0.176,0.186,0.172),m,['head'],14,9)
    box('franja',(0,-0.14,HC+0.09),(0.13,0.035,0.05),m,['head'],bevel=0.02)
    for s in (1,-1): box('lado',(0.15*s,-0.03,HC-0.05),(0.035,0.11,0.14),m,['head'],bevel=0.02)
    ell('costas',(0,0.08,HC-0.06),(0.17,0.12,0.15),m,['head'],12,7)
def hair_short(m):
    ell('calota',(0,0.02,HC+0.05),(0.172,0.182,0.165),m,['head'],14,9)
    ell('nuca',(0,0.07,HC-0.04),(0.16,0.13,0.14),m,['head'],12,7)
    for x in (-0.1,-0.04,0.03,0.09): spike('franja',(x,-0.12,HC+0.14),(x*1.3,-0.18,HC+0.07),0.05,m,['head'],flat=0.45)
def hair_buns(m):
    hair_bob(m)
    for s in (1,-1): ell('coque',(0.12*s,0.04,HC+0.19),(0.07,0.07,0.065),m,['head'],10,7)
def hair_pony(m, tie):
    ell('calota',(0,0.02,HC+0.055),(0.172,0.182,0.168),m,['head'],14,9)
    add(prim('torus','prendedor',loc=(0,0.17,HC+0.02),rot=(math.pi/2,0,0),m=tie,major_radius=0.04,minor_radius=0.014,major_segments=10,minor_segments=4),['head'])
    ellab('rabo1',(0,0.18,HC+0.03),(0,0.27,HC-0.18),0.065,0.06,m,['head'],10,6)
    ellab('rabo2',(0,0.26,HC-0.15),(0,0.27,HC-0.36),0.055,0.05,m,['head','spine'],10,6)
    box('franja',(0.03,-0.14,HC+0.1),(0.11,0.03,0.04),m,['head'],rot=(0,0.2,0),bevel=0.015)
def npc(slug):
    clear(); PIECES.clear(); bpy.context.scene.render.fps=24
    RO=mat("Roupa@tint",{"generico":"#5E8C8A","ia-assistente":"#3E6FA8","web-designer":"#E07A9E","servidores":"#5E6B7A","design-grafico":"#E0A92E","editor-de-video":"#8E2F3C","google":"#4E8F55"}[slug])
    ES=mat("Escuro","#1E1A24"); WH=mat("Branco","#F7F3EA"); CB=mat("Cabelo","#2A2230"); CY=mat("Ciano@unlit","#5CE1E6",emit=True)
    CA=mat("Calca","#34384A"); SO=mat("Tenis","#E9E4D6"); TE=mat("Tela@unlit","#1B5E86",emit=True); MT=mat("Metal","#9C9A8E")
    skins={"generico":"#F2CDB0","ia-assistente":"#F6D2B8","web-designer":"#E8B894","servidores":"#D9A882","design-grafico":"#F6D2B8","editor-de-video":"#C98F6A","google":"#EFC4A4"}
    irises={"generico":"#5A4232","ia-assistente":"#3E6FA8","web-designer":"#4E3A2E","servidores":"#3B2A20","design-grafico":"#7A5AA8","editor-de-video":"#2E2420","google":"#4E8F55"}
    human_body('npc', skin_hex=skins[slug], iris=irises[slug])
    L=R=None; extra_head=None; poses={}
    if slug=="generico":
        hair_short(CB); c_torso(RO,0.205,0.19); c_sleeves(RO,long=False,r0=0.072,r1=0.068)
        add(prim('torus','gola',loc=(0,-0.005,1.51),m=WH,major_radius=0.075,minor_radius=0.014,major_segments=12,minor_segments=4),['spine'])
        box('cracha',(0.1,-0.155,1.33),(0.035,0.006,0.045),WH,['spine'])
        c_pants(CA); c_shoes(ES,WH,lace=WH)
        ell('bone',(0,0,HC+0.1),(0.18,0.19,0.12),RO,['head'],14,8); box('aba',(0,-0.2,HC+0.06),(0.13,0.09,0.012),RO,['head'],rot=(-0.12,0,0),bevel=0.02)
    elif slug=="ia-assistente":
        hair_bob(CB); c_torso(RO,0.215,0.195,sy=0.78); c_sleeves(RO,long=True,r0=0.09,r1=0.085)
        box('ziper',(0,-0.172,1.22),(0.006,0.006,0.27),CY,['spine','hips'])
        for s,sd in ((1,'L'),(-1,'R')): cyl('filete',(0.19*s,-0.07,1.46),(0.26*s,-0.07,1.21),0.008,CY,['arm.'+sd],4)
        cyl('gola',(0,0,1.49),(0,0,1.6),0.075,RO,['spine','head'],12)
        c_pants(ES); c_shoes(WH,ES,lace=ES)
        add(prim('torus','headset',loc=(0,0,HC+0.02),rot=(math.pi/2,0,0),m=ES,major_radius=0.19,minor_radius=0.013,major_segments=20,minor_segments=4),['head'])
        for s in (1,-1): add(prim('cyl','concha',loc=(0.175*s,0,HC-0.02),rot=(0,math.pi/2,0),m=ES,radius=0.055,depth=0.04,vertices=12),['head'])
        cyl('microfone',(0.17,-0.02,HC-0.05),(0.07,-0.17,HC-0.1),0.008,ES,['head'],6); ell('mic',(0.065,-0.175,HC-0.1),(0.015,0.015,0.015),CY,['head'],6,4)
        t=box('tablet',(0.02,-0.3,1.12),(0.14,0.09,0.008),ES,['spine'],rot=(0.9,0,0),bevel=0.01)
        box('tela',(0.02,-0.297,1.125),(0.125,0.078,0.004),TE,['spine'],rot=(0.9,0,0))
        ell('robo_cabeca',(0.02,-0.32,1.34),(0.05,0.045,0.04),CY,['spine'],10,6); box('robo_corpo',(0.02,-0.32,1.27),(0.035,0.02,0.035),CY,['spine'])
        for s in (1,-1): box('robo_braco',(0.02+0.05*s,-0.32,1.29),(0.012,0.008,0.028),CY,['spine'],rot=(0,0.6*s,0))
        poses=dict(L=[((0.24,-0.1,1.14),(0.12,-0.3,1.08))],R=[((-0.22,-0.12,1.16),(-0.01,-0.32,1.15)),((-0.22,-0.12,1.16),(-0.07,-0.3,1.13))])
    elif slug=="web-designer":
        hair_short(CB); c_torso(RO,0.205,0.19); c_sleeves(RO,long=False,r0=0.072,r1=0.068)
        box('estampa',(0,-0.155,1.25),(0.1,0.006,0.08),WH,['spine'])
        mat("Estampa","#F7F3EA"); bpy.data.objects[bpy.context.active_object.name].data.materials[0]=bpy.data.materials["Estampa"]
        c_pants(CA,wide=0.12,knee_r=0.108); c_shoes(ES,WH,lace=WH)
        for s in (1,-1): add(prim('torus','lente',loc=(0.066*s,-0.172,HC-0.005),rot=(math.pi/2,0,0),m=ES,major_radius=0.043,minor_radius=0.008,major_segments=14,minor_segments=4),['head'])
        cyl('ponte',(-0.024,-0.175,HC),(0.024,-0.175,HC),0.006,ES,['head'],4)
        box('note_base',(0.0,-0.31,1.07),(0.17,0.12,0.012),MT,['spine'],bevel=0.008)
        box('note_tela',(0.0,-0.22,1.17),(0.17,0.01,0.11),MT,['spine'],rot=(-0.25,0,0),bevel=0.008)
        box('note_logo',(0.0,-0.235,1.18),(0.03,0.004,0.03),CY,['spine'],rot=(-0.25,0,0))
        poses=dict(L=[((0.24,-0.12,1.13),(0.12,-0.32,1.05))],R=[((-0.22,-0.12,1.14),(-0.04,-0.36,1.09)),((-0.22,-0.12,1.14),(-0.02,-0.3,1.09))])
    elif slug=="servidores":
        hair_short(CB)
        c_torso(RO,0.215,0.195,sy=0.78); c_sleeves(RO,long=True,r0=0.09,r1=0.085); c_pants(RO,wide=0.128,knee_r=0.116)
        box('cracha',(0.1,-0.17,1.32),(0.04,0.006,0.055),WH,['spine']); box('cracha_faixa',(0.1,-0.176,1.35),(0.035,0.004,0.01),CY,['spine'])
        box('bolso_peito',(-0.09,-0.17,1.3),(0.06,0.006,0.05),RO,['spine'])
        cyl('cinto',(0,0,0.99),(0,0,1.03),0.22,ES,['hips'],14).scale=(1,0.78,1)
        c_shoes(ES,ES,lace=None)
        add(prim('torus','cabo_rolo',loc=(0.2,0.02,1.46),rot=(0,math.pi/2,0.3),m=ES,major_radius=0.12,minor_radius=0.018,major_segments=16,minor_segments=4),['spine'])
        add(prim('torus','cabo_rolo2',loc=(0.21,0.04,1.44),rot=(0,math.pi/2,0.5),m=CY,major_radius=0.11,minor_radius=0.012,major_segments=16,minor_segments=4),['spine'])
        cyl('cabo',(0.2,-0.08,1.4),(0.0,-0.32,1.25),0.012,CY,['spine'],6); box('conector',(-0.02,-0.33,1.25),(0.02,0.02,0.03),MT,['spine'])
        add(prim('torus','faixa_lanterna',loc=(0,0,HC+0.07),m=ES,major_radius=0.178,minor_radius=0.014,major_segments=20,minor_segments=4),['head'])
        box('lanterna',(0,-0.185,HC+0.08),(0.03,0.02,0.02),MT,['head']); ell('luz',(0,-0.205,HC+0.08),(0.018,0.006,0.015),CY,['head'],8,5)
        poses=dict(L=[((0.24,-0.12,1.18),(0.03,-0.32,1.26)),((0.24,-0.12,1.18),(0.05,-0.31,1.24))],R=[((-0.24,-0.12,1.16),(-0.04,-0.33,1.23)),((-0.24,-0.12,1.16),(-0.06,-0.32,1.21))])
        extra_head={'rot':(15,0,0)}
    elif slug=="design-grafico":
        hair_bob(CB); c_torso(WH,0.2,0.185); c_sleeves(WH,long=False,r0=0.07,r1=0.066)
        t=cyl('avental',(0,-0.02,0.7),(0,-0.02,1.38),0.215,RO,['hips','spine','leg.L','leg.R'],14,r2=0.19); t.scale=(1,0.8,1)
        for s in (1,-1): box('alca',(0.08*s,-0.12,1.43),(0.018,0.05,0.08),RO,['spine'])
        box('bolso_av',(0,-0.19,1.0),(0.1,0.008,0.06),RO,['hips','spine'])
        mat("Respingos","#F2EEE2"); box('respingos',(0.02,-0.19,1.17),(0.12,0.006,0.12),bpy.data.materials["Respingos"],['spine'])
        c_pants(CA,wide=0.118,knee_r=0.105); c_shoes(ES,WH,lace=WH)
        ell('boina',(0.035,0.02,HC+0.17),(0.205,0.2,0.075),mat("Boina","#8E2F3C"),['head'],16,8); ell('boina_pino',(0.035,0.02,HC+0.25),(0.016,0.016,0.022),mat("Boina","#8E2F3C"),['head'],6,4)
        cyl('pincel_orelha',(0.13,-0.08,HC+0.06),(0.2,0.06,HC+0.12),0.008,mat("MadeiraClara","#C9A26A"),['head'],6)
        cyl('pincel',(-0.315,-0.02,0.9),(-0.32,-0.02,0.72),0.01,mat("MadeiraClara","#C9A26A"),['forearm.R'],6); spike('cerdas',(-0.32,-0.02,0.72),(-0.322,-0.02,0.65),0.016,mat("TintaRosa","#E07A9E"),['forearm.R'],flat=1.0,verts=6)
        poses=dict(R=[((-0.3,-0.12,1.28),(-0.36,-0.36,1.48)),((-0.26,-0.16,1.3),(-0.12,-0.42,1.58)),((-0.3,-0.14,1.26),(-0.25,-0.42,1.4))])
    elif slug=="editor-de-video":
        hair_short(CB); c_torso(ES,0.2,0.185); c_sleeves(ES,long=False,r0=0.072,r1=0.068)
        t=cyl('colete',(0,0,0.98),(0,0,1.47),0.222,RO,['hips','spine'],14,r2=0.2); t.scale=(1,0.78,1)
        for x in (-0.11,0.11):
            for z in (1.08,1.25): box('bolso',(x,-0.172,z),(0.055,0.012,0.05),RO,['spine','hips'],bevel=0.008)
        c_pants(CA); c_shoes(WH,ES,lace=ES)
        ell('bone',(0,0.01,HC+0.1),(0.18,0.19,0.12),ES,['head'],14,8); box('aba_tras',(0,0.2,HC+0.05),(0.12,0.08,0.012),ES,['head'],rot=(0.15,0,0),bevel=0.02)
        add(prim('torus','fone_pescoco',loc=(0,-0.01,1.55),rot=(0.2,0,0),m=ES,major_radius=0.11,minor_radius=0.015,major_segments=16,minor_segments=4),['spine'])
        for s in (1,-1): add(prim('cyl','fone_c',loc=(0.1*s,-0.06,1.53),rot=(0,math.pi/2,0),m=ES,radius=0.045,depth=0.03,vertices=10),['spine'])
        box('camera',(0,-0.2,1.28),(0.08,0.045,0.055),ES,['spine'],bevel=0.012); cyl('lente',(0,-0.24,1.28),(0,-0.3,1.28),0.035,MT,['spine'],12)
        ell('rec',(0.06,-0.245,1.32),(0.008,0.004,0.008),mat("Rec@unlit","#FF3B30",emit=True),['spine'],6,4)
        cyl('alca_cam1',(0.07,-0.19,1.32),(0.08,-0.1,1.52),0.01,ES,['spine'],4); cyl('alca_cam2',(-0.07,-0.19,1.32),(-0.08,-0.1,1.52),0.01,ES,['spine'],4)
        poses=dict(L=[((0.26,-0.2,1.45),(0.13,-0.36,1.72)),((0.26,-0.2,1.45),(0.15,-0.36,1.7))],R=[((-0.26,-0.2,1.4),(-0.12,-0.36,1.62)),((-0.26,-0.2,1.4),(-0.14,-0.36,1.6))])
    elif slug=="google":
        hair_pony(CB, mat("Vinho","#8E2F3C"))
        c_torso(mat("Moletom","#E9E4D6"),0.205,0.19); cyl('capuz',(0,0.1,1.46),(0,0.12,1.55),0.1,mat("Moletom","#E9E4D6"),['spine'],12)
        t=cyl('blazer',(0,0,0.95),(0,0,1.5),0.222,RO,['hips','spine'],14,r2=0.198); t.scale=(1,0.78,1)
        for s in (1,-1): box('lapela',(0.07*s,-0.17,1.38),(0.035,0.01,0.1),RO,['spine'],rot=(0,0.25*s,0))
        c_sleeves(RO,long=True,r0=0.09,r1=0.084)
        box('cracha',(-0.1,-0.178,1.3),(0.045,0.006,0.055),mat("Grafico","#F7F3EA"),['spine'])
        c_pants(ES,wide=0.115,knee_r=0.1); c_shoes(ES,WH,lace=WH)
        add(prim('torus','lupa_aro',loc=(-0.066,-0.27,HC+0.0),rot=(math.pi/2,0,0),m=mat("Dourado","#E0A92E"),major_radius=0.085,minor_radius=0.014,major_segments=18,minor_segments=4),['head'])
        cyl('lupa_vidro',(-0.066,-0.272,HC),(-0.066,-0.268,HC),0.075,CY,['head'],16)
        cyl('lupa_cabo',(-0.066,-0.27,HC-0.085),(-0.05,-0.29,HC-0.22),0.016,mat("Madeira","#8A5A3B"),['head'],8)
        poses=dict(R=[((-0.24,-0.2,1.38),(-0.05,-0.3,HC-0.2))],L=[((0.22,-0.05,1.2),(0.28,-0.08,0.95))])
    rig=make_rig3("npc_rig",J5)
    L=[solve_arm(rig,'L',e,h,step=5)[:2] for e,h in poses.get('L',[])] or None
    R=[solve_arm(rig,'R',e,h,step=5)[:2] for e,h in poses.get('R',[])] or None
    base=idle_actions(rig,L,R)
    def extra(f):
        d=base(f)
        if extra_head: d['head']=extra_head
        return d
    objs=finish_character('npc',rig,anims=("Idle","Wave"),talk=True,idle_extra=extra if (L or R or extra_head) else None)
    return [rig]+objs
