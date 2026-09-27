
def _pose_tail(arm, rots):
    """calcula posição (armature space) das pontas dos ossos com rotações euler (graus) dadas, sem mexer na cena"""
    B=arm.data.bones; P={}
    def pm(n):
        if n in P: return P[n]
        b=B[n]; r=rots.get(n,(0,0,0))
        R=Euler([math.radians(x) for x in r],'XYZ').to_matrix().to_4x4()
        if b.parent: M=pm(b.parent.name) @ (b.parent.matrix_local.inverted() @ b.matrix_local) @ R
        else: M=b.matrix_local @ R
        P[n]=M; return M
    return lambda n: pm(n) @ Vector((0,B[n].length,0))

def solve_arm(arm, side, elbow_t, hand_t, step=5):
    up='arm.'+side; fo='forearm.'+side; best=None
    rng=range(-180,181,step)
    for rx in rng:
        for rz in rng:
            e=_pose_tail(arm,{up:(rx,0,rz)})(up); d=(e-Vector(elbow_t)).length
            if best is None or d<best[0]: best=(d,rx,rz)
    _,rx,rz=best; best2=None
    for fx in rng:
        for fz in rng:
            h=_pose_tail(arm,{up:(rx,0,rz),fo:(fx,0,fz)})(fo); d=(h-Vector(hand_t)).length
            if best2 is None or d<best2[0]: best2=(d,fx,fz)
    return (rx,0,rz),(best2[1],0,best2[2]),best[0],best2[0]

def fwd_sign(arm, bone):
    """sinal da rotação X que leva a ponta do osso para a frente (-Y)"""
    t=_pose_tail(arm,{bone:(40,0,0)})(bone).y; t2=_pose_tail(arm,{bone:(-40,0,0)})(bone).y
    return 1 if t<t2 else -1

MAP={'tail1':'tail.1','tail2':'tail.2'}
def make_anims(arm, prefix="", set_=("Idle","Walk","Run","Jump","Swim"), idle_arms=None):
    bpy.context.view_layer.objects.active=arm
    bpy.ops.object.mode_set(mode='POSE')
    P=arm.pose.bones
    for pb in P: pb.rotation_mode='XYZ'
    if not arm.animation_data: arm.animation_data_create()
    R=math.radians
    sa=fwd_sign(arm,'arm.L'); sf=fwd_sign(arm,'forearm.L'); sl=fwd_sign(arm,'leg.L'); ss=fwd_sign(arm,'spine')
    def reset():
        for pb in P: pb.location=(0,0,0); pb.rotation_euler=(0,0,0)
    def key(f):
        for pb in P:
            pb.keyframe_insert("location",frame=f); pb.keyframe_insert("rotation_euler",frame=f)
    def new_action(name):
        a=bpy.data.actions.get(prefix+name)
        if a: bpy.data.actions.remove(a)
        a=bpy.data.actions.new(prefix+name); a.use_fake_user=True
        arm.animation_data.action=a; return a
    def setp(**kw):
        for k,v in kw.items():
            n=MAP.get(k, k.replace('_L','.L').replace('_R','.R'))
            if n not in P: continue
            if 'loc' in v: P[n].location=v['loc']
            if 'rot' in v: P[n].rotation_euler=[R(x) for x in v['rot']]
    def pose(f, **kw): reset(); setp(**kw); key(f)
    # convenções: a*sa = braço p/ frente; f*sf = antebraço dobrando p/ frente; l*sl = perna p/ frente; s*ss = tronco p/ frente
    if "Idle" in set_:
        new_action("Idle")
        for f,t in ((1,0),(25,1),(49,0)):
            kw=dict(hips={'loc':(0,0.012*t,0)}, spine={'rot':(2*t*ss,0,0)}, head={'rot':(-3*t*ss,0,3*t)},
                 tail1={'rot':(0,0,-12+24*t)}, tail2={'rot':(0,0,-18+36*t)})
            if idle_arms:
                (uL,fL),(uR,fR)=idle_arms
                kw.update(arm_L={'rot':(uL[0],uL[1],uL[2]+1.5*t)}, forearm_L={'rot':fL}, arm_R={'rot':(uR[0],uR[1],uR[2]-1.5*t)}, forearm_R={'rot':fR})
            else:
                kw.update(arm_L={'rot':(3*t*sa,0,4+3*t)}, arm_R={'rot':(3*t*sa,0,-4-3*t)}, forearm_L={'rot':(8*sf,0,0)}, forearm_R={'rot':(8*sf,0,0)})
            pose(f,**kw)
    if "Walk" in set_:
        new_action("Walk")
        for f,s in ((1,1),(7,0),(13,-1),(19,0),(25,1)):
            b=0.04 if s==0 else 0
            pose(f, hips={'loc':(0,b,0)}, leg_L={'rot':(30*s*sl,0,0)}, leg_R={'rot':(-30*s*sl,0,0)},
                 arm_L={'rot':(-25*s*sa,0,5)}, arm_R={'rot':(25*s*sa,0,-5)}, forearm_L={'rot':((15-10*s)*sf,0,0)}, forearm_R={'rot':((15+10*s)*sf,0,0)},
                 head={'rot':(0,0,3*s)}, tail1={'rot':(0,0,15*s)}, tail2={'rot':(0,0,25*s)})
    if "Run" in set_:
        new_action("Run")
        for f,s in ((1,1),(5,0),(9,-1),(13,0),(17,1)):
            b=0.08 if s==0 else 0
            pose(f, hips={'loc':(0,b,0)}, spine={'rot':(12*ss,0,0)}, leg_L={'rot':(50*s*sl,0,0)}, leg_R={'rot':(-50*s*sl,0,0)},
                 arm_L={'rot':(-50*s*sa,0,10)}, arm_R={'rot':(50*s*sa,0,-10)}, forearm_L={'rot':(75*sf,0,0)}, forearm_R={'rot':(75*sf,0,0)},
                 head={'rot':(-8*ss,0,0)}, tail1={'rot':(-25*ss,0,20*s)}, tail2={'rot':(0,0,30*s)})
    if "Jump" in set_:
        new_action("Jump")
        for f in (1,9):
            pose(f, leg_L={'rot':(45*sl,0,0)}, leg_R={'rot':(-15*sl,0,0)}, arm_L={'rot':(0,0,-115)}, arm_R={'rot':(0,0,115)},
                 forearm_L={'rot':(20*sf,0,0)}, forearm_R={'rot':(20*sf,0,0)}, head={'rot':(-10*ss,0,0)}, tail1={'rot':(-35*ss,0,0)}, tail2={'rot':(-20*ss,0,0)})
    if "Swim" in set_:
        new_action("Swim")
        rest=arm.data.bones['root'].matrix_local
        for f,s in ((1,1),(9,0),(17,-1),(25,0),(33,1)):
            reset()
            M=Matrix.Translation((0,0.75,-0.25)) @ Matrix.Rotation(R(78),4,'X') @ rest
            P['root'].matrix_basis = rest.inverted() @ M
            setp(head={'rot':(-55*ss,0,4*s)}, leg_L={'rot':(18*s*sl,0,0)}, leg_R={'rot':(-18*s*sl,0,0)},
                 arm_L={'rot':((70+50*s)*sa,0,-30)}, arm_R={'rot':((70-50*s)*sa,0,30)}, forearm_L={'rot':(20*sf,0,0)}, forearm_R={'rot':(20*sf,0,0)},
                 tail1={'rot':(-40*ss,0,20*s)}, tail2={'rot':(0,0,25*s)})
            key(f)
    bpy.ops.object.mode_set(mode='OBJECT')
    arm.animation_data.action=bpy.data.actions[prefix+"Idle"] if "Idle" in set_ else None
