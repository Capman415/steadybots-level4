#!/usr/bin/env node
// v14.5.29: Label Room title sign fits, BOXES SHIPPED slots don't overlap the count, stamp arm clear of POINTS, OK! centered and legible
'use strict';
const fs=require('fs'),path=require('path');
const {createCanvas,GlobalFonts}=require(process.env.CV||'/opt/sand/sand-host/node_modules/@napi-rs/canvas');
const ROOT=path.join(__dirname,'..');
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const lbl=read('js/rooms/label.js'),eng=read('js/engine.js');
let fails=0;const ok=(c,m)=>{if(!c){fails++;console.error('FAIL',m)}else console.log('ok',m)};

const ver=JSON.parse(read('version.json'));
ok(ver.version==='v14.5.29'&&ver.build==='1794301529','version.json is v14.5.29 / 1794301529');
ok(/BB\.VERSION='v14.5.29'/.test(eng),'BB.VERSION synced');
ok((read('index.html').match(/1794301529/g)||[]).length>=2,'index.html build synced');
ok(/bb-1794301529/.test(read('sw.js')),'sw cache bumped');
ok(/BB\.VERSION\s*=\s*['\"]v14.5.29['\"]/.test(read('js-legacy/engine.js')),'js-legacy engine version synced');

// ----- LABEL ROOM sign -----
const bake=lbl.slice(lbl.indexOf('bake()'), lbl.indexOf('// beat clock'));
ok(/v14\.5\.29/.test(bake)&&/txtPad=16/.test(bake)&&/minLeft=1190\+280\+16/.test(bake),'sign is fitted with 16px text padding and sits past the POINTS panel');
ok(/maxRight=W-16/.test(bake),'sign stays inside the 16px stage-right margin');
ok(/fillText\(label,0,0\)/.test(bake),'sign lettering is centered in the panel');
ok(!/g\.translate\(W-250,300\)/.test(bake)&&!/roundRect\(-190,-70,380,120/.test(bake),'old fixed 380×120 overflowing sign is gone');

try{GlobalFonts.registerFromPath(path.join(ROOT,'assets/RammettoOne-Regular.ttf'),'Rammetto One')}catch(e){console.warn(e.message)}
const g=createCanvas(200,80).getContext('2d');
const W=1920,H=1080,minLeft=1190+280+16,maxRight=W-16,inset=14,txtPad=16,oh=120,cy=300;
let size=44;g.font=size+'px "Rammetto One"';let tw=g.measureText('LABEL ROOM').width,innerW=Math.ceil(tw+txtPad*2),outerW=innerW+inset*2;
const maxOuter=maxRight-minLeft;while(outerW>maxOuter&&size>28){size--;g.font=size+'px "Rammetto One"';tw=g.measureText('LABEL ROOM').width;innerW=Math.ceil(tw+txtPad*2);outerW=innerW+inset*2}
outerW=Math.min(Math.max(outerW,380),maxOuter);innerW=outerW-inset*2;const cx=(minLeft+maxRight)/2;
ok(tw+txtPad*2<=innerW+1e-6,'LABEL ROOM ink plus padding fits inside the pink inner border');
ok(cx-outerW/2>=minLeft-1e-6&&cx+outerW/2<=maxRight+1e-6,'sign sits between the POINTS panel and the stage edge');
ok(size>=36,'font stays large enough to keep the sign style (not shrunk below 36)');
const sign={x:cx-outerW/2,y:cy-oh/2,w:outerW,h:oh};

// ----- BOXES SHIPPED HUD -----
const hud=lbl.slice(lbl.indexOf('drawHUD(t){'), lbl.indexOf('drawTeacher(){'));
ok(/title \+ count share the top of the well/.test(hud),'HUD comment documents the new two-row layout');
ok(/wellX=hx\+18,wellY=hy\+16,wellW=hw-36,wellH=hh-32,pad=16/.test(hud),'HUD uses the panel well and a 16px inner pad');
ok(/align:'right'/.test(hud)&&/of \$\{BOXES\}`/.test(hud),'count is right-aligned on the title row');
ok(/sw=22,sg=8,tot=n\*sw\+\(n-1\)\*sg,sh=26,sy=wellY\+wellH-12-sh/.test(hud),'12 slots sit on their own row under the title');
ok(!/BB\.rrect\(196\+i\*28,82,22,32/.test(hud)&&!/BB\.text\(`\$\{this\.shipped\} of \$\{BOXES\}`,156,90/.test(hud),'old overlapping slot/count layout is gone');
ok(/PANEL\(124,24,490,114,28\)/.test(hud)||/hx=124,hy=24,hw=490,hh=114/.test(hud),'BOXES SHIPPED panel stays at 124,24 size 490×114 (clear of the hamburger)');

const hx=124,hy=24,hw=490,hh=114,wellX=hx+18,wellY=hy+16,wellW=hw-36,wellH=hh-32,pad=16,titleY=wellY+20;
const n=12,sw=22,sg=8,tot=n*sw+(n-1)*sg,sh=26,sy=wellY+wellH-12-sh,sx=wellX+(wellW-tot)/2;
g.font='26px "Rammetto One"';const titleW=g.measureText('BOXES SHIPPED').width+4;
g.font='24px "Rammetto One"';const countW=g.measureText('12 of 12').width+4;
const titleBox={x:wellX+pad,y:titleY-13,w:titleW,h:26};
const countBox={x:wellX+wellW-pad-countW,y:titleY-13,w:countW,h:26};
const slots={x:sx,y:sy,w:tot,h:sh};
const well={x:wellX,y:wellY,w:wellW,h:wellH};
const inside=(a,b,p=0)=>a.x>=b.x+p&&a.y>=b.y+p&&a.x+a.w<=b.x+b.w-p&&a.y+a.h<=b.y+b.h-p;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
ok(inside(titleBox,well,6)&&inside(countBox,well,6)&&inside(slots,well,6),'title, count and slots all sit inside the well with padding');
ok(!overlap(titleBox,countBox),'title and count do not overlap each other');
ok(!overlap(titleBox,slots)&&!overlap(countBox,slots),'slots do not overlap the title or the count');
ok(titleBox.x+titleBox.w+12<=countBox.x,'title and count have a gap between them');
ok(sy>=titleY+13+8,'slots sit below the title-row ink with a gap');
const ham={x:28,y:26,s:72},hudPanel={x:hx,y:hy,w:hw,h:hh};
ok(ham.x+ham.s+8<=hudPanel.x,'BOXES HUD stays clear of the hamburger');
const points={x:1190,y:24,w:280,h:114};
ok(!overlap(hudPanel,points)&&!overlap(sign,points)&&sign.x>=points.x+points.w+16,'sign and BOXES HUD stay clear of the POINTS panel');

// ----- stamp arm vs POINTS panel -----
ok(/PANEL_BOT=24\+114,GAP=48,TOP=PANEL_BOT\+GAP\+40,PY=454/.test(lbl),'stamp arm origin is below the POINTS panel with a 48px gap; parcel sits at y=454');
ok(!/const X=1300,TOP=110,PAD=398/.test(lbl),'old stamp arm that hung out of the POINTS panel is gone');
const PANEL_BOT=24+114,GAP=48,TOP=PANEL_BOT+GAP+40,mountTop=TOP-40,PW=200,PH=90,PY=454,X=1300;
ok(mountTop>=PANEL_BOT+GAP-1e-6,'stamp mount starts at least 48px below the POINTS panel body');
ok(mountTop>=PANEL_BOT+4+10+22,'stamp mount also clears the panel drop shadow');
ok(PY+PH<=560-8,'stamped parcel sits above the belt');
ok(/BB\.text\('OK!',X,PY\+PH\/2,34,'#fff'/.test(lbl),'OK! is centered on the parcel face at full size 34, white on a solid badge');
ok(/bw=128,bh=56,bx=X-bw\/2,by=PY\+\(PH-bh\)\/2/.test(lbl),'OK! badge is centered on the 200×90 parcel face');
ok(!/ctx\.globalAlpha=c<1\.2\?1-c\/1\.2\*\.6:1/.test(lbl)&&!/PAD\+108,30,'#d24a3c'/.test(lbl),'faded off-center outline OK! is gone');
const badge={x:X-64,y:PY+(PH-56)/2,w:128,h:56},parcel={x:X-PW/2,y:PY,w:PW,h:PH};
ok(Math.abs((badge.x+badge.w/2)-(parcel.x+parcel.w/2))<1e-9&&Math.abs((badge.y+badge.h/2)-(parcel.y+parcel.h/2))<1e-9,'OK! badge center equals the parcel face center');
ok(inside(badge,parcel,0),'OK! badge stays on the parcel face');
const stampX={x:X-120,y:mountTop,w:240,h:50};
ok(!overlap(stampX,{x:points.x,y:points.y,w:points.w,h:points.h}),'stamp mount does not overlap the POINTS panel');
ok(!overlap({x:X-PW/2,y:PY,w:PW,h:PH},sign),'stamped parcel does not overlap the title sign');

// ----- +points popup no longer starts in the stamp mount -----
ok(/BB\.text\('\+'\+this\.gain\.p,1330,110-k\*46/.test(hud),'gain popup floats over the POINTS panel, not through the stamp mount');
ok(!/1326,170-k\*40/.test(hud),'old gain popup y=170 (inside the new mount) is gone');

// ----- other Label Room chrome still in place -----
ok(/PR=\{x:80,y:370,w:216,h:180\}/.test(lbl),'label printer stays on the left belt end');
ok(/BELT_Y=560,BOX_X=880,BOX_W=224,BOX_H=206/.test(lbl),'gameplay box / belt positions unchanged');
ok(/cardRect\(i\)\{[^}]*y:690/.test(lbl),'choice cards stay on the lower row');
ok(/maxR=1600/.test(lbl)&&/x0=Math\.min\(W\/2-tot\/2,maxR-tot\)/.test(lbl),'4-card and 6-beat rows are capped so the last card stays left of Sprocket\'s stack');
const stackLeft=1720-206/2;
for(const [n,L,cw] of [[3,4,400],[4,4,340],[3,6,470]]){
  const gap=30,tot=n*cw+(n-1)*gap,maxR=1600,x0=Math.min(1920/2-tot/2,maxR-tot);
  ok(x0+tot<=1600+1e-9&&x0+tot<=stackLeft-16,n+' cards at '+cw+'px end at '+(x0+tot)+', clear of the parcel stack');
  ok(x0>=40,n+' cards still have a left margin');
}

ok(/BB\.MENU_BTN=\{x:28,y:26,s:72\}/.test(read('js/art.js')),'hamburger stays top-left');

if(fails){console.error(fails+' v14.5.29 test(s) failed');process.exit(1)}
console.log('v14.5.29 tests OK');
