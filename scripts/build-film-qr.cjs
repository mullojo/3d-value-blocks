/* Scan It's dots / extra-rounded finders / built-in spark, in the film palette.
   Generation is local; the page only loads the resulting SVG. */
const fs=require('node:fs'),path=require('node:path'),qr=require('../vendor/qrcode-generator.js');
function build(){
 const payload='https://thelightweleave.example/give',code=qr(0,'H');code.addData(payload);code.make();
 const modules=code.getModuleCount(),ink='#e4ca94',paper='#131417',box=424,moduleSize=box/(modules+8),x0=28+moduleSize*4,y0=64+moduleSize*4;
 const f=n=>Number(n.toFixed(4));
 const finder=(x,y)=>(x<7&&y<7)||(x>=modules-7&&y<7)||(x<7&&y>=modules-7);
 const dots=[];
 for(let y=0;y<modules;y++)for(let x=0;x<modules;x++)if(code.isDark(y,x)&&!finder(x,y))dots.push(`<circle cx="${f(x0+(x+.5)*moduleSize)}" cy="${f(y0+(y+.5)*moduleSize)}" r="${f(moduleSize*.56)}"/>`);
 const corners=[[0,0],[modules-7,0],[0,modules-7]].map(([x,y])=>{const px=x0+x*moduleSize,py=y0+y*moduleSize;return `<rect x="${f(px)}" y="${f(py)}" width="${f(7*moduleSize)}" height="${f(7*moduleSize)}" rx="${f(2.1*moduleSize)}"/><rect x="${f(px+moduleSize)}" y="${f(py+moduleSize)}" width="${f(5*moduleSize)}" height="${f(5*moduleSize)}" rx="${f(1.15*moduleSize)}" fill="${paper}"/><circle cx="${f(px+3.5*moduleSize)}" cy="${f(py+3.5*moduleSize)}" r="${f(1.5*moduleSize)}"/>`;}).join('');
 const cx=x0+modules*moduleSize/2,cy=y0+modules*moduleSize/2,disc=moduleSize*3.6,scale=moduleSize*6.2/64;
 // Same spark path as Scan It / QR-Code-Maker's built-in symbol.
 const spark='M32 8 38 25 56 32 38 39 32 56 25 39 8 32 25 25Z';
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="480" height="550" viewBox="0 0 480 550" role="img" aria-labelledby="qr-title qr-desc"><title id="qr-title">Keep the light moving</title><desc id="qr-desc">Rounded gold concept QR code with a central spark. Demo giving address only; no live payments.</desc><rect width="480" height="550" rx="16" fill="${paper}"/><g fill="${ink}"><text x="240" y="34" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="22" letter-spacing="1.2">THE NEXT STORY STARTS HERE</text>${dots.join('')}${corners}<circle cx="${f(cx)}" cy="${f(cy)}" r="${f(disc)}" fill="${paper}"/><path d="${spark}" transform="translate(${f(cx-32*scale)} ${f(cy-32*scale)}) scale(${f(scale)})"/><text x="240" y="528" text-anchor="middle" font-family="Arial,sans-serif" font-weight="700" font-size="24" letter-spacing="2">SCAN &amp; SUPPORT</text></g></svg>`;
 const meta={payload,purpose:'Fictional giving concept. No live payment destination.',generator:'qrcode-generator 1.4.4 + local Scan It SVG styling',styleSource:'QR-Code-Maker/app.js: dots, extra-rounded corners, built-in spark',errorCorrection:'H',quietZoneModules:4,modules,ink,paper,dots:'circles',corners:'extra-rounded',centerSymbol:'spark',centerDiscModules:7.2};
 return {svg,meta};
}
if(require.main===module){const {svg,meta}=build();fs.writeFileSync(path.join(__dirname,'../journal-assets/film-giving-concept.svg'),svg);fs.writeFileSync(path.join(__dirname,'../journal-assets/film-giving-concept.json'),JSON.stringify(meta,null,2)+'\n');console.log(`Styled concept QR generated: ${meta.modules}×${meta.modules}, ECC ${meta.errorCorrection}.`);}
module.exports={build};
