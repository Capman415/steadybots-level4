#!/usr/bin/env node
// v14.5.29 offline Label Room previews (before + after). Not a live GUI / mic recording.
'use strict';
const fs=require('fs'),path=require('path');
const {createCanvas,loadImage,GlobalFonts}=require(process.env.CV||'/opt/sand/sand-host/node_modules/@napi-rs/canvas');
const ROOT=path.join(__dirname,'..');
const OUT=process.argv[2]||'/workspace/previews/v14.5.29';
fs.mkdirSync(path.join(OUT,'before'),{recursive:true});
fs.mkdirSync(path.join(OUT,'after'),{recursive:true});
fs.mkdirSync(path.join(OUT,'final'),{recursive:true});
const W=1920,H=1080;
const COL={ink:'#19191f',cream:'#e8e2cd',teal:'#142826',teal2:'#50aaa0',green:'#3fb45a',yellow:'#ffe066',red:'#e65046',white:'#fff'};
try{GlobalFonts.registerFromPath(path.join(ROOT,'assets/RammettoOne-Regular.ttf'),'Rammetto One')}catch(e){console.warn(e.message)}
try{GlobalFonts.registerFromPath(path.join(ROOT,'assets/LilitaOne-Regular.ttf'),'Lilita One')}catch(e){console.warn(e.message)}

function text(ctx,t,x,y,sz,col,o={}){
  ctx.save();ctx.font=`${sz}px '${o.font||'Lilita One'}'`;ctx.textAlign=o.align||'center';ctx.textBaseline='middle';
  if(o.maxW){const m=ctx.measureText(t).width;if(m>o.maxW){sz=sz*o.maxW/m;ctx.font=`${sz}px '${o.font||'Lilita One'}'`}}
  if(o.stroke){ctx.lineJoin='round';ctx.lineWidth=o.stroke;ctx.strokeStyle=o.strokeCol||'#000';ctx.strokeText(t,x,y)}
  ctx.fillStyle=col;ctx.fillText(t,x,y);ctx.restore();
}
function rrect(ctx,x,y,w,h,r,fill,stroke,lw){
  ctx.beginPath();ctx.roundRect(x,y,w,h,Math.min(r,h/2,w/2));if(fill){ctx.fillStyle=fill;ctx.fill()}if(stroke){ctx.strokeStyle=stroke;ctx.lineWidth=lw||3;ctx.stroke()}}
function lg(ctx,y0,y1,stops){const g=ctx.createLinearGradient(0,y0,0,y1);stops.forEach((c,i)=>g.addColorStop(i/(stops.length-1),c));return g}
function save(c,rel){const p=path.join(OUT,rel);fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,c.toBuffer('image/png'));console.log('wrote',rel,c.width+'x'+c.height);return p}
function panel(ctx,x,y,w,h,rad){
  ctx.save();ctx.shadowColor='rgba(0,0,0,.45)';ctx.shadowBlur=22;ctx.shadowOffsetY=10;
  rrect(ctx,x-4,y-4,w+8,h+8,rad+4,lg(ctx,y-4,y+h+4,['#f4f7f6','#9aa6a4','#e2e8e6','#6c7775']));
  ctx.restore();
  rrect(ctx,x-4,y-4,w+8,h+8,rad+4,null,'rgba(20,30,30,.75)',2.5);
  rrect(ctx,x,y,w,h,rad,lg(ctx,y,y+h,['#fdf8ea','#e9e2cc','#c9bfa3']));
  rrect(ctx,x+18,y+16,w-36,h-32,rad-8,lg(ctx,y+16,y+h-16,['#0e1f1d','#173230','#11302c']),'#50aaa0',5);
}
function hamburger(ctx){
  const x=28,y=26,s=72;
  rrect(ctx,x,y,s,s,16,lg(ctx,y,y+s,['#fbf6e6','#e8e2cd']),'#1a1a1a',3);
  ctx.strokeStyle='#19191f';ctx.lineWidth=5;ctx.lineCap='round';
  for(const yy of [y+22,y+36,y+50]){ctx.beginPath();ctx.moveTo(x+18,yy);ctx.lineTo(x+s-18,yy);ctx.stroke()}
}
function plaque(ctx,cx,cy,w,h,txt,size,col='#28403c'){
  const x=cx-w/2,y=cy-h/2;
  rrect(ctx,x,y,w,h,12,lg(ctx,y,y+h,['#fdf8ea','#e9e2cc','#c9bfa3']),'rgba(20,30,30,.75)',2);
  text(ctx,txt,cx,cy+1,size,col,{maxW:w-30});
}

function drawSign(ctx,mode){
  if(mode==='before'){
    ctx.save();ctx.translate(W-250,300);
    ctx.fillStyle='#1e2b29';ctx.beginPath();ctx.roundRect(-190,-70,380,120,22);ctx.fill();
    ctx.strokeStyle='#ff8adf';ctx.lineWidth=6;ctx.shadowColor='#ff8adf';ctx.shadowBlur=24;
    ctx.beginPath();ctx.roundRect(-176,-56,352,92,16);ctx.stroke();ctx.shadowBlur=0;
    ctx.fillStyle='#ffd6f4';ctx.font='44px "Rammetto One"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('LABEL ROOM',0,-10);
    ctx.restore();return;
  }
  const label='LABEL ROOM',minLeft=1190+280+16,maxRight=W-16,inset=14,txtPad=16,oh=120,cy=300;
  let size=44;ctx.font=size+'px "Rammetto One"';let tw=ctx.measureText(label).width,innerW=Math.ceil(tw+txtPad*2),outerW=innerW+inset*2;
  const maxOuter=maxRight-minLeft;while(outerW>maxOuter&&size>28){size--;ctx.font=size+'px "Rammetto One"';tw=ctx.measureText(label).width;innerW=Math.ceil(tw+txtPad*2);outerW=innerW+inset*2}
  outerW=Math.min(Math.max(outerW,380),maxOuter);innerW=outerW-inset*2;const cx=(minLeft+maxRight)/2;
  ctx.save();ctx.translate(cx,cy);
  ctx.fillStyle='#1e2b29';ctx.beginPath();ctx.roundRect(-outerW/2,-oh/2,outerW,oh,22);ctx.fill();
  ctx.strokeStyle='#ff8adf';ctx.lineWidth=6;ctx.shadowColor='#ff8adf';ctx.shadowBlur=24;
  ctx.beginPath();ctx.roundRect(-innerW/2,-oh/2+inset,innerW,oh-inset*2,16);ctx.stroke();ctx.shadowBlur=0;
  ctx.fillStyle='#ffd6f4';ctx.font=size+'px "Rammetto One"';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,0,0);
  ctx.restore();
}

function drawStampArm(ctx,mode,t){
  const c=t%4,p=c<3.4?0:c<3.6?(c-3.4)/.2:c<3.75?1:1-(c-3.75)/.25,e=p*p*(3-2*p);
  if(mode==='before'){
    const X=1300,TOP=110,PAD=398,ext=30+e*178;
    ctx.save();
    rrect(ctx,X-120,TOP-40,240,50,10,lg(ctx,TOP-40,TOP+10,['#6e7a86','#2e363e']),'#22282e',4);
    ctx.fillStyle='#f2c230';for(let i=0;i<6;i++)ctx.fillRect(X-110+i*38,TOP-30,18,30);
    rrect(ctx,X-34,TOP,68,90,12,lg(ctx,TOP,TOP+90,['#a4b2bc','#4e5a64']),'#22282e',4);
    ctx.fillStyle='#ff5a4a';ctx.beginPath();ctx.arc(X,TOP+45,10,0,7);ctx.fill();
    const y0=TOP+90;const pg=ctx.createLinearGradient(X-16,0,X+16,0);pg.addColorStop(0,'#7d8a92');pg.addColorStop(.35,'#f2f6f8');pg.addColorStop(1,'#5d6a72');
    rrect(ctx,X-16,y0,32,ext,6,pg,'#22282e',3);ctx.fillStyle='rgba(0,0,0,.18)';for(let y=y0+14;y<y0+ext-8;y+=22)ctx.fillRect(X-16,y,32,4);
    const hy=y0+ext;rrect(ctx,X-50,hy,100,46,10,lg(ctx,hy,hy+46,['#a8704a','#5e3620']),'#22282e',4);
    rrect(ctx,X-70,hy+46,140,26,6,lg(ctx,hy+46,hy+72,['#e8685a','#9c2e24']),'#22282e',4);
    const py=PAD+66;rrect(ctx,X-100,py,200,90,8,lg(ctx,py,py+90,['#d8a466','#9a6430']),'#4a2e12',4);
    ctx.fillStyle='rgba(240,220,170,.8)';ctx.fillRect(X-14,py,28,90);
    if(e>.5||c<1.2){ctx.globalAlpha=c<1.2?1-c/1.2*.6:1;ctx.strokeStyle='#d24a3c';ctx.lineWidth=5;ctx.strokeRect(X-60,PAD+84,120,46);text(ctx,'OK!',X,PAD+108,30,'#d24a3c')}
    ctx.restore();return;
  }
  const X=1300,PANEL_BOT=24+114,GAP=48,TOP=PANEL_BOT+GAP+40,PY=454,PW=200,PH=90;
  const y0=TOP+90,headH=46,extMax=PY-(y0+headH),ext=30+e*Math.max(0,extMax-30);
  ctx.save();
  rrect(ctx,X-120,TOP-40,240,50,10,lg(ctx,TOP-40,TOP+10,['#6e7a86','#2e363e']),'#22282e',4);
  ctx.fillStyle='#f2c230';for(let i=0;i<6;i++)ctx.fillRect(X-110+i*38,TOP-30,18,30);
  rrect(ctx,X-34,TOP,68,90,12,lg(ctx,TOP,TOP+90,['#a4b2bc','#4e5a64']),'#22282e',4);
  ctx.fillStyle='#ff5a4a';ctx.beginPath();ctx.arc(X,TOP+45,10,0,7);ctx.fill();
  const pg=ctx.createLinearGradient(X-16,0,X+16,0);pg.addColorStop(0,'#7d8a92');pg.addColorStop(.35,'#f2f6f8');pg.addColorStop(1,'#5d6a72');
  rrect(ctx,X-16,y0,32,ext,6,pg,'#22282e',3);ctx.fillStyle='rgba(0,0,0,.18)';for(let y=y0+14;y<y0+ext-8;y+=22)ctx.fillRect(X-16,y,32,4);
  const hy=y0+ext;rrect(ctx,X-50,hy,100,46,10,lg(ctx,hy,hy+46,['#a8704a','#5e3620']),'#22282e',4);
  rrect(ctx,X-70,hy+46,140,26,6,lg(ctx,hy+46,hy+72,['#e8685a','#9c2e24']),'#22282e',4);
  rrect(ctx,X-PW/2,PY,PW,PH,8,lg(ctx,PY,PY+PH,['#d8a466','#9a6430']),'#4a2e12',4);
  ctx.fillStyle='rgba(240,220,170,.8)';ctx.fillRect(X-14,PY,28,PH);
  const bw=128,bh=56,bx=X-bw/2,by=PY+(PH-bh)/2;
  rrect(ctx,bx,by,bw,bh,10,'#e24a3c','#6e1510',5);
  text(ctx,'OK!',X,PY+PH/2,34,'#fff',{font:'Rammetto One',stroke:6,strokeCol:'#5a1010'});
  ctx.restore();
}

function drawHUD(ctx,mode,o){
  const shipped=o.shipped||0,score=o.score||0,streak=o.streak||0;
  if(mode==='before'){
    panel(ctx,124,24,490,114,28);
    text(ctx,'BOXES SHIPPED',156,58,26,COL.yellow,{align:'left',stroke:4,maxW:400});
    text(ctx,shipped+' of 12',156,90,24,'#fff',{align:'left',font:'Rammetto One',stroke:4,maxW:400});
    for(let i=0;i<12;i++)rrect(ctx,196+i*28,82,22,32,6,i<shipped?lg(ctx,82,114,['#a6f5ae','#3fb45a']):'#2d4744','#fff',3);
  }else{
    const hx=124,hy=24,hw=490,hh=114;panel(ctx,hx,hy,hw,hh,28);
    const wellX=hx+18,wellY=hy+16,wellW=hw-36,wellH=hh-32,pad=16,titleY=wellY+20;
    text(ctx,'BOXES SHIPPED',wellX+pad,titleY,26,COL.yellow,{align:'left',stroke:4,maxW:280});
    text(ctx,shipped+' of 12',wellX+wellW-pad,titleY,24,'#fff',{align:'right',font:'Rammetto One',stroke:4,maxW:140});
    const n=12,sw=22,sg=8,tot=n*sw+(n-1)*sg,sh=26,sy=wellY+wellH-12-sh,sx=wellX+(wellW-tot)/2;
    for(let i=0;i<n;i++)rrect(ctx,sx+i*(sw+sg),sy,sw,sh,6,i<shipped?lg(ctx,sy,sy+sh,['#a6f5ae','#3fb45a']):'#2d4744','#fff',3);
  }
  panel(ctx,1190,24,280,114,28);
  text(ctx,'POINTS '+score,1330,58,28,'#fff',{stroke:4,maxW:220});
  text(ctx,'STREAK '+streak+(streak>=3?' \u2605':''),1330,90,24,COL.yellow,{stroke:4,maxW:220});
}

function drawBelt(ctx,t){
  const BELT_Y=560,x0=40,x1=1480,y=BELT_Y;
  // baked frame
  const fr=ctx.createLinearGradient(0,y+24,0,y+80);fr.addColorStop(0,'#c9d2d3');fr.addColorStop(.5,'#8a9798');fr.addColorStop(1,'#56625f');
  ctx.fillStyle=fr;ctx.fillRect(40,y+24,1440,56);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(40,y+80,1440,8);
  for(const x of [120,760,1400]){const lgx=ctx.createLinearGradient(x,0,x+44,0);lgx.addColorStop(0,'#5d696b');lgx.addColorStop(.5,'#aab4b5');lgx.addColorStop(1,'#4d585a');ctx.fillStyle=lgx;ctx.fillRect(x,y+88,44,60)}
  rrect(ctx,x0,y,x1-x0,26,8,lg(ctx,y,y+26,['#3a4644','#222b2a']),'#121918',2);
  ctx.save();ctx.beginPath();ctx.rect(x0,y,x1-x0,26);ctx.clip();
  const off=((t*60)%60+60)%60;ctx.fillStyle='rgba(160,210,200,.22)';for(let x=x0-60+off;x<x1;x+=60)ctx.fillRect(x,y+3,6,20);ctx.restore();
  const bv=t,bi=((Math.floor(bv)%4)+4)%4,ph=bv-Math.floor(bv),fl=Math.max(0,1-ph*2.2);
  for(let i=0;i<16;i++){const lx=x0+50+i*((x1-x0-100)/15),ly=y+52,on=i%4===bi;
    ctx.fillStyle='#1b2322';ctx.beginPath();ctx.arc(lx,ly,13,0,7);ctx.fill();
    ctx.fillStyle=on&&fl>0?`rgba(255,${210+40*fl|0},90,${.35+.65*fl})`:'#4a5250';ctx.beginPath();ctx.arc(lx,ly,9,0,7);ctx.fill()}
}
function drawPrinter(ctx){
  const x=80,y=370,w=216,h=180;
  rrect(ctx,x+6,y+10,w,h,16,'rgba(0,0,0,.3)');
  rrect(ctx,x,y,w,h,16,lg(ctx,y,y+h,['#d9e4e2','#a7b6b4','#6f7f7d']),'#2b3534',4);
  rrect(ctx,x+20,y+24,w-40,70,10,'#132322','#50aaa0',3);
  text(ctx,'READY',x+w/2,y+60,30,'#6ee678',{font:'Rammetto One'});
  rrect(ctx,x+30,y+h-60,w-60,22,8,'#1b2322');ctx.fillStyle='#fbf6e6';ctx.fillRect(x+40,y+h-52,w-80,6);
  plaque(ctx,x+w/2,y-26,220,44,'LABEL PRINTER',20,'#28403c');
}
function drawBox(ctx,x,y,w,h,labeled){
  rrect(ctx,x+6,y+10,w,h,12,'rgba(0,0,0,.3)');
  rrect(ctx,x,y,w,h,12,lg(ctx,y,y+h,['#e2a868','#c08446','#93582a']),'#4a2e12',4);
  ctx.fillStyle='rgba(255,240,210,.3)';ctx.fillRect(x+6,y+6,w-12,6);
  ctx.fillStyle='rgba(240,220,170,.85)';ctx.fillRect(x+w/2-16,y,32,h*.38);
  ctx.fillStyle='rgba(60,30,10,.18)';ctx.fillRect(x+w*.78,y+8,w*.18,h-16);
  const lx=x+w*.12,ly=y+h*.42,lw=w*.76,lh=h*.48;
  if(labeled){
    rrect(ctx,lx,ly,lw,lh,10,lg(ctx,ly,ly+lh,['#fffaf0','#f1e8d2']),'rgba(110,95,70,.7)',2);
    text(ctx,'ta  ti-ti  ta  ta',lx+lw/2,ly+lh/2,18,'#19191f',{maxW:lw-12});
  }else{
    ctx.setLineDash([10,8]);rrect(ctx,lx,ly,lw,lh,10,'rgba(60,30,10,.18)','rgba(255,240,210,.7)',3);ctx.setLineDash([]);
    text(ctx,'?',lx+lw/2,ly+lh/2,lh*.6,'rgba(255,240,210,.85)',{font:'Rammetto One'});
  }
}
function drawCard(ctx,x,y,w,h,badge){
  rrect(ctx,x+5,y+8,w,h,12,'rgba(0,0,0,.35)');
  rrect(ctx,x,y,w,h,12,lg(ctx,y,y+h,['#fffaf0','#f1e8d2','#ddd0b2']),null);
  rrect(ctx,x,y,w,h,12,null,'rgba(110,95,70,.7)',2);
  const hh=Math.min(40,h*.2);
  ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,hh+4,[12,12,0,0]);ctx.clip();ctx.fillStyle='#d24a3c';ctx.fillRect(x,y,w,hh+4);ctx.restore();
  text(ctx,'SHIP TO: DELIVERY',x+58,y+hh/2+2,Math.min(22,hh*.6),'#fff',{align:'left',maxW:w-80});
  rrect(ctx,x+10,y+6,40,hh-4,8,'#fbf6e6','#19191f',2);text(ctx,badge,x+30,y+hh/2+2,24,'#19191f');
  text(ctx,'ta   ti-ti   ta   ta',x+w/2,y+hh+(h-hh)/2,28,'#19191f',{maxW:w-24});
}
function drawSprocket(ctx,sp){
  const x=1720,base=712;
  for(const [y,h,w] of[[712,100,190],[812,96,206]]){
    rrect(ctx,x-w/2,y,w,h,8,lg(ctx,y,y+h,['#d8a466','#9a6430']),'#4a2e12',4);
    ctx.fillStyle='rgba(240,220,170,.8)';ctx.fillRect(x-14,y,28,h);
  }
  if(sp){
    const h=300,w=sp.width*h/sp.height;
    ctx.drawImage(sp,x-w/2,base-h,w,h);
  }
}

function letterbox(src,dw,dh){
  const c=createCanvas(dw,dh),g=c.getContext('2d');
  g.fillStyle='#0b1211';g.fillRect(0,0,dw,dh);
  const s=Math.min(dw/W,dh/H),tw=W*s,th=H*s,x=(dw-tw)/2,y=(dh-th)/2;
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(src,x,y,tw,th);
  return c;
}
function crop(src,x,y,w,h,scale){
  const c=createCanvas(Math.round(w*scale),Math.round(h*scale)),g=c.getContext('2d');
  g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
  g.drawImage(src,x,y,w,h,0,0,c.width,c.height);
  return c;
}

async function main(){
  const bg=await loadImage(path.join(ROOT,'assets/v2/mail_bg.jpg'));
  let sp=null;try{sp=await loadImage(path.join(ROOT,'assets/sprocket.png'))}catch(e){console.warn('no sprocket',e.message)}

  function scene(mode,opt={}){
    const c=createCanvas(W,H),ctx=c.getContext('2d');
    ctx.drawImage(bg,0,0,W,H);
    ctx.fillStyle='rgba(8,18,17,.28)';ctx.fillRect(0,0,W,H);
    // floor ticks
    for(let x=0;x<W;x+=60){ctx.fillStyle=(x/60)%2?'#ffe066':'#1e2b29';ctx.fillRect(x,H-36,60,14)}
    drawSign(ctx,mode);
    drawBelt(ctx,opt.t||0.2);
    drawStampArm(ctx,mode,opt.stampT??0.6);
    const BOX_X=880,BOX_W=224,BOX_H=206,BELT_Y=560;
    if(opt.box!==false){
      drawBox(ctx,BOX_X-BOX_W/2,BELT_Y-BOX_H,BOX_W,BOX_H,!!opt.labeled);
      if(!opt.labeled)plaque(ctx,BOX_X,BELT_Y-BOX_H-40,224,44,'TAP TO SHAKE!',22,'#28403c');
    }
    drawPrinter(ctx);
    drawSprocket(ctx,sp);
    if(opt.cards!==false){
      const n=opt.nCards||3,L=opt.L||4,cw=L>4?470:n>3?340:400,ch=215,gap=30,tot=n*cw+(n-1)*gap,x0=Math.min(W/2-tot/2,1600-tot);
      for(let i=0;i<n;i++)drawCard(ctx,x0+i*(cw+gap),690,cw,ch,'ABCD'[i]);
    }
    hamburger(ctx);
    drawHUD(ctx,mode,{shipped:opt.shipped||0,score:opt.score||0,streak:opt.streak||0});
    return c;
  }

  // BEFORE (live v14.5.28 bugs, including mid-fade OK! at t=1.15)
  const before=scene('before',{stampT:1.15,shipped:0});
  save(before,'before/label_pick.png');
  save(crop(before,1420,200,520,200,2),'before/sign_2x.png');
  save(crop(before,100,0,560,200,2),'before/hud_2x.png');
  save(crop(before,1140,0,420,620,1.5),'before/stamper_points_1.5x.png');
  save(crop(before,1180,430,260,160,3),'before/ok_stamp_3x.png');

  // AFTER: rest pose, 0 of 12
  const after0=scene('after',{stampT:2.0,shipped:0});
  save(after0,'after/label_pick.png');
  save(after0,'final/label_pick.png');
  save(crop(after0,1420,200,520,200,2),'after/sign_2x.png');
  save(crop(after0,1420,200,520,200,2),'final/sign_2x.png');
  save(crop(after0,100,0,560,200,2),'after/hud_2x.png');
  save(crop(after0,100,0,560,200,2),'final/hud_2x.png');
  save(crop(after0,1140,0,420,700,1.5),'after/stamper_points_1.5x.png');
  save(crop(after0,1140,0,420,700,1.5),'final/stamper_points_1.5x.png');
  save(crop(after0,1180,420,260,160,3),'after/ok_stamp_3x.png');
  save(crop(after0,1180,420,260,160,3),'final/ok_stamp_3x.png');

  // AFTER: 5 shipped, mid streak, stamp down
  const after5=scene('after',{stampT:3.7,shipped:5,score:42,streak:3});
  save(after5,'after/label_shipped5.png');
  save(after5,'final/label_shipped5.png');
  save(crop(after5,100,0,560,200,2),'after/hud_shipped5_2x.png');
  save(crop(after5,100,0,560,200,2),'final/hud_shipped5_2x.png');
  save(crop(after5,1140,200,420,500,1.5),'after/stamper_down_1.5x.png');
  save(crop(after5,1140,200,420,500,1.5),'final/stamper_down_1.5x.png');

  // 4-card (harder) layout to check sprocket overlap
  const after4=scene('after',{stampT:2.0,shipped:7,score:70,streak:4,nCards:4});
  save(after4,'after/label_4cards.png');
  save(after4,'final/label_4cards.png');
  const after6=scene('after',{stampT:2.0,shipped:8,score:80,streak:5,nCards:3,L:6});
  save(after6,'after/label_6beat.png');
  save(after6,'final/label_6beat.png');

  // aspect letterboxes of the main after pick
  save(letterbox(after0,1280,800),'after/label_pick_16x10.png');
  save(letterbox(after0,1280,800),'final/label_pick_16x10.png');
  save(letterbox(after0,1024,768),'after/label_pick_4x3.png');
  save(letterbox(after0,1024,768),'final/label_pick_4x3.png');
  save(letterbox(after0,1920,800),'after/label_pick_widechrome.png');
  save(letterbox(after0,1920,800),'final/label_pick_widechrome.png');

  // full-stage overview at 1x already saved; also a tighter top-half compare strip
  const strip=createCanvas(1920,760),sg=strip.getContext('2d');
  sg.fillStyle='#0b1211';sg.fillRect(0,0,1920,760);
  sg.drawImage(before,0,0,1920,1080,0,0,940,528);
  sg.drawImage(after0,0,0,1920,1080,980,0,940,528);
  text(sg,'BEFORE v14.5.28',470,560,36,'#ffe066',{font:'Rammetto One',stroke:5});
  text(sg,'AFTER v14.5.29',1450,560,36,'#6ee678',{font:'Rammetto One',stroke:5});
  save(strip,'final/before_after_compare.png');
}
main().catch(e=>{console.error(e);process.exit(1)});
