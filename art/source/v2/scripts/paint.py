
import numpy as np
TEX=os.path.join(BASE,"tex")
INK=np.array([0x1E,0x1A,0x24])/255.0
SHADE=np.array([0x5E,0x8C,0x8A])/255.0
def hx(h):
    h=h.lstrip('#'); return np.array([int(h[i:i+2],16)/255 for i in (0,2,4)])
def blur(a,r):
    if r<1: return a
    for _ in range(2):
        acc=np.zeros_like(a)
        for d in range(-r,r+1): acc+=np.roll(a,d,axis=0)
        a=acc/(2*r+1); acc=np.zeros_like(a)
        for d in range(-r,r+1): acc+=np.roll(a,d,axis=1)
        a=acc/(2*r+1)
    return a
def vnoise(h,w,scale,rng):
    lh,lw=max(2,h//scale+1),max(2,w//scale+1)
    low=rng.random((lh,lw))
    up=np.kron(low,np.ones((scale,scale)))[:h,:w]
    up=blur(up,max(1,scale//2))
    up-=up.min(); m=up.max(); return up/(m if m>0 else 1)
def fbm(h,w,rng,scales=(48,16,6),wts=(0.55,0.3,0.15)):
    return sum(wt*vnoise(h,w,s,rng) for s,wt in zip(scales,wts))
def stamp(img,x,y,rad,col,alpha):
    h,w,_=img.shape
    x0,x1=int(max(0,x-rad-1)),int(min(w,x+rad+2)); y0,y1=int(max(0,y-rad-1)),int(min(h,y+rad+2))
    if x0>=x1 or y0>=y1: return
    yy,xx=np.mgrid[y0:y1,x0:x1]; d=np.sqrt((xx-x)**2+(yy-y)**2)
    a=np.clip(rad+0.5-d,0,1)[...,None]*alpha
    img[y0:y1,x0:x1]=img[y0:y1,x0:x1]*(1-a)+col*a
def line(img,pts,col=INK,width=1.4,alpha=0.85):
    for (x0,y0),(x1,y1) in zip(pts[:-1],pts[1:]):
        L=max(1,int(np.hypot(x1-x0,y1-y0)*1.5))
        for t in np.linspace(0,1,L): stamp(img,x0+(x1-x0)*t,y0+(y1-y0)*t,width/2,col,alpha)
def walk(rng,x,y,n,step,ang,jit=0.6):
    pts=[(x,y)]
    for _ in range(n):
        ang+=rng.normal(0,jit); x+=np.cos(ang)*step; y+=np.sin(ang)*step; pts.append((x,y))
    return pts
def base_paint(S,col,rng,var=0.09,shade=0.10):
    f=fbm(S,S,rng)
    img=np.ones((S,S,3))*col
    img=img*(1+(f[...,None]-0.5)*2*var)
    dark=np.clip((0.45-f)*2.2,0,1)[...,None]*shade
    img=img*(1-dark)+SHADE*col*1.4*dark
    # pinceladas curtas
    for _ in range(int(S*S/900)):
        x,y=rng.random(2)*S; a=rng.random()*np.pi; L=rng.uniform(4,12)*S/256
        c=np.clip(col*(1+rng.normal(0,0.07)),0,1)
        line(img,[(x,y),(x+np.cos(a)*L,y+np.sin(a)*L)],c,width=rng.uniform(2,4)*S/256,alpha=0.35)
    return np.clip(img,0,1)
def glyph(img,x,y,s,rng,col,width):
    strokes=rng.integers(2,5)
    for _ in range(strokes):
        k=rng.integers(0,4)
        if k==0: yy=y+rng.uniform(0.1,0.9)*s; line(img,[(x+0.1*s,yy),(x+0.9*s,yy)],col,width,1)
        elif k==1: xx=x+rng.uniform(0.15,0.85)*s; line(img,[(xx,y+0.1*s),(xx,y+0.9*s)],col,width,1)
        elif k==2: line(img,[(x+0.2*s,y+0.2*s),(x+0.8*s,y+0.8*s)],col,width,1)
        else: line(img,[(x+0.2*s,y+0.25*s),(x+0.8*s,y+0.25*s),(x+0.8*s,y+0.75*s),(x+0.2*s,y+0.75*s),(x+0.2*s,y+0.25*s)],col,width,1)
def style(S,spec,rng):
    col=hx(spec.get('col','#cccccc')); st=spec.get('style','flat')
    if st=='flat': img=base_paint(S,col,rng,0.07,0.08)
    elif st=='light':  # base clara p/ @tint: detalhes em cinza
        img=base_paint(S,np.array([0.93,0.93,0.92]),rng,0.05,0.04)
        for _ in range(3):
            y=rng.uniform(0.1,0.9)*S; line(img,[(0,y),(S,y+rng.normal(0,3))],np.array([0.7,0.7,0.72]),1.3,0.5)
        if spec.get('seam',True):
            for yy in (S*0.06,S*0.94):
                pts=[(x,yy) for x in np.arange(4,S,9)]
                for i in range(0,len(pts)-1,2): line(img,[pts[i],pts[i+1]],np.array([0.62,0.62,0.66]),1.2,0.7)
    elif st=='lightwall':
        img=base_paint(S,np.array([0.93,0.92,0.9]),rng,0.05,0.05)
        for _ in range(int(S/10)):
            x=rng.random()*S; y=rng.random()*S*0.3; L=rng.uniform(0.2,0.8)*S
            line(img,[(x,y),(x+rng.normal(0,2),y+L)],np.array([0.78,0.78,0.76]),rng.uniform(1.5,4),0.35)
        for _ in range(2): line(img,walk(rng,rng.random()*S,rng.random()*S,6,S/25,rng.random()*6.28),np.array([0.45,0.45,0.48]),1.1,0.6)
        for r in (0.33,0.66): line(img,[(0,r*S),(S,r*S)],np.array([0.8,0.8,0.8]),1.0,0.4)
    elif st=='stripes':
        img=base_paint(S,col,rng,0.05,0.05); c2=hx(spec.get('col2','#F2EEE2')); n=spec.get('n',6)
        for i in range(n):
            if i%2: img[:, int(i*S/n):int((i+1)*S/n)]=img[:, int(i*S/n):int((i+1)*S/n)]*0.2+c2*0.8
    elif st=='glass':
        img=np.ones((S,S,3))*col
        for k in range(3):
            x=rng.uniform(0.1,0.8)*S; line(img,[(x,S*0.9),(x+S*0.25,S*0.1)],np.clip(col*1.8,0,1),S/28,0.35)
    elif st=='stone':
        img=base_paint(S,col,rng,0.12,0.14)
        for _ in range(int(3+S/64)): line(img,walk(rng,rng.random()*S,rng.random()*S,rng.integers(4,9),S/22,rng.random()*6.28),INK,1.3,0.75)
        for _ in range(int(S*S/500)): stamp(img,rng.random()*S,rng.random()*S,rng.uniform(0.6,1.4),col*0.75,0.6)
        if spec.get('moss'):
            m=vnoise(S,S,S//4,rng); mask=np.clip((m-0.62)*4,0,1)[...,None]*(np.linspace(1,0,S)[:,None,None]**0.3 if False else 1)
            img=img*(1-mask)+hx('#6F9A55')*mask
    elif st=='blocks':
        img=base_paint(S,col,rng,0.1,0.12); n=spec.get('rows',4)
        for r in range(n+1):
            y=r*S/n; line(img,[(0,y),(S,y+rng.normal(0,1))],INK,1.6,0.8)
            off=(S/3)*(r%2)
            for c in range(4):
                x=(c*S/2+off)%S; line(img,[(x,y),(x+rng.normal(0,1),y+S/n)],INK,1.6,0.8)
        for _ in range(4): line(img,walk(rng,rng.random()*S,rng.random()*S,5,S/30,rng.random()*6.28),INK,1.1,0.6)
    elif st=='wood':
        img=base_paint(S,col,rng,0.06,0.06)
        for _ in range(int(S/10)):
            y=rng.random()*S; pts=[(x,y+3*np.sin(x/S*6.28*rng.uniform(0.5,2)+rng.random()*6)) for x in np.linspace(0,S,24)]
            line(img,pts,col*0.72,rng.uniform(0.8,1.8),0.55)
        for _ in range(2):
            x,y=rng.random(2)*S; 
            for k in range(3): line(img,[(x+np.cos(t)*(3+k*3),y+np.sin(t)*(2+k*2)) for t in np.linspace(0,6.3,14)],col*0.65,1,0.6)
    elif st=='planks':
        img=style(S,dict(spec,style='wood'),rng); n=spec.get('rows',5)
        for r in range(n+1): y=r*S/n; line(img,[(0,y),(S,y)],INK,1.6,0.8)
    elif st=='roof':
        img=base_paint(S,col,rng,0.08,0.1); n=spec.get('rows',8)
        for r in range(n):
            y=(r+0.5)*S/n
            line(img,[(0,y),(S,y)],INK,1.8,0.7)
            for c in range(9):
                x=(c+0.5*(r%2))*S/8; line(img,[(x,y),(x,y-S/n*0.8)],col*0.6,1.2,0.6)
        for _ in range(int(S/32)): stamp(img,rng.random()*S,rng.random()*S,rng.uniform(2,5),col*1.25,0.3)
    elif st=='concrete':
        img=base_paint(S,col,rng,0.1,0.12)
        for _ in range(int(S/14)):   # escorridos
            x=rng.random()*S; y=rng.random()*S*0.4; L=rng.uniform(0.2,0.7)*S
            line(img,[(x,y),(x+rng.normal(0,2),y+L)],col*0.8,rng.uniform(1.5,4),0.35)
        for _ in range(3): line(img,walk(rng,rng.random()*S,rng.random()*S,6,S/25,rng.random()*6.28),INK,1.1,0.7)
        for _ in range(int(S*S/700)): stamp(img,rng.random()*S,rng.random()*S,0.8,col*0.7,0.5)
    elif st=='asphalt':
        img=base_paint(S,col,rng,0.08,0.06)
        for _ in range(int(S*S/120)): stamp(img,rng.random()*S,rng.random()*S,rng.uniform(0.5,1.1),col*rng.uniform(0.7,1.3),0.7)
        for _ in range(4): line(img,walk(rng,rng.random()*S,rng.random()*S,8,S/25,rng.random()*6.28),INK,1.2,0.6)
    elif st=='grass':
        img=base_paint(S,col,rng,0.1,0.12)
        g2=hx(spec.get('col2','#4E8F55')); m=vnoise(S,S,S//6,rng); mm=np.clip((m-0.5)*3,0,1)[...,None]
        img=img*(1-mm)+g2*mm
        d=vnoise(S,S,S//8,rng); dm=np.clip((d-0.72)*6,0,1)[...,None]
        img=img*(1-dm)+hx('#C9B98A')*dm
        for _ in range(int(S*S/160)):
            x,y=rng.random(2)*S; c=(col if rng.random()<0.5 else g2)*rng.uniform(0.8,1.15)
            line(img,[(x,y),(x+rng.normal(0,1.5),y-rng.uniform(3,7)*S/256)],np.clip(c,0,1),1.2,0.6)
    elif st=='dirt':
        img=base_paint(S,col,rng,0.12,0.1)
        for _ in range(int(S*S/300)): stamp(img,rng.random()*S,rng.random()*S,rng.uniform(0.8,2),col*rng.uniform(0.75,1.2),0.7)
    elif st=='water':
        img=base_paint(S,col,rng,0.06,0.05)
        for _ in range(int(S/12)):
            x,y=rng.random(2)*S; L=rng.uniform(8,22)*S/256; line(img,[(x,y),(x+L,y+rng.normal(0,1))],np.clip(col*1.35,0,1),1.6,0.55)
    elif st=='leaf':
        img=base_paint(S,col,rng,0.12,0.14)
        for _ in range(int(S*S/220)):
            x,y=rng.random(2)*S; a=rng.random()*6.28; c=np.clip(col*rng.uniform(0.75,1.3),0,1)
            line(img,[(x,y),(x+np.cos(a)*5*S/256,y+np.sin(a)*5*S/256)],c,2.4*S/256,0.7)
    elif st=='cloth':
        img=base_paint(S,col,rng,0.06,0.08)
        for yy in (S*0.07,S*0.93):
            pts=[(x,yy) for x in np.arange(3,S,8)]
            for i in range(0,len(pts)-1,2): line(img,[pts[i],pts[i+1]],col*0.55,1.2,0.8)
    elif st=='skin':
        img=base_paint(S,col,rng,0.03,0.03)
    elif st=='hair':
        img=base_paint(S,col,rng,0.06,0.08)
        for _ in range(int(S/4)):
            x=rng.random()*S; pts=[(x+np.sin(t*3)*3,t*S) for t in np.linspace(0,1,10)]
            line(img,pts,np.clip(col*rng.uniform(0.7,1.45),0,1),1.0,0.5)
    elif st=='paper':
        img=base_paint(S,col,rng,0.04,0.03)
        for _ in range(int(S/3)):
            x,y=rng.random(2)*S; a=rng.random()*6.28; line(img,[(x,y),(x+np.cos(a)*6,y+np.sin(a)*6)],col*0.9,0.8,0.4)
    elif st=='metal':
        img=base_paint(S,col,rng,0.05,0.08)
        for _ in range(3): y=rng.random()*S; line(img,[(0,y),(S,y)],col*1.2,2,0.3)
        for _ in range(int(S/40)): stamp(img,rng.random()*S,rng.random()*S,rng.uniform(2,5),hx('#8A5A3B'),0.25)
    elif st=='sign':   # placa/letreiro com glifos
        bg=col; fg=hx(spec.get('fg','#F2EEE2'))
        img=base_paint(S,bg,rng,0.06,0.05)
        n=spec.get('n',3); pad=S*0.08; s=(S-2*pad)/n
        vertical=spec.get('vertical',False)
        for i in range(n):
            if vertical: glyph(img,S/2-s*0.45,pad+i*s,s*0.9,rng,fg,max(2,S/40))
            else: glyph(img,pad+i*s,S/2-s*0.45,s*0.9,rng,fg,max(2,S/40))
        if spec.get('border',True):
            b=S*0.03; line(img,[(b,b),(S-b,b),(S-b,S-b),(b,S-b),(b,b)],fg*0.9 if spec.get('fgborder') else INK,max(2,S/64),0.9)
    elif st=='screen':   # tela com layout de glifos (usar em @unlit)
        bg=col; fg=hx(spec.get('fg','#FFFFFF'))
        img=np.ones((S,S,3))*bg
        for _ in range(7):
            x,y=rng.random(2)*S*0.7; w_,h_=rng.uniform(0.15,0.4)*S,rng.uniform(0.05,0.18)*S
            img[int(y):int(y+h_),int(x):int(x+w_)]=np.clip(bg*0.7+fg*0.3,0,1)
        for i in range(4): glyph(img,S*0.08+i*S*0.2,S*0.05,S*0.16,rng,fg,max(2,S/60))
        line(img,[(S*0.05,S*0.28),(S*0.95,S*0.28)],fg,2,0.8)
    elif st=='chart':  # gráfico subindo
        img=base_paint(S,col,rng,0.04,0.03); fg=hx(spec.get('fg','#1E1A24'))
        pts=[(S*0.1+i*S*0.16,S*0.85-i*S*0.13-rng.uniform(0,S*0.06)) for i in range(6)]
        line(img,[(S*0.08,S*0.1),(S*0.08,S*0.9),(S*0.92,S*0.9)],INK,2.5,1)
        line(img,pts,fg,S/40,1)
    elif st=='poster':
        img=base_paint(S,col,rng,0.05,0.04)
        for _ in range(5):
            c=hx(rng.choice(['#FF5A02','#E0A92E','#5CE1E6','#8E2F3C','#F4A6C0','#4E8F55']))
            x,y=rng.random(2)*S; stamp(img,x,y,rng.uniform(S*0.08,S*0.2),c,0.9)
        glyph(img,S*0.1,S*0.1,S*0.3,rng,INK,S/40)
    elif st=='face':  # não usado (olhos são geometria)
        img=base_paint(S,col,rng,0.03,0.03)
    else: img=base_paint(S,col,rng)
    if spec.get('edge'):
        b=1.5; line(img,[(b,b),(S-b,b),(S-b,S-b),(b,S-b),(b,b)],INK,2.2,0.75)
    return np.clip(img,0,1)
def save_img(name,img,quality=88):
    H,W,_=img.shape
    rgba=np.ones((H,W,4)); rgba[...,:3]=img[::-1]
    im=bpy.data.images.get(name)
    if im: bpy.data.images.remove(im)
    im=bpy.data.images.new(name,W,H,alpha=False)
    im.pixels.foreach_set(rgba.astype(np.float32).ravel())
    path=os.path.join(TEX,name+".jpg")
    for other in list(bpy.data.images):
        if other!=im and other.filepath and os.path.normcase(bpy.path.abspath(other.filepath))==os.path.normcase(path): bpy.data.images.remove(other)
    im.filepath_raw=path; im.file_format='JPEG'
    sc=bpy.context.scene; q=sc.render.image_settings.quality; sc.render.image_settings.quality=quality
    im.save_render(path,scene=sc) if False else im.save()
    sc.render.image_settings.quality=q
    bpy.data.images.remove(im)
    return path
def make_atlas(name, specs, size=1024, seed=1, quality=88):
    """specs: dict key->spec. Retorna (path, cells key->(u0,v0,u1,v1))."""
    keys=list(specs.keys()); G=int(np.ceil(np.sqrt(len(keys)))); C=size//G
    rng=np.random.default_rng(seed); atlas=np.zeros((size,size,3)); cells={}
    for i,k in enumerate(keys):
        r,c=divmod(i,G); img=style(C,specs[k],np.random.default_rng(seed*100+i))
        atlas[r*C:(r+1)*C, c*C:(c+1)*C]=img
        m=3.0/size
        u0=c*C/size+m; u1=(c+1)*C/size-m; v1=1-r*C/size-m; v0=1-(r+1)*C/size+m
        cells[k]=(u0,v0,u1,v1)
    return save_img(name,atlas,quality), cells
def make_tile(name, spec, size=1024, seed=3):
    return save_img(name, style(size,spec,np.random.default_rng(seed)))
