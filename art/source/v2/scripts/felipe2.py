
clear(); PIECES.clear(); bpy.context.scene.render.fps=24
HR=mat("Cabelo","#16121A"); HR2=mat("CabeloBrilho","#2E2742"); TS=mat("Camiseta","#1E1A24"); ES=mat("Estampa","#1E1A24")
OR=mat("Laranja","#FF5A02"); SH=mat("Bermuda","#26222C"); WH=mat("Branco","#F7F3EA"); SO=mat("Tenis","#1E1A24")
human_body('felipe', skin_hex="#EFC4A4", iris="#5FA83A")
spiky_hair(HR, n=18, fringe=6, color2=HR2)
c_torso(TS,0.205,0.19)
box('estampa',(0.0,-0.156,1.22),(0.1,0.006,0.1),ES,['spine'])
box('estampa2',(-0.05,-0.154,1.07),(0.05,0.006,0.05),ES,['spine','hips'])
add(prim('torus','gola',loc=(0,-0.005,1.51),m=OR,major_radius=0.075,minor_radius=0.012,major_segments=12,minor_segments=4),['spine'])
cyl('barra',(0,0,0.95),(0,0,0.99),0.21,TS,['hips'],14).scale=(1,0.76,1)
c_sleeves(TS,long=False,r0=0.07,r1=0.066)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('manga_faixa',(0.222*s,0,1.335),(0.228*s,0,1.315),0.068,OR,['arm.'+sd],10)
    spike('manga_chama',(0.24*s,-0.02,1.4),(0.26*s,-0.05,1.45),0.02,OR,['arm.'+sd],flat=0.3)
c_pants(SH,wide=0.125,knee_r=0.112,shorts=True)
for s,sd in ((1,'L'),(-1,'R')):
    cyl('meia',(0.1*s,0,0.1),(0.1*s,0,0.2),0.05,WH,['shin.'+sd],10)
c_shoes(SO,WH,lace=WH)
rig=make_rig3("felipe_rig",J5)
(uL,fL,_,_) =solve_arm(rig,'L',(0.17,-0.14,1.2),(-0.1,-0.21,1.3),step=5)
(uR,fR,_,_) =solve_arm(rig,'R',(-0.18,-0.16,1.18),(0.1,-0.24,1.25),step=5)
OBJS=[rig]+finish_character('felipe',rig,anims=("Idle","Wave"),talk=True,idle_arms=((uL,fL),(uR,fR)))
