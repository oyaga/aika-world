
def predio(slug):
    clear()
    COLORS={"generico":"#B9B6A8","ia-assistente":"#9CC6D6","web-designer":"#E6B8C8","servidores":"#A9B2BC","design-grafico":"#F0D08A","editor-de-video":"#C98A8A","google":"#A9CFA0"}
    PA=mat("Parede@tint",COLORS[slug]); CO=mat("Concreto","#9C9A8E"); ES=mat("Escuro","#2A2630"); MT=mat("Metal","#B9B6A8")
    VD=mat("Vidro","#2B4A5E"); TL=mat("Toldo","#8E2F3C"); LZ=mat("Luz@unlit","#FFD9A0",emit=True); BR=mat("Brilho@unlit","#FF5A02",emit=True)
    TE=mat("Tela@unlit","#1B5E86",emit=True); PL=mat("Placa","#1E1A24"); MA=mat("Madeira","#8A5A3B")
    P=[]
    def a(o): P.append(o); return o
    def box(n,c,s,m,rot=(0,0,0),bev=0):
        o=a(prim('cube',n,loc=c,scale=s,m=m,rot=rot))
        if bev: mo=o.modifiers.new("b",'BEVEL'); mo.width=bev; mo.segments=1
        return o
    def cyl(n,c,r,d,m,rot=(0,0,0),v=10): return a(prim('cyl',n,loc=c,rot=rot,m=m,radius=r,depth=d,vertices=v))
    W,Dp=1.5,1.3; F=-Dp
    # base e estrutura
    box('base',(0,-0.1,0.06),(W+0.08,Dp+0.18,0.06),CO,bev=0.02)
    box('parede_fundo',(0,Dp-0.08,1.85),(W,0.08,1.75),PA)
    for s in (1,-1): box('parede_lado',(s*(W-0.08),0,1.85),(0.08,Dp,1.75),PA)
    box('laje',(0,0,2.02),(W+0.06,Dp+0.06,0.07),CO,bev=0.02)
    box('fachada_sup',(0,F+0.08,2.8),(W,0.08,0.72),PA)
    box('platibanda',(0,0,3.62),(W+0.05,Dp+0.05,0.1),CO,bev=0.02)
    box('teto',(0,0,3.54),(W-0.02,Dp-0.02,0.04),CO)
    for s in (1,-1): box('pilar',(s*(W-0.1),F+0.1,1.0),(0.1,0.1,0.95),CO,bev=0.02)
    box('viga',(0,F+0.1,1.9),(W,0.1,0.08),CO)
    # térreo: vitrine aberta (esq) + porta (dir, x=+0.75); interior escuro visível
    VE=mat("Interior","#23303A")
    box('interior',(0,Dp-0.2,1.0),(W-0.16,0.02,0.9),VE)
    for (x,z,sx,sz) in ((-0.55,0.32,0.8,0.04),(-0.55,1.7,0.8,0.04),(-1.33,1.01,0.04,0.71),(0.23,1.01,0.04,0.71)): box('vitrine_moldura',(x,F+0.1,z),(sx,0.05,sz),MT)
    if slug not in ('ia-assistente','web-designer','servidores'): box('balcao',(-0.55,F+0.45,0.5),(0.7,0.2,0.4),MA)
    for (x,z,sx,sz) in ((0.75,1.78,0.44,0.04),(0.33,0.95,0.04,0.85),(1.17,0.95,0.04,0.85)): box('porta_moldura',(x,F+0.1,z),(sx,0.05,sz),MT)
    box('porta',(0.75,F+0.08,0.93),(0.38,0.015,0.8),VD)
    box('macaneta',(0.45,F+0.055,0.95),(0.012,0.02,0.1),MT)
    box('degrau',(0.75,F-0.12,0.1),(0.45,0.14,0.05),CO)
    # toldo
    box('toldo',(0,F-0.28,1.98),(W-0.05,0.3,0.03),TL,rot=(-0.35,0,0))
    box('toldo_aba',(0,F-0.56,1.86),(W-0.05,0.01,0.08),TL)
    # letreiro (glifos) com moldura laranja neon
    box('letreiro',(0,F-0.02,2.55),(1.05,0.04,0.32),PL)
    box('letreiro_glifos',(0,F-0.065,2.55),(0.98,0.005,0.26),mat("Letreiro","#1E1A24"))
    for (x,z,sx,sz) in ((0,2.89,1.1,0.025),(0,2.21,1.1,0.025),(-1.1,2.55,0.025,0.36),(1.1,2.55,0.025,0.36)): box('moldura',(x,F-0.05,z),(sx,0.03,sz),BR)
    # janelas 2º andar
    for x in (-0.95,0.95):
        box('janela_m',(x,F+0.04,3.1),(0.32,0.04,0.3),MT); box('janela',(x,F+0.02,3.1),(0.27,0.02,0.25),LZ)
        box('janela_div',(x,F+0.005,3.1),(0.01,0.01,0.25),MT)
    # ar-condicionado, canos, medidor, fios
    box('ac',(0.0,F-0.1,3.2),(0.22,0.12,0.14),MT,bev=0.015); box('ac_grade',(0.0,F-0.225,3.2),(0.18,0.005,0.1),ES)
    cyl('ac_cano',(0.25,F-0.02,3.0),0.015,0.5,ES,v=6)
    cyl('cano',(W+0.03,F+0.3,1.8),0.04,3.6,MT,v=8); cyl('cano2',(W+0.03,F+0.5,1.8),0.025,3.6,ES,v=6)
    box('medidor',(-(W+0.03),F+0.4,1.4),(0.03,0.12,0.16),MT)
    for k in range(3): a(bar('fio',Vector((-(W+0.05),F+0.4,1.56)),Vector((-(W+0.05)-0.02*k,F+0.5+0.2*k,3.7)),0.008,ES))
    box('caixa_dagua',(-0.8,0.4,3.95),(0.3,0.3,0.25),MT,bev=0.03)
    for s in (1,-1): cyl('pe_caixa',(-0.8+0.2*s,0.4,3.7),0.02,0.2,ES,v=6)
    # ----- temas -----
    if slug=="ia-assistente":
        CY=mat("Ciano@unlit","#5CE1E6",emit=True)
        box('tela_chat',(-0.55,F+0.62,1.1),(0.6,0.01,0.45),TE)
        a(prim('uv','robo_cabeca',loc=(-0.2,F+0.3,1.12),m=MT,radius=0.1,segments=12,ring_count=8))
        box('robo_corpo',(-0.2,F+0.3,0.88),(0.09,0.07,0.12),MT,bev=0.02)
        for s in (1,-1): a(prim('uv','robo_olho',loc=(-0.2+0.035*s,F+0.21,1.13),m=CY,radius=0.018,segments=8,ring_count=5))
        a(bar('robo_braco',Vector((-0.12,F+0.3,0.95)),Vector((-0.02,F+0.28,1.12)),0.02,MT))
        cyl('antena_haste',(0.7,0.2,3.95),0.03,0.5,ES,v=8)
        a(prim('cone','parabolica',loc=(0.7,0.1,4.25),rot=(1.1,0,0.4),m=MT,radius1=0.38,radius2=0.05,depth=0.18,vertices=16))
        a(prim('uv','antena_led',loc=(0.7,0.2,4.22),m=CY,radius=0.03,segments=8,ring_count=5))
    elif slug=="web-designer":
        for i,x in enumerate((-0.95,-0.55,-0.15)):
            box('monitor',(x,F+0.25,1.05),(0.17,0.03,0.12),ES,bev=0.01); box('monitor_tela',(x,F+0.215,1.05),(0.15,0.005,0.1),TE)
            box('monitor_pe',(x,F+0.26,0.88),(0.03,0.03,0.05),ES)
        box('mesa',(-0.55,F+0.3,0.8),(0.6,0.15,0.03),MA)
        for k,x in enumerate((-0.92,-0.84,-0.76)): a(prim('uv','ponto_janela',loc=(x,F-0.07,2.78),m=[mat("Vermelho","#E0604A"),mat("Amarelo","#E0A92E"),mat("Verde","#4E8F55")][k],radius=0.025,segments=8,ring_count=5))
        a(prim('cone','cursor',loc=(0.78,F-0.1,2.38),rot=(math.pi/2,0,0.5),m=mat("Branco","#F7F3EA"),radius1=0.08,radius2=0.0,depth=0.04,vertices=3))
    elif slug=="servidores":
        CY=mat("Ciano@unlit","#5CE1E6",emit=True)

        for x in (-0.95,-0.55,-0.15):
            box('rack',(x,F+0.35,0.95),(0.16,0.2,0.62),ES)
            for z in (0.5,0.65,0.8,0.95,1.1,1.25,1.4): box('led',(x-0.08,F+0.145,z),(0.012,0.004,0.012),CY if int(z*20)%3 else LZ)
        box('porta_metal',(0.75,F+0.055,0.93),(0.36,0.01,0.8),MT)
        for z in [0.2+i*0.1 for i in range(16)]: box('ranhura',(0.75,F+0.045,z),(0.35,0.005,0.006),ES)
        for x,z in ((-0.95,3.45),(0.5,3.2),(1.25,1.2)):
            box('ac',(x,F-0.1,z),(0.22,0.12,0.14),MT,bev=0.015); box('ac_grade',(x,F-0.225,z),(0.18,0.005,0.1),ES)
        for s in (1,-1):
            a(prim('torus','ventilador',loc=(s*(W+0.02),0.3,2.7),rot=(0,math.pi/2,0),m=MT,major_radius=0.22,minor_radius=0.03,major_segments=16,minor_segments=4))
            box('helice',(s*(W+0.02),0.3,2.7),(0.01,0.2,0.04),ES,rot=(0.7,0,0)); box('helice2',(s*(W+0.02),0.3,2.7),(0.01,0.2,0.04),ES,rot=(-0.7,0,0))
    elif slug=="design-grafico":
        a(prim('cyl','paleta',loc=(0.0,F-0.12,2.98),rot=(math.pi/2,0,0),m=mat("Paleta","#E9D8A6"),radius=0.34,depth=0.04,vertices=16))
        for k,(dx,dz,c) in enumerate(((-0.15,0.1,"#FF5A02"),(0.0,0.17,"#5CE1E6"),(0.15,0.1,"#F4A6C0"),(0.18,-0.06,"#4E8F55"),(-0.12,-0.1,"#E0A92E"))):
            a(prim('uv','tinta',loc=(dx,F-0.15,2.98+dz),m=mat("Tinta"+str(k),c),radius=0.05,segments=8,ring_count=5))
        a(bar('pincel_gigante',Vector((0.35,F-0.2,2.7)),Vector((0.95,F-0.2,3.4)),0.035,MA))
        a(prim('cone','cerdas',loc=(0.3,F-0.2,2.64),rot=(0,2.4,0),m=mat("Tinta0","#FF5A02"),radius1=0.07,radius2=0.03,depth=0.18,vertices=8))
        for k,(x,z) in enumerate(((-1.5-0.06,1.2),(1.5+0.06,1.0),(-1.5-0.06,2.7))):
            box('cartaz',(x,0.0+0.3*k,z),(0.01,0.3,0.4),mat("Cartaz","#F2EEE2"))
        for k,(x,y,r) in enumerate(((-1.1,F-0.9,0.22),(-0.7,F-1.2,0.14),(-1.3,F-1.4,0.1))):
            a(prim('cyl','respingo',loc=(x,y,0.005),m=mat("Tinta"+str(k+1),["#5CE1E6","#F4A6C0","#E0A92E"][k]),radius=r,depth=0.01,vertices=10))
    elif slug=="editor-de-video":
        RC=mat("Rec@unlit","#FF3B30",emit=True)
        box('claquete',(0.0,F-0.12,3.0),(0.4,0.03,0.25),mat("Claquete","#1E1A24"))
        box('claquete_topo',(0.0,F-0.12,3.32),(0.42,0.03,0.05),mat("Claquete","#1E1A24"),rot=(0,0.18,0))
        box('no_ar',(0.95,F-0.07,2.38),(0.22,0.03,0.08),RC)
        cyl('tripe_haste',(-1.15,F-1.0,0.75),0.02,1.5,ES,v=6)
        for k in range(3):
            an=k*2.09; a(bar('tripe_pe',Vector((-1.15,F-1.0,0.8)),Vector((-1.15+0.3*math.cos(an),F-1.0+0.3*math.sin(an),0.0)),0.015,ES))
        box('camera',(-1.15,F-1.0,1.55),(0.12,0.08,0.08),ES,bev=0.01); cyl('lente',(-1.15,F-1.12,1.55),0.05,0.1,MT,rot=(math.pi/2,0,0),v=12)
        cyl('refletor_haste',(-0.45,F-1.25,0.8),0.02,1.6,ES,v=6)
        box('softbox',(-0.45,F-1.25,1.65),(0.25,0.06,0.2),MT,rot=(0,0,0.5)); box('softbox_luz',(-0.43,F-1.31,1.65),(0.22,0.005,0.17),LZ,rot=(0,0,0.5))
    elif slug=="google":
        a(prim('torus','lupa',loc=(-0.25,F-0.15,3.0),rot=(math.pi/2,0,0),m=mat("Dourado","#E0A92E"),major_radius=0.26,minor_radius=0.05,major_segments=20,minor_segments=5))
        cyl('lupa_vidro',(-0.25,F-0.15,3.0),0.22,0.02,mat("Ciano@unlit","#5CE1E6",emit=True),rot=(math.pi/2,0,0),v=16)
        a(bar('lupa_cabo',Vector((-0.07,F-0.15,2.82)),Vector((0.3,F-0.15,2.45)),0.045,MA))
        for k,(x,z) in enumerate(((-1.5-0.06,1.1),(1.5+0.06,1.2))):
            box('grafico',(x,0.2,z),(0.01,0.35,0.35),mat("Grafico","#F7F3EA"))
        box('ranking',(-1.1,F-0.9,1.1),(0.3,0.03,0.2),mat("Ranking","#1E1A24")); box('ranking_pe',(-1.1,F-0.9,0.45),(0.03,0.03,0.45),ES)
        for k in range(5): a(prim('cone','estrela',loc=(-1.36+k*0.13,F-0.94,1.18),rot=(math.pi/2,0,0),m=mat("Dourado","#E0A92E"),radius1=0.05,radius2=0.0,depth=0.02,vertices=5))
    apply_all(P)
    for o in P:
        for mo in list(o.modifiers):
            bpy.context.view_layer.objects.active=o; bpy.ops.object.modifier_apply(modifier=mo.name)
    bpy.ops.object.select_all(action='DESELECT')
    for o in P: o.select_set(True)
    bpy.context.view_layer.objects.active=P[0]; bpy.ops.object.join()
    o=bpy.context.active_object; nm="servico" if slug=="generico" else "servico_"+slug; o.name=nm; o.data.name=nm
    return o
