/* Shared original six-face CSS materials for the studio and project journal. */
const TypesBlock={
 props:{kind:{default:'human'},family:{default:'emerald'},position:{default:()=>[0,0,0]},glass:{default:3},fill:{default:1}},
 computed:{style(){const level=Math.max(0,Math.min(10,Number(this.fill)||0))/10;const dark=this.kind==='gift',front=dark?800:500,top=dark?600:300,side=dark?900:600;return {transform:`translate3d(${this.position.join('px,')}px)`,'--type-front':`var(--color-${this.family}-${front})`,'--type-top':`var(--color-${this.family}-${top})`,'--type-side':`var(--color-${this.family}-${side})`,'--type-edge':`var(--color-${this.family}-${dark?500:300})`,'--type-glass':`color-mix(in oklab,var(--color-${this.family}-400) ${this.glass}%,transparent)`,'--type-wire':`color-mix(in oklab,var(--color-${this.family}-400) 38%,transparent)`,'--type-fill':(level*100)+'%','--type-fill-top':level===1?'#ffffff28':'transparent','--type-fill-bottom':level>0?'#ffffff28':'transparent','--type-glass-floor':`color-mix(in oklab,var(--color-${this.family}-400) ${Math.min(20,this.glass*1.5)}%,transparent)`};}},
 template:`<div :class="['cube','types-block',kind]" :style="style"><div v-for="face in ['front','back','left','right','top','bottom']" :key="face" :class="['face','face-'+face]"><span v-if="face==='front'&&kind==='gift'" class="types-gift-mark">◇</span></div></div>`
};
/* One reactive material per type; cube faces stay static between geometry changes. */
const TypesMesh={
 props:{blocks:Array,kind:String,family:String,glass:Number,fill:Number},
 computed:{material(){return TypesBlock.computed.style.call({kind:this.kind,family:this.family,glass:this.glass,fill:this.fill,position:[0,0,0]});}},
 template:`<div class="types-mesh" :style="material"><div v-for="b in blocks" :key="b.id" v-memo="[b]" :class="['cube','types-block',kind]" :style="{transform:'translate3d('+b.position.join('px,')+'px)'}"><div class="face face-front"><span v-if="kind==='gift'" class="types-gift-mark">◇</span></div><div class="face face-back"></div><div class="face face-left"></div><div class="face face-right"></div><div class="face face-top"></div><div class="face face-bottom"></div></div></div>`
};
