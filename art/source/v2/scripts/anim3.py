
def _pose_tail(arm, rots):
    B=arm.data.bones; P={}
    def pm(n):
        if n in P: return P[n]
        b=B[n]; r=rots.get(n,(0,0,0))
        R=Euler([math.radians(x) for x in r],'XYZ').to_matrix().to_4x4()
        M=(pm(b.parent.name) @ (b.parent.matrix_local.inverted() @ b.matrix_local) @ R) if b.parent else (b.matrix_local @ R)
        P[n]=M; return M
    return lambda n: pm(n) @ Vector((0,B[n].length,0))
def fwd_sign(arm, bone):
    t=_pose_tail(arm,{bone:(40,0,0)})(bone).y; t2=_pose_tail(arm,{bone:(-40,0,0)})(bone).y
    return 1 if t<t2 else -1
def solve_arm(arm, side, elbow_t, hand_t, step=4):
    up='arm.'+side; fo='forearm.'+side; best=None; rng=range(-180,181,step)
    for rx in rng:
        for rz in rng:
            d=(_pose_tail(arm,{up:(rx,0,rz)})(up)-Vector(elbow_t)).length
            if best is None or d<best[0]: best=(d,rx,rz)
    _,rx,rz=best; b2=None
    for fx in rng:
        for fz in rng:
            d=(_pose_tail(arm,{up:(rx,0,rz),fo:(fx,0,fz)})(fo)-Vector(hand_t)).length
            if b2 is None or d<b2[0]: b2=(d,fx,fz)
    return (rx,0,rz),(b2[1],0,b2[2]),best[0],b2[0]

MAP={'tail1':'tail.1','tail2':'tail.2'}
def make_anims3(arm, set_=("Idle","Walk","Run","Jump","Swim","Wave"), prefix="", idle_arms=None, idle_extra=None, talk=False):
    bpy.context.view_layer.objects.active=arm
    bpy.ops.object.mode_set(mode='POSE')
    P=arm.pose.bones
    for pb in P: pb.rotation_mode='XYZ'
    if not arm.animation_data: arm.animation_data_create()
    R=math.radians
    sa=fwd_sign(arm,'arm.L'); sf=fwd_sign(arm,'forearm.L'); sl=fwd_sign(arm,'leg.L'); ss=fwd_sign(arm,'spine'); sk=-fwd_sign(arm,'shin.L')
    def reset():
        for pb in P: pb.location=(0,0,0); pb.rotation_euler=(0,0,0)
    def key(f):
        for pb in P: pb.keyframe_insert("location",frame=f); pb.keyframe_insert("rotation_euler",frame=f)
    def new_action(name):
        a=bpy.data.actions.get(prefix+name)
        if a: bpy.data.actions.remove(a)
        a=bpy.data.actions.new(prefix+name); a.use_fake_user=True; arm.animation_data.action=a; return a
    def setp(**kw):
        for k,v in kw.items():
            n=MAP.get(k, k.replace('_L','.L').replace('_R','.R'))
            if n not in P: continue
            if 'loc' in v: P[n].location=v['loc']
            if 'rot' in v: P[n].rotation_euler=[R(x) for x in v['rot']]
    def pose(f, **kw): reset(); setp(**kw); key(f)
    def rest_arms(t=0):
        if idle_arms:
            (uL,fL),(uR,fR)=idle_arms
            return dict(arm_L={'rot':(uL[0],uL[1],uL[2]+1.5*t)}, forearm_L={'rot':fL}, arm_R={'rot':(uR[0],uR[1],uR[2]-1.5*t)}, forearm_R={'rot':fR})
        return dict(arm_L={'rot':(3*t*sa,0,6+2*t)}, arm_R={'rot':(-2*t*sa,0,-6-2*t)}, forearm_L={'rot':(10*sf,0,0)}, forearm_R={'rot':(12*sf,0,0)})
    if "Idle" in set_:
        new_action("Idle")
        # 4 s: respira, troca o peso de perna e olha em volta
        keys=[(1,0,0,0),(25,1,1,0),(49,0,1,25),(73,1,0,-20),(97,0,0,0)]
        for f,br,wt,yaw in keys:
            w=wt*2-1
            kw=dict(hips={'loc':(0.025*w,0.006*br,0),'rot':(0,2.5*w,0)}, spine={'rot':(1.5*br*ss,-2*w,0)},
                    head={'rot':(-2*br*ss,yaw,-2*w)}, leg_L={'rot':(0,0,-2*w)}, leg_R={'rot':(0,0,-2*w)},
                    shin_L={'rot':((6 if w<0 else 0)*sk,0,0)}, shin_R={'rot':((6 if w>0 else 0)*sk,0,0)},
                    tail1={'rot':(0,0,-12+24*br)}, tail2={'rot':(0,0,-18+36*br)})
            kw.update(rest_arms(br))
            if idle_extra: kw.update(idle_extra(f))
            pose(f,**kw)
    def cycle(name, frames, leg, swing_knee, arm_a, fore, lean, bob, tail):
        new_action(name)
        n=len(frames)-1
        for i,f in enumerate(frames):
            ph=i%4
            # (legL, kneeL, legR, kneeR, altura)
            tab=[(leg,6,-leg*0.8,swing_knee*0.45,0),(0,8,leg*0.4,swing_knee,bob),(-leg*0.8,swing_knee*0.45,leg,6,0),(leg*0.4,swing_knee,0,8,bob)][ph]
            lL,kL,lR,kR,up=tab
            pose(f, hips={'loc':(0,up,0),'rot':(0,(3 if ph in (0,1) else -3),0)}, spine={'rot':(lean*ss,(-4 if ph in (0,1) else 4),0)},
                 leg_L={'rot':(lL*sl,0,0)}, leg_R={'rot':(lR*sl,0,0)}, shin_L={'rot':(kL*sk,0,0)}, shin_R={'rot':(kR*sk,0,0)},
                 arm_L={'rot':(-lL*arm_a*sa,0,8)}, arm_R={'rot':(-lR*arm_a*sa,0,-8)}, forearm_L={'rot':(fore*sf,0,0)}, forearm_R={'rot':(fore*sf,0,0)},
                 head={'rot':(-lean*0.5*ss,0,0)}, tail1={'rot':(-tail*ss,0,(15 if ph<2 else -15))}, tail2={'rot':(0,0,(25 if ph<2 else -25))})
    if "Walk" in set_: cycle("Walk",[1,7,13,19,25],28,50,0.8,22,3,0.035,0)
    if "Run" in set_: cycle("Run",[1,4.5,8,11.5,15],48,95,1.1,85,14,0.07,25)
    if "Jump" in set_:
        new_action("Jump")
        for f,t in ((1,0),(7,1),(13,0)):
            pose(f, leg_L={'rot':((50+5*t)*sl,0,0)}, shin_L={'rot':((70+5*t)*sk,0,0)}, leg_R={'rot':(-10*sl,0,0)}, shin_R={'rot':(35*sk,0,0)},
                 arm_L={'rot':(0,0,-115-5*t)}, arm_R={'rot':(0,0,115+5*t)}, forearm_L={'rot':(25*sf,0,0)}, forearm_R={'rot':(25*sf,0,0)},
                 spine={'rot':(-4*ss,0,0)}, head={'rot':(-8*ss,0,0)}, tail1={'rot':(-35*ss,0,0)}, tail2={'rot':(-20*ss,0,0)})
    if "Swim" in set_:
        new_action("Swim")
        rest=arm.data.bones['root'].matrix_local
        for f,s in ((1,1),(9,0),(17,-1),(25,0),(33,1)):
            reset()
            M=Matrix.Translation((0,0.9,-0.3)) @ Matrix.Rotation(R(78),4,'X') @ rest
            P['root'].matrix_basis = rest.inverted() @ M
            setp(head={'rot':(-55*ss,4*s,0)}, leg_L={'rot':(15*s*sl,0,0)}, leg_R={'rot':(-15*s*sl,0,0)}, shin_L={'rot':((20-10*s)*sk,0,0)}, shin_R={'rot':((20+10*s)*sk,0,0)},
                 arm_L={'rot':((75+55*s)*sa,0,-25)}, arm_R={'rot':((75-55*s)*sa,0,25)}, forearm_L={'rot':(25*sf,0,0)}, forearm_R={'rot':(25*sf,0,0)},
                 tail1={'rot':(-40*ss,0,20*s)}, tail2={'rot':(0,0,25*s)})
            key(f)
    if "Wave" in set_:
        new_action("Wave")
        for f,s in ((1,0),(7,1),(13,-1),(19,1),(25,-1),(31,1),(37,0)):
            kw=dict(arm_R={'rot':(-10*sa,0,150)}, forearm_R={'rot':(0,0,(25*s))}, arm_L={'rot':(0,0,6)}, forearm_L={'rot':(10*sf,0,0)},
                    head={'rot':(0,-8,4)}, spine={'rot':(0,0,3)}, tail1={'rot':(0,0,20*s)}, tail2={'rot':(0,0,30*s)})
            if f in (1,37): kw.update(arm_R={'rot':(-5*sa,0,110)}, forearm_R={'rot':(0,0,0)})
            pose(f,**kw)
    if talk:
        new_action("Talk")
        for f,s in ((1,0),(13,1),(25,-1),(37,1),(49,0)):
            pose(f, arm_L={'rot':((25+10*s)*sa,0,10)}, forearm_L={'rot':((55+15*s)*sf,0,0)}, arm_R={'rot':((25-10*s)*sa,0,-10)}, forearm_R={'rot':((55-15*s)*sf,0,0)},
                 head={'rot':(-3*s*ss,6*s,0)}, spine={'rot':(2*ss,0,0)})
    bpy.ops.object.mode_set(mode='OBJECT')
    arm.animation_data.action=bpy.data.actions[prefix+("Idle" if "Idle" in set_ else set_[0])]
