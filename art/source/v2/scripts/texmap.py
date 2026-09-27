
def tex_material(name, img_path, unlit=False, repeat=False, tint_base=None):
    m=bpy.data.materials.get(name)
    if m and m.get("_img")==img_path: return m
    if m: m["_src"]=m.get("_src",name); m.name=name+"_old"
    m=bpy.data.materials.new(name); m.use_nodes=True; m["_img"]=img_path
    nt=m.node_tree; p=nt.nodes.get("Principled BSDF")
    p.inputs["Roughness"].default_value=1.0
    img=bpy.data.images.load(img_path, check_existing=True)
    t=nt.nodes.new("ShaderNodeTexImage"); t.image=img; t.interpolation='Linear'
    t.extension='REPEAT' if repeat else 'EXTEND'
    if tint_base:
        mx=nt.nodes.new("ShaderNodeMix"); mx.data_type='RGBA'; mx.blend_type='MULTIPLY'; mx.inputs[0].default_value=1.0
        mx.inputs[7].default_value=hex2rgba(tint_base)
        nt.links.new(t.outputs["Color"], mx.inputs[6]); nt.links.new(mx.outputs[2], p.inputs["Base Color"])
        m.diffuse_color=hex2rgba(tint_base)
    else:
        nt.links.new(t.outputs["Color"], p.inputs["Base Color"])
    if unlit:
        nt.links.new(t.outputs["Color"], p.inputs["Emission Color"]); p.inputs["Emission Strength"].default_value=1.0
    return m
def _proj(co, n):
    ax=max(range(3), key=lambda i: abs(n[i]))
    if ax==0: return (co.y*(1 if n.x>0 else -1), co.z)
    if ax==1: return (co.x*(-1 if n.y>0 else 1), co.z)
    return (co.x, co.y*(1 if n.z>0 else -1))
def texture_object(obj, rules, cells, atlas_path, tint_names=(), extra_unlit=()):
    """rules: nome do material atual -> dict(key=célula, mode='tile'|'fit'|'repeat', tile=m, to=nome do material destino, img=para repeat)
    Materiais sem regra ficam como estão (cor lisa)."""
    me=obj.data
    slots=[(s.material.get("_src",s.material.name)) if s.material else "" for s in obj.material_slots]
    targets={}
    def target(name, rule):
        if name in targets: return targets[name]
        if rule.get('mode')=='repeat': m=tex_material(name, rule['img'], unlit=name.endswith('@unlit'), repeat=True)
        else: m=tex_material(name, atlas_path, unlit=name.endswith('@unlit'), tint_base=rule.get('tintcol'))
        targets[name]=m; return m
    bm=bmesh.new(); bm.from_mesh(me)
    uvl=bm.loops.layers.uv.verify()
    bm.faces.ensure_lookup_table()
    # ilhas para modo fit
    fit_faces={}
    for f in bm.faces:
        sn=slots[f.material_index] if f.material_index<len(slots) else ""
        r=rules.get(sn)
        if r and r.get('mode')=='fit': fit_faces.setdefault(sn,[]).append(f)
    islands=[]
    for sn,faces in fit_faces.items():
        left=set(faces)
        while left:
            f0=left.pop(); isl=[f0]; stack=[f0]
            while stack:
                f=stack.pop()
                for e in f.edges:
                    for g in e.link_faces:
                        if g in left: left.remove(g); isl.append(g); stack.append(g)
            islands.append((sn,isl))
    def to_cell(u,v,cell): 
        u0,v0,u1,v1=cell; return (u0+(u1-u0)*u, v0+(v1-v0)*v)
    for sn,isl in islands:
        r=rules[sn]; cell=cells[r['key']]
        acc=[0.0,0.0,0.0]
        for f in isl:
            ar=f.calc_area()
            for i in range(3): acc[i]+=ar*abs(f.normal[i])
        ax=max(range(3),key=lambda i:acc[i])
        cands=[f for f in isl if max(range(3),key=lambda i:abs(f.normal[i]))==ax] or isl
        best=max(cands,key=lambda f:(round(f.calc_area(),4), -f.normal.y, f.normal.z))
        nsum=best.normal.copy()
        pts={}
        for f in isl:
            for l in f.loops: pts[l]=_proj(l.vert.co, nsum)
        us=[p[0] for p in pts.values()]; vs=[p[1] for p in pts.values()]
        du=max(us)-min(us) or 1; dv=max(vs)-min(vs) or 1
        if r.get('keep_aspect',True):
            s=max(du,dv); ou=(s-du)/2; ov=(s-dv)/2; du=dv=s
        else: ou=ov=0
        for l,(u,v) in pts.items():
            l[uvl].uv=to_cell((u-min(us)+ou)/du,(v-min(vs)+ov)/dv,cell)
    for f in bm.faces:
        sn=slots[f.material_index] if f.material_index<len(slots) else ""
        r=rules.get(sn)
        if not r or r.get('mode')=='fit': continue
        tile=r.get('tile',1.0)
        pr=[_proj(l.vert.co,f.normal) for l in f.loops]
        if r.get('mode')=='repeat':
            for l,(u,v) in zip(f.loops,pr): l[uvl].uv=(u/tile,v/tile)
            continue
        cell=cells[r['key']]
        cu=sum(p[0] for p in pr)/len(pr)/tile; cv=sum(p[1] for p in pr)/len(pr)/tile
        uu=[p[0]/tile-math.floor(cu) for p in pr]; vv=[p[1]/tile-math.floor(cv) for p in pr]
        mnu,mxu,mnv,mxv=min(uu),max(uu),min(vv),max(vv)
        sc_=1.0/max(1.0,mxu-mnu,mxv-mnv)
        su=-mnu if (mnu<0 or mxu>1) else 0; sv=-mnv if (mnv<0 or mxv>1) else 0
        for l,u,v in zip(f.loops,uu,vv):
            l[uvl].uv=to_cell(min(1,max(0,(u+su)*sc_)),min(1,max(0,(v+sv)*sc_)),cell)
    bm.to_mesh(me); bm.free()
    # remapeia materiais
    new_names=[]
    for sn in slots:
        r=rules.get(sn); nm=r.get('to',sn) if r else sn
        if nm not in new_names: new_names.append(nm)
    old_idx=[p.material_index for p in me.polygons]
    mats=[]
    for nm in new_names:
        src=[sn for sn in slots if (rules.get(sn,{}).get('to',sn) if rules.get(sn) else sn)==nm]
        r=rules.get(src[0]) if src else None
        mats.append(target(nm,r) if r else (bpy.data.materials.get(nm) if nm else None))
    me.materials.clear()
    for m in mats: me.materials.append(m)
    for p,oi in zip(me.polygons,old_idx):
        sn=slots[oi] if oi<len(slots) else ""; r=rules.get(sn); nm=r.get('to',sn) if r else sn
        p.material_index=new_names.index(nm)
    return [m.name if m else None for m in mats]
STYLE={}  # nome do material -> spec padrão
def auto_rules(objs, overrides=None, atlas_name="atlas", size=1024, keep=(), seed=1):
    """Gera atlas a partir dos materiais usados: @unlit ficam lisos; @tint recebem célula clara; o resto vira 'Atlas'."""
    overrides=overrides or {}
    used=[]
    for o in objs:
        if o.type!='MESH': continue
        for s in o.material_slots:
            if s.material and s.material.name not in used: used.append(s.material.name)
    specs={}; rules={}
    for nm in used:
        spec=dict(STYLE.get(nm,{})); spec.update(overrides.get(nm,{}))
        if nm in keep or (nm.endswith('@unlit') and not spec.get('style')): continue
        m=bpy.data.materials[nm]
        col=m.diffuse_color
        hexc='#%02X%02X%02X'%tuple(int(max(0,min(1,(c/12.92 if False else (1.055*c**(1/2.4)-0.055) if c>0.0031308 else c*12.92)))*255) for c in col[:3])
        spec.setdefault('col',hexc)
        if nm.endswith('@tint'): spec['style']=spec.get('style','light')
        key=nm; specs[key]=spec
        to = nm if (nm.endswith('@tint') or nm.endswith('@unlit')) else spec.get('to','Atlas')
        rules[nm]=dict(key=key, mode=spec.get('mode','tile'), tile=spec.get('tile',1.0), to=to, tintcol=(hexc if nm.endswith('@tint') else None))
    path,cells=make_atlas(atlas_name, specs, size=size, seed=seed)
    return rules,cells,path
def texture_all(objs, overrides=None, atlas_name="atlas", size=1024, keep=(), seed=1):
    rules,cells,path=auto_rules(objs,overrides,atlas_name,size,keep,seed)
    out={}
    for o in objs:
        if o.type=='MESH' and not o.name.startswith('bloqueio_'): out[o.name]=texture_object(o,rules,cells,path)
    return out, path
