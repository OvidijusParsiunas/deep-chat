"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[9837],{36808:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>c,default:()=>f,frontMatter:()=>u,metadata:()=>d,toc:()=>p});var r=n(74848),a=n(28453),o=n(24033),s=n(50363),i=(n(43976),n(15781)),l=n(78478);n(19365),n(11470);const u={sidebar_position:1},c="Sticky",d={id:"examples/Layout/sticky",title:"Sticky",description:"Example to help you stick the component to any side of the screen - furthering a chat-like experience to your users. The core method to achieve this is to",source:"@site/docs/examples/Layout/sticky.mdx",sourceDirName:"examples/Layout",slug:"/examples/Layout/sticky",permalink:"/examples/Layout/sticky",draft:!1,unlisted:!1,editUrl:"https://github.com/OvidijusParsiunas/deep-chat/tree/main/website/docs/examples/Layout/sticky.mdx",tags:[],version:"current",sidebarPosition:1,frontMatter:{sidebar_position:1},sidebar:"examples",previous:{title:"Full Screen",permalink:"/examples/Layout/fullScreen"}},h={},p=[];function m(e){const t={a:"a",code:"code",em:"em",h1:"h1",p:"p",pre:"pre",...(0,a.R)(),...e.components};return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(t.h1,{id:"sticky",children:"Sticky"}),"\n",(0,r.jsxs)(t.p,{children:["Example to help you stick the component to any side of the screen - furthering a chat-like experience to your users. The core method to achieve this is to\nset the ",(0,r.jsx)(t.a,{href:"/docs/styles#style",children:(0,r.jsx)(t.code,{children:"style"})})," property with ",(0,r.jsx)(t.em,{children:"position: fixed"})," and defining the side you want to component to sit on e.g. ",(0,r.jsx)(t.em,{children:"right: 7%"}),"."]}),"\n","\n","\n",(0,r.jsx)(l.A,{children:()=>n(61886).readdAutoNavShadowToggle()}),"\n",(0,r.jsx)("h3",{children:"Example code"}),"\n",(0,r.jsx)(t.pre,{children:(0,r.jsx)(t.code,{className:"language-html",children:'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Frameworks) --\x3e\n\n<deep-chat\n  style="border-radius: 10px; position: fixed; bottom: 0px; right: 7%; z-index: 1"\n  history=\'[\n    {"text": "Hey, how are you?", "role": "user"},\n    {"text": "I am doing great, thanks.", "role": "ai"},\n    {"text": "What is the meaning of life?", "role": "user"},\n    {"text": "Seeking fulfillment and personal growth.", "role": "ai"}\n  ]\'\n  demo="true"\n  connect=\'{"stream": true}\'\n></deep-chat>\n'})}),"\n",(0,r.jsx)(i.A,{}),"\n",(0,r.jsx)(o.A,{minHeight:1,children:(0,r.jsx)(s.A,{demo:!0,history:[{text:"Hey, how are you?",role:"user"},{text:"I am doing great, thanks.",role:"ai"},{text:"What is the meaning of life?",role:"user"},{text:"Seeking fulfillment and personal growth.",role:"ai"}],connect:{stream:!0},style:{borderRadius:"10px",position:"fixed",bottom:"0px",right:"7%",zIndex:1}})})]})}function f(e={}){const{wrapper:t}={...(0,a.R)(),...e.components};return t?(0,r.jsx)(t,{...e,children:(0,r.jsx)(m,{...e})}):m(e)}},19365:(e,t,n)=>{n.d(t,{A:()=>s});n(96540);var r=n(34164);const a={tabItem:"tabItem_Ymn6"};var o=n(74848);function s(e){let{children:t,hidden:n,className:s}=e;return(0,o.jsx)("div",{role:"tabpanel",className:(0,r.A)(a.tabItem,s),hidden:n,children:t})}},11470:(e,t,n)=>{n.d(t,{A:()=>k});var r=n(96540),a=n(34164),o=n(23104),s=n(56347),i=n(205),l=n(57485),u=n(31682),c=n(89466);function d(e){return r.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,r.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,r.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:r,default:a}}=e;return{value:t,label:n,attributes:r,default:a}}))}(n);return function(e){const t=(0,u.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function p(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const a=(0,s.W6)(),o=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(o),(0,r.useCallback)((e=>{if(!o)return;const t=new URLSearchParams(a.location.search);t.set(o,e),a.replace({...a.location,search:t.toString()})}),[o,a])]}function f(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,o=h(e),[s,l]=(0,r.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const r=n.find((e=>e.default))??n[0];if(!r)throw new Error("Unexpected error: 0 tabValues");return r.value}({defaultValue:t,tabValues:o}))),[u,d]=m({queryString:n,groupId:a}),[f,x]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,o]=(0,c.Dv)(n);return[a,(0,r.useCallback)((e=>{n&&o.set(e)}),[n,o])]}({groupId:a}),b=(()=>{const e=u??f;return p({value:e,tabValues:o})?e:null})();(0,i.A)((()=>{b&&l(b)}),[b]);return{selectedValue:s,selectValue:(0,r.useCallback)((e=>{if(!p({value:e,tabValues:o}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),x(e)}),[d,x,o]),tabValues:o}}var x=n(92303);const b={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var y=n(74848);function v(e){let{className:t,block:n,selectedValue:r,selectValue:s,tabValues:i}=e;const l=[],{blockElementScrollPositionUntilNextRender:u}=(0,o.a_)(),c=e=>{const t=e.currentTarget,n=l.indexOf(t),a=i[n].value;a!==r&&(u(t),s(a))},d=e=>{let t=null;switch(e.key){case"Enter":c(e);break;case"ArrowRight":{const n=l.indexOf(e.currentTarget)+1;t=l[n]??l[0];break}case"ArrowLeft":{const n=l.indexOf(e.currentTarget)-1;t=l[n]??l[l.length-1];break}}t?.focus()};return(0,y.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,a.A)("tabs",{"tabs--block":n},t),children:i.map((e=>{let{value:t,label:n,attributes:o}=e;return(0,y.jsx)("li",{role:"tab",tabIndex:r===t?0:-1,"aria-selected":r===t,ref:e=>l.push(e),onKeyDown:d,onClick:c,...o,className:(0,a.A)("tabs__item",b.tabItem,o?.className,{"tabs__item--active":r===t}),children:n??t},t)}))})}function g(e){let{lazy:t,children:n,selectedValue:a}=e;const o=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=o.find((e=>e.props.value===a));return e?(0,r.cloneElement)(e,{className:"margin-top--md"}):null}return(0,y.jsx)("div",{className:"margin-top--md",children:o.map(((e,t)=>(0,r.cloneElement)(e,{key:t,hidden:e.props.value!==a})))})}function w(e){const t=f(e);return(0,y.jsxs)("div",{className:(0,a.A)("tabs-container",b.tabList),children:[(0,y.jsx)(v,{...e,...t}),(0,y.jsx)(g,{...e,...t})]})}function k(e){const t=(0,x.A)();return(0,y.jsx)(w,{...e,children:d(e.children)},String(t))}},15781:(e,t,n)=>{n.d(t,{A:()=>a});n(96540);var r=n(74848);function a(){return(0,r.jsx)("div",{style:{height:"1px"}})}},61886:(e,t,n)=>{function r(e){window.scrollY>0?e.style.boxShadow="0 1px 2px 0 rgb(0 0 0 / 10%)":e.style.boxShadow="unset"}function a(){setTimeout((()=>{window.removeEventListener("scroll",window.toggleNavOnScroll);const e=document.getElementsByClassName("navbar--fixed-top");if(e[0]){const t=e[0];r(t),window.toggleNavOnScroll=r.bind(this,t),window.addEventListener("scroll",window.toggleNavOnScroll)}}),2)}function o(){setTimeout((()=>{const e=document.querySelectorAll(".homepage > body > #__docusaurus > nav")?.[0];try{e.classList.add("fade-in")}catch(t){console.error(t),console.log("element was not rendered in time - use MutationObserver")}}),2)}n.r(t),n.d(t,{fadeIn:()=>o,readdAutoNavShadowToggle:()=>a})},24033:(e,t,n)=>{n.d(t,{A:()=>o,q:()=>a});n(96540);var r=n(74848);function a(e){return e?.children[0]?.children[0]}function o(e){let{children:t,minHeight:n,innerDisplay:a}=e;return(0,r.jsx)("div",{className:"documentation-example-container",style:{minHeight:`${n||400}px`},children:(0,r.jsx)("div",{style:{display:a||"block"},children:t})})}},50363:(e,t,n)=>{n.d(t,{A:()=>o});var r=n(78478),a=(n(96540),n(74848));function o(e){return(0,a.jsx)(r.A,{children:()=>{const t=n(78152).DeepChat;return(0,a.jsx)(t,{...e,children:e.children})}})}},43976:(e,t,n)=>{n.d(t,{A:()=>s});var r=n(96540),a=n(74848);function o(e){let{isDisplayed:t,children:n}=e;return t?(0,a.jsx)("div",{children:n}):(0,a.jsx)("div",{})}function s(e){let{children:t}=e;const[n,s]=r.useState(!1);return(0,a.jsxs)("div",{children:[(0,a.jsxs)("div",{className:"code-toggle",onClick:()=>s(!n),children:[n?"Hide":"View"," Code"]}),(0,a.jsx)(o,{isDisplayed:n,children:t})]})}},28453:(e,t,n)=>{n.d(t,{R:()=>s,x:()=>i});var r=n(96540);const a={},o=r.createContext(a);function s(e){const t=r.useContext(o);return r.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function i(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(a):e.components||a:s(e.components),r.createElement(o.Provider,{value:t},e.children)}}}]);