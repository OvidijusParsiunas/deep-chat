"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[2355],{5162:(e,t,n)=>{n.d(t,{Z:()=>r});var a=n(7294),i=n(6010);const l={tabItem:"tabItem_Ymn6"};function r(e){let{children:t,hidden:n,className:r}=e;return a.createElement("div",{role:"tabpanel",className:(0,i.Z)(l.tabItem,r),hidden:n},t)}},4866:(e,t,n)=>{n.d(t,{Z:()=>T});var a=n(7462),i=n(7294),l=n(6010),r=n(2466),o=n(6550),s=n(1980),m=n(7392),p=n(12);function d(e){return function(e){return i.Children.map(e,(e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:t,label:n,attributes:a,default:i}}=e;return{value:t,label:n,attributes:a,default:i}}))}function u(e){const{values:t,children:n}=e;return(0,i.useMemo)((()=>{const e=t??d(n);return function(e){const t=(0,m.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function c(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function k(e){let{queryString:t=!1,groupId:n}=e;const a=(0,o.k6)(),l=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,s._X)(l),(0,i.useCallback)((e=>{if(!l)return;const t=new URLSearchParams(a.location.search);t.set(l,e),a.replace({...a.location,search:t.toString()})}),[l,a])]}function g(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,l=u(e),[r,o]=(0,i.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!c({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const a=n.find((e=>e.default))??n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:l}))),[s,m]=k({queryString:n,groupId:a}),[d,g]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,l]=(0,p.Nk)(n);return[a,(0,i.useCallback)((e=>{n&&l.set(e)}),[n,l])]}({groupId:a}),h=(()=>{const e=s??d;return c({value:e,tabValues:l})?e:null})();(0,i.useLayoutEffect)((()=>{h&&o(h)}),[h]);return{selectedValue:r,selectValue:(0,i.useCallback)((e=>{if(!c({value:e,tabValues:l}))throw new Error(`Can't select invalid tab value=${e}`);o(e),m(e),g(e)}),[m,g,l]),tabValues:l}}var h=n(2389);const b={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function y(e){let{className:t,block:n,selectedValue:o,selectValue:s,tabValues:m}=e;const p=[],{blockElementScrollPositionUntilNextRender:d}=(0,r.o5)(),u=e=>{const t=e.currentTarget,n=p.indexOf(t),a=m[n].value;a!==o&&(d(t),s(a))},c=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=p.indexOf(e.currentTarget)+1;t=p[n]??p[0];break}case"ArrowLeft":{const n=p.indexOf(e.currentTarget)-1;t=p[n]??p[p.length-1];break}}t?.focus()};return i.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,l.Z)("tabs",{"tabs--block":n},t)},m.map((e=>{let{value:t,label:n,attributes:r}=e;return i.createElement("li",(0,a.Z)({role:"tab",tabIndex:o===t?0:-1,"aria-selected":o===t,key:t,ref:e=>p.push(e),onKeyDown:c,onClick:u},r,{className:(0,l.Z)("tabs__item",b.tabItem,r?.className,{"tabs__item--active":o===t})}),n??t)})))}function C(e){let{lazy:t,children:n,selectedValue:a}=e;const l=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=l.find((e=>e.props.value===a));return e?(0,i.cloneElement)(e,{className:"margin-top--md"}):null}return i.createElement("div",{className:"margin-top--md"},l.map(((e,t)=>(0,i.cloneElement)(e,{key:t,hidden:e.props.value!==a}))))}function I(e){const t=g(e);return i.createElement("div",{className:(0,l.Z)("tabs-container",b.tabList)},i.createElement(y,(0,a.Z)({},e,t)),i.createElement(C,(0,a.Z)({},e,t)))}function T(e){const t=(0,h.Z)();return i.createElement(I,(0,a.Z)({key:String(t)},e))}},9814:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(7294);function i(){return a.createElement("div",{style:{height:"1px"}})}},8751:(e,t,n)=>{n.d(t,{Z:()=>l,a:()=>i});var a=n(7294);function i(e){return e?.children[0]?.children[0]}function l(e){let{children:t,minHeight:n}=e;return a.createElement("div",{className:"documentation-example-container",style:{minHeight:`${n||400}px`}},a.createElement("div",null,t))}},5833:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(7294);function i(e){let{children:t}=e;const[n,i]=a.useState(!0);return a.createElement("div",null,n&&t[0],!n&&t[1],a.createElement("div",{className:"component-key-toggle-button-container"},a.createElement("button",{className:"documentation-button component-key-toggle-button",onClick:()=>i(!n)},n&&"Insert test key",!n&&"Use placeholder key")))}},3420:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>k,default:()=>I,frontMatter:()=>c,metadata:()=>g,toc:()=>b});var a=n(7462),i=(n(7294),n(3905));const l="data:image/png;base64,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";var r=n(5833),o=n(8751),s=n(4602),m=n(9814),p=n(1262),d=n(5162),u=n(4866);const c={sidebar_position:3},k=void 0,g={unversionedId:"docs/directConnection/StabilityAI",id:"docs/directConnection/StabilityAI",title:"StabilityAI",description:"Properties used to connect to Stability AI.",source:"@site/docs/docs/directConnection/StabilityAI.mdx",sourceDirName:"docs/directConnection",slug:"/docs/directConnection/StabilityAI",permalink:"/docs/directConnection/StabilityAI",draft:!1,editUrl:"https://github.com/OvidijusParsiunas/deep-chat/tree/main/website/docs/docs/directConnection/StabilityAI.mdx",tags:[],version:"current",sidebarPosition:3,frontMatter:{sidebar_position:3},sidebar:"docs",previous:{title:"HuggingFace",permalink:"/docs/directConnection/HuggingFace"},next:{title:"Cohere",permalink:"/docs/directConnection/Cohere"}},h={},b=[{value:"<code>stabilityAI</code>",id:"stabilityAI",level:3},{value:"Service Types",id:"service-types",level:2},{value:"<code>TextToImage</code>",id:"TextToImage",level:3},{value:"Example",id:"example",level:4},{value:"<code>ImageToImage</code>",id:"ImageToImage",level:3},{value:"Example",id:"example-1",level:4},{value:"<code>ImageToImageMasking</code>",id:"ImageToImageMasking",level:3},{value:"Example",id:"example-2",level:4},{value:"<code>ImageToImageUpscale</code>",id:"ImageToImageUpscale",level:3},{value:"Example",id:"example-3",level:4},{value:"Shared Types",id:"shared-types",level:2},{value:"<code>StabilityAICommon</code>",id:"StabilityAICommon",level:3},{value:"Example",id:"example-4",level:4}],y={toc:b},C="wrapper";function I(e){let{components:t,...c}=e;return(0,i.kt)(C,(0,a.Z)({},y,c,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("div",null),(0,i.kt)("h1",{id:"stabilityai"},(0,i.kt)("img",{src:l,width:"48",style:{float:"left",marginTop:"5px",marginRight:"6px",marginLeft:"2px"}}),(0,i.kt)("span",{className:"direct-service-title"},"StabilityAI")),(0,i.kt)("p",null,"Properties used to connect to ",(0,i.kt)("a",{parentName:"p",href:"https://platform.stability.ai/"},"Stability AI"),"."),(0,i.kt)("h3",{id:"stabilityAI"},(0,i.kt)("inlineCode",{parentName:"h3"},"stabilityAI")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: { ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#TextToImage"},(0,i.kt)("inlineCode",{parentName:"a"},"textToImage?: TextToImage")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#ImageToImage"},(0,i.kt)("inlineCode",{parentName:"a"},"imageToImage?: ImageToImage")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#ImageToImageMasking"},(0,i.kt)("inlineCode",{parentName:"a"},"imageToImageMasking?: ImageToImageMasking")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#ImageToImageUpscale"},(0,i.kt)("inlineCode",{parentName:"a"},"imageToImageUpscale?: ImageToImageUpscale"))," ",(0,i.kt)("br",null),"\n}"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},"{textToImage: true}"))),(0,i.kt)(p.Z,{mdxType:"BrowserOnly"},(()=>n(1853).readdAutoNavShadowToggle())),(0,i.kt)("h2",{id:"service-types"},"Service Types"),(0,i.kt)("h3",{id:"TextToImage"},(0,i.kt)("inlineCode",{parentName:"h3"},"TextToImage")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: ",(0,i.kt)("inlineCode",{parentName:"li"},"true")," | { ",(0,i.kt)("a",{parentName:"li",href:"#StabilityAICommon"},(0,i.kt)("inlineCode",{parentName:"a"},"StabilityAICommon")),", ",(0,i.kt)("inlineCode",{parentName:"li"},"width?: number"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"height?: number")," }"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},'{engine_id: "stable-diffusion-v1-5", width: 512, height: 512}'))),(0,i.kt)("p",null,"Connect to Stability AI's ",(0,i.kt)("a",{parentName:"p",href:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage"},(0,i.kt)("inlineCode",{parentName:"a"},"text-to-image"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"StabilityAICommon")," properties can be used to set the engine Id and other image parameters. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"width")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"height")," is used to set the image dimensions. They must be multiples of ",(0,i.kt)("em",{parentName:"p"},"64")," and pass the following: ",(0,i.kt)("br",null),"\nFor 768 engines: 589,824 \u2264 ",(0,i.kt)("em",{parentName:"p"},"width ","*"," height")," \u2264 1,048,576 and for other engines: 262,144 \u2264 ",(0,i.kt)("em",{parentName:"p"},"width ","*"," height")," \u2264 1,048,576.",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example"},"Example"),(0,i.kt)(r.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{key:"placeholder key",textToImage:{engine_id:"stable-diffusion-v1-5",height:640,samples:1}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{textToImage:{engine_id:"stable-diffusion-v1-5",height:640,samples:1}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(u.Z,{mdxType:"Tabs"},(0,i.kt)(d.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "textToImage": {"engine_id": "stable-diffusion-v1-5", "height": 640, "samples": 1}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(d.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "textToImage": {"engine_id": "stable-diffusion-v1-5", "height": 640, "samples": 1}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(m.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"ImageToImage"},(0,i.kt)("inlineCode",{parentName:"h3"},"ImageToImage")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," | {",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"p",href:"#StabilityAICommon"},(0,i.kt)("inlineCode",{parentName:"a"},"StabilityAICommon")),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"init_image_mode?:")," ",(0,i.kt)("inlineCode",{parentName:"p"},'"image_strength"')," | ",(0,i.kt)("inlineCode",{parentName:"p"},'"step_schedule_*"'),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"image_strength?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"step_schedule_start?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"step_schedule_end?: number")," ",(0,i.kt)("br",null),"\n}")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: { ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},'engine_id: "stable-diffusion-v1-5"'),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},'init_image_mode: "image_strength"'),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"image_strength: 0.35"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"step_schedule_start: 0.65"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"weight: 1")," ",(0,i.kt)("br",null),"\n}"))),(0,i.kt)("p",null,"Connect to Stability AI's ",(0,i.kt)("a",{parentName:"p",href:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage"},(0,i.kt)("inlineCode",{parentName:"a"},"image-to-image"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"StabilityAICommon")," properties can be used to set the engine Id and other image parameters. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"init_image_mode")," denotes whether the ",(0,i.kt)("inlineCode",{parentName:"p"},"image_strength")," or ",(0,i.kt)("inlineCode",{parentName:"p"},"step_schedule")," properties control the influence of the uploaded image on the new image. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"image_strength")," determines how much influence the uploaded image has on the diffusion process. A value close to ",(0,i.kt)("em",{parentName:"p"},"1")," will yield an image\nvery similar to the original, whilst a value closer to ",(0,i.kt)("em",{parentName:"p"},"0")," will yield an image that is wildly different. (0 to 1) ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"step_schedule_start")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"step_schedule_end")," are used to skip a proportion of the start/end of the diffusion steps,\nallowing the uploaded image to influence the final generated image. Lower values will result in more influence from the original image, while higher\nvalues will result in more influence from the diffusion steps. (0 to 1)"),(0,i.kt)("h4",{id:"example-1"},"Example"),(0,i.kt)(r.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{key:"placeholder key",imageToImage:{engine_id:"stable-diffusion-v1-5",init_image_mode:"image_strength",samples:1}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{imageToImage:{engine_id:"stable-diffusion-v1-5",init_image_mode:"image_strength",samples:1}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(u.Z,{mdxType:"Tabs"},(0,i.kt)(d.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImage": {"engine_id": "stable-diffusion-v1-5", "init_image_mode": "image_strength", "samples": 1}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(d.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImage": {"engine_id": "stable-diffusion-v1-5", "width": 1024, "height": 1024, "samples": 1}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(m.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"ImageToImageMasking"},(0,i.kt)("inlineCode",{parentName:"h3"},"ImageToImageMasking")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: ",(0,i.kt)("inlineCode",{parentName:"p"},"true")," | {",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"p",href:"#StabilityAICommon"},(0,i.kt)("inlineCode",{parentName:"a"},"StabilityAICommon")),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"mask_source?:")," ",(0,i.kt)("inlineCode",{parentName:"p"},'"MASK_IMAGE_WHITE"')," | ",(0,i.kt)("inlineCode",{parentName:"p"},'"MASK_IMAGE_BLACK"')," | ",(0,i.kt)("inlineCode",{parentName:"p"},'"INIT_IMAGE_ALPHA"')," ",(0,i.kt)("br",null),"\n}")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Default: ",(0,i.kt)("em",{parentName:"p"},'{engine_id: "stable-inpainting-512-v2-0", mask_source: "MASK_IMAGE_WHITE", weight: 1}')))),(0,i.kt)("p",null,"Connect to Stability AI's ",(0,i.kt)("a",{parentName:"p",href:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking"},(0,i.kt)("inlineCode",{parentName:"a"},"image-to-image-masking"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"StabilityAICommon")," properties can be used to set the engine Id and other image parameters. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"mask_source")," is used to define where the source of the mask is from. ",(0,i.kt)("em",{parentName:"p"},'"MASK_IMAGE_WHITE"')," will use the white pixels of the mask image (second image) as the mask,\nwhere white pixels are completely replaced and black pixels are unchanged. ",(0,i.kt)("em",{parentName:"p"},'"MASK_IMAGE_BLACK"')," will use the black pixels of the mask image (second image) as the mask,\nwhere black pixels are completely replaced and white pixels are unchanged. ",(0,i.kt)("em",{parentName:"p"},'"INIT_IMAGE_ALPHA"')," will use the alpha channel of the uploaded image as the mask,\nwhere fully transparent pixels are completely replaced and fully opaque pixels are unchanged - in this instance the mask image does not need to be uploaded."),(0,i.kt)("h4",{id:"example-2"},"Example"),(0,i.kt)(r.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{key:"placeholder key",imageToImageMasking:{mask_source:"MASK_IMAGE_WHITE",samples:1}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{imageToImageMasking:{mask_source:"MASK_IMAGE_WHITE",samples:1}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(u.Z,{mdxType:"Tabs"},(0,i.kt)(d.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImageMasking": {"mask_source": "MASK_IMAGE_WHITE", "samples": 1}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(d.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImageMasking": {"mask_source": "MASK_IMAGE_WHITE", "samples": 1}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(m.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"ImageToImageUpscale"},(0,i.kt)("inlineCode",{parentName:"h3"},"ImageToImageUpscale")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: ",(0,i.kt)("inlineCode",{parentName:"li"},"true")," | {",(0,i.kt)("inlineCode",{parentName:"li"},"engine_id?: string"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"width?: number"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"height?: number"),"}"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},'{engine_id: "esrgan-v1-x2plus"}'))),(0,i.kt)("p",null,"Connect to Stability AI's ",(0,i.kt)("a",{parentName:"p",href:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage"},(0,i.kt)("inlineCode",{parentName:"a"},"image-to-image-upscale"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"engine_id")," is the engine that will be used to process the image. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"width")," and ",(0,i.kt)("inlineCode",{parentName:"p"},"height")," are used to define the ",(0,i.kt)("em",{parentName:"p"},"desired")," with of the result image where only EITHER ONE of the two can be set.\nMinimum dimension number is 512. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example-3"},"Example"),(0,i.kt)(r.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{key:"placeholder key",imageToImageUpscale:{width:1e3}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{imageToImageUpscale:{width:1e3}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(u.Z,{mdxType:"Tabs"},(0,i.kt)(d.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImageUpscale": {"width": 1000}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(d.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "imageToImageUpscale": {"width": 1000}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(m.Z,{mdxType:"LineBreak"}),(0,i.kt)("h2",{id:"shared-types"},"Shared Types"),(0,i.kt)("p",null,"Types used in ",(0,i.kt)("a",{parentName:"p",href:"#stabilityAI"},(0,i.kt)("inlineCode",{parentName:"a"},"stabilityAI"))," properties:"),(0,i.kt)("h3",{id:"StabilityAICommon"},(0,i.kt)("inlineCode",{parentName:"h3"},"StabilityAICommon")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: {",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"engine_id?: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"samples?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"weight?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"cfg_scale?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"sampler?: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"seed?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"steps?: number"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"style_preset?: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"clip_guidance_preset?: string")," ",(0,i.kt)("br",null),"\n}")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: { ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"samples: 1"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"cfg_scale: 7"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"seed: 0"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},"steps: 50"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("em",{parentName:"p"},'clip_guidance_preset: "NONE"')," ",(0,i.kt)("br",null),"\n}"))),(0,i.kt)("p",null,"Object that is used to define the target engine and other image processing parameters. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"engine_id")," is the identifier for the engine that will be used to process the images. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"samples")," is the number of images that will be generated (1 to 10). ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"weight")," defines how specific to the prompt the generated image should be (0 to 1). ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"cfg_scale")," defines how strictly the diffusion process should adhere to the prompt (0 to 35). ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"sampler")," is the sampler that will be used for the diffusion process. If this value is not set - the most appropriate one is automatically selected. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"seed")," is the number for the random noise (0 to 4294967295). ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"steps")," is the number of diffusion steps to run (10 to 150). ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"style_preset")," guides the image model towards a particular style. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"clip_guidance_preset")," is the clip guidance preset. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example-4"},"Example"),(0,i.kt)(r.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{key:"placeholder key",textToImage:{engine_id:"stable-diffusion-v1-5",weight:1,style_preset:"fantasy-art",samples:2}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(o.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{stabilityAI:{textToImage:{engine_id:"stable-diffusion-v1-5",weight:1,style_preset:"fantasy-art",samples:2}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(u.Z,{mdxType:"Tabs"},(0,i.kt)(d.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "textToImage": {\n        "engine_id": "stable-diffusion-v1-5",\n        "weight": 1,\n        "style_preset": "fantasy-art",\n        "samples": 2\n  }}}\'\n></deep-chat>\n'))),(0,i.kt)(d.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "stabilityAI": {\n      "key": "placeholder key",\n      "textToImage": {\n        "engine_id": "stable-diffusion-v1-5",\n        "weight": 1,\n        "style_preset": "fantasy-art",\n        "samples": 2\n  }}}\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(m.Z,{mdxType:"LineBreak"}))}I.isMDXComponent=!0}}]);