
def mesh_obj(name, verts, faces, mats, fmat=None):
    me=bpy.data.meshes.new(name); me.from_pydata(verts,[],faces); me.update()
    o=bpy.data.objects.new(name,me); bpy.context.scene.collection.objects.link(o)
    for m in mats: me.materials.append(m)
    if fmat:
        for p,i in zip(me.polygons,fmat): p.material_index=i
    bm=bmesh.new(); bm.from_mesh(me); bmesh.ops.recalc_face_normals(bm,faces=bm.faces); bm.to_mesh(me); bm.free()
    for p in me.polygons: p.use_smooth=False
    return o

def roof(name, w, d, z0, h, tw, td, curl, m_roof, m_trim, m_line, m_under, rim=0.12, center=(0,0), seg=4):
    """telhado de 4 águas: beiral curvo (cantos levantados, meio dos lados baixo)."""
    cx,cy=center
    def loop(sw,sd,z,c):
        corners=[(sw,sd),(-sw,sd),(-sw,-sd),(sw,-sd)]; pts=[]
        for k in range(4):
            (x0,y0),(x1,y1)=corners[k],corners[(k+1)%4]
            for i in range(seg):
                t=i/seg; x=x0+(x1-x0)*t; y=y0+(y1-y0)*t; u=abs(2*t-1)
                pts.append((x+cx,y+cy,z+c*u**2.2))
        return pts
    K=4*seg; L=[]
    L.append(loop(w,d,z0-rim,curl)); L.append(loop(w,d,z0,curl))
    def lerp(t): return loop(w+(tw-w)*t, d+(td-d)*t, z0+h*t*(0.85+0.15*t), curl*(1-t)**1.5)
    L.append(lerp(0.30)); L.append(lerp(0.36)); L.append(lerp(0.7)); L.append(loop(tw,td,z0+h,0))
    V=[p for l in L for p in l]; F=[]; FM=[]
    def band(a,b,mi):
        for i in range(K):
            j=(i+1)%K; F.append((a*K+i,a*K+j,b*K+j,b*K+i)); FM.append(mi)
    band(0,1,1); band(1,2,0); band(2,3,2); band(3,4,0); band(4,5,0)
    F.append(tuple(5*K+i for i in range(K))); FM.append(0)
    F.append(tuple(reversed(range(K)))); FM.append(3)
    return mesh_obj(name,V,F,[m_roof,m_trim,m_line,m_under],FM)

def beam(name, L, hh, dd, z, y, curl, m, segs=6):
    """viga horizontal (eixo X) com pontas curvadas p/ cima"""
    V=[];F=[]
    for i in range(segs+1):
        x=-L/2+L*i/segs; c=curl*(abs(x)/(L/2))**3
        for (yy,zz) in ((-dd,-hh),(dd,-hh),(dd,hh),(-dd,hh)):
            V.append((x,y+yy,z+zz+c))
    for i in range(segs):
        for k in range(4):
            a=i*4+k; b=i*4+(k+1)%4
            F.append((a,b,b+4,a+4))
    F.append((3,2,1,0)); n=segs*4; F.append((n,n+1,n+2,n+3))
    return mesh_obj(name,V,F,[m])

def bar(name,a,b,r,m,verts=4):
    a=Vector(a); b=Vector(b); d=b-a
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=d.length,location=(a+b)/2)
    o=bpy.context.active_object; o.name=name; setmat(o,m)
    o.rotation_mode='QUATERNION'; o.rotation_quaternion=Vector((0,0,1)).rotation_difference(d.normalized())
    for p in o.data.polygons: p.use_smooth=False
    return o
def roof_ridges(w,d,z0,h,tw,td,curl,m,center=(0,0),r=0.05):
    cx,cy=center; out=[]
    for sx in (-1,1):
        for sy in (-1,1):
            a=(sx*w+cx,sy*d+cy,z0+curl+0.02); b=(sx*tw+cx,sy*td+cy,z0+h+0.02)
            mid=(sx*(w+tw)/2+cx, sy*(d+td)/2+cy, z0+h*0.5+curl*0.15+0.03)
            out.append(bar('cumeeira',a,mid,r,m)); out.append(bar('cumeeira',mid,b,r,m))
    return out
