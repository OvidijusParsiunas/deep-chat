"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[182],{5162:(e,t,n)=>{n.d(t,{Z:()=>o});var a=n(7294),i=n(6010);const r={tabItem:"tabItem_Ymn6"};function o(e){let{children:t,hidden:n,className:o}=e;return a.createElement("div",{role:"tabpanel",className:(0,i.Z)(r.tabItem,o),hidden:n},t)}},4866:(e,t,n)=>{n.d(t,{Z:()=>y});var a=n(7462),i=n(7294),r=n(6010),o=n(2466),l=n(6550),s=n(1980),u=n(7392),c=n(12);function p(e){return function(e){return i.Children.map(e,(e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}(e).map((e=>{let{props:{value:t,label:n,attributes:a,default:i}}=e;return{value:t,label:n,attributes:a,default:i}}))}function d(e){const{values:t,children:n}=e;return(0,i.useMemo)((()=>{const e=t??p(n);return function(e){const t=(0,u.l)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function m(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function A(e){let{queryString:t=!1,groupId:n}=e;const a=(0,l.k6)(),r=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,s._X)(r),(0,i.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(a.location.search);t.set(r,e),a.replace({...a.location,search:t.toString()})}),[r,a])]}function k(e){const{defaultValue:t,queryString:n=!1,groupId:a}=e,r=d(e),[o,l]=(0,i.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!m({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const a=n.find((e=>e.default))??n[0];if(!a)throw new Error("Unexpected error: 0 tabValues");return a.value}({defaultValue:t,tabValues:r}))),[s,u]=A({queryString:n,groupId:a}),[p,k]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[a,r]=(0,c.Nk)(n);return[a,(0,i.useCallback)((e=>{n&&r.set(e)}),[n,r])]}({groupId:a}),h=(()=>{const e=s??p;return m({value:e,tabValues:r})?e:null})();(0,i.useLayoutEffect)((()=>{h&&l(h)}),[h]);return{selectedValue:o,selectValue:(0,i.useCallback)((e=>{if(!m({value:e,tabValues:r}))throw new Error(`Can't select invalid tab value=${e}`);l(e),u(e),k(e)}),[u,k,r]),tabValues:r}}var h=n(2389);const g={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};function N(e){let{className:t,block:n,selectedValue:l,selectValue:s,tabValues:u}=e;const c=[],{blockElementScrollPositionUntilNextRender:p}=(0,o.o5)(),d=e=>{const t=e.currentTarget,n=c.indexOf(t),a=u[n].value;a!==l&&(p(t),s(a))},m=e=>{let t=null;switch(e.key){case"Enter":d(e);break;case"ArrowRight":{const n=c.indexOf(e.currentTarget)+1;t=c[n]??c[0];break}case"ArrowLeft":{const n=c.indexOf(e.currentTarget)-1;t=c[n]??c[c.length-1];break}}t?.focus()};return i.createElement("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,r.Z)("tabs",{"tabs--block":n},t)},u.map((e=>{let{value:t,label:n,attributes:o}=e;return i.createElement("li",(0,a.Z)({role:"tab",tabIndex:l===t?0:-1,"aria-selected":l===t,key:t,ref:e=>c.push(e),onKeyDown:m,onClick:d},o,{className:(0,r.Z)("tabs__item",g.tabItem,o?.className,{"tabs__item--active":l===t})}),n??t)})))}function b(e){let{lazy:t,children:n,selectedValue:a}=e;const r=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=r.find((e=>e.props.value===a));return e?(0,i.cloneElement)(e,{className:"margin-top--md"}):null}return i.createElement("div",{className:"margin-top--md"},r.map(((e,t)=>(0,i.cloneElement)(e,{key:t,hidden:e.props.value!==a}))))}function v(e){const t=k(e);return i.createElement("div",{className:(0,r.Z)("tabs-container",g.tabList)},i.createElement(N,(0,a.Z)({},e,t)),i.createElement(b,(0,a.Z)({},e,t)))}function y(e){const t=(0,h.Z)();return i.createElement(v,(0,a.Z)({key:String(t)},e))}},9814:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(7294);function i(){return a.createElement("div",{style:{height:"1px"}})}},8751:(e,t,n)=>{n.d(t,{Z:()=>r,a:()=>i});var a=n(7294);function i(e){return e?.children[0]?.children[0]}function r(e){let{children:t,minHeight:n}=e;return a.createElement("div",{className:"documentation-example-container",style:{minHeight:`${n||400}px`}},a.createElement("div",null,t))}},5833:(e,t,n)=>{n.d(t,{Z:()=>i});var a=n(7294);function i(e){let{children:t}=e;const[n,i]=a.useState(!0);return a.createElement("div",null,n&&t[0],!n&&t[1],a.createElement("div",{className:"component-key-toggle-button-container"},a.createElement("button",{className:"documentation-button component-key-toggle-button",onClick:()=>i(!n)},n&&"Insert test key",!n&&"Use placeholder key")))}},8949:(e,t,n)=>{n.r(t),n.d(t,{assets:()=>h,contentTitle:()=>A,default:()=>v,frontMatter:()=>m,metadata:()=>k,toc:()=>g});var a=n(7462),i=(n(7294),n(3905)),r=n(4554),o=n(5833),l=n(8751),s=n(4602),u=n(9814),c=n(1262),p=n(5162),d=n(4866);const m={sidebar_position:5},A=void 0,k={unversionedId:"docs/directConnection/Azure",id:"docs/directConnection/Azure",title:"Azure",description:"Properties used to connect to Azure Cognitive Services.",source:"@site/docs/docs/directConnection/Azure.mdx",sourceDirName:"docs/directConnection",slug:"/docs/directConnection/Azure",permalink:"/docs/directConnection/Azure",draft:!1,editUrl:"https://github.com/OvidijusParsiunas/deep-chat/tree/main/website/docs/docs/directConnection/Azure.mdx",tags:[],version:"current",sidebarPosition:5,frontMatter:{sidebar_position:5},sidebar:"docs",previous:{title:"Cohere",permalink:"/docs/directConnection/Cohere"},next:{title:"AssemblyAI",permalink:"/docs/directConnection/AssemblyAI"}},h={},g=[{value:"<code>azure</code>",id:"azure",level:3},{value:"Service Types",id:"service-types",level:2},{value:"<code>TextToSpeech</code>",id:"TextToSpeech",level:3},{value:"Example",id:"example",level:4},{value:"<code>SpeechToText</code>",id:"SpeechToText",level:3},{value:"Example",id:"example-1",level:4},{value:"<code>Summarization</code>",id:"Summarization",level:3},{value:"Example",id:"example-2",level:4},{value:"<code>Translation</code>",id:"Translation",level:3},{value:"Example",id:"example-3",level:4}],N={toc:g},b="wrapper";function v(e){let{components:t,...m}=e;return(0,i.kt)(b,(0,a.Z)({},N,m,{components:t,mdxType:"MDXLayout"}),(0,i.kt)("div",null),(0,i.kt)("h1",{id:"azure"},(0,i.kt)("img",{src:r.Z,width:"48",style:{float:"left",marginTop:"8px",marginRight:"10px"}}),(0,i.kt)("span",{className:"direct-service-title"},"Azure")),(0,i.kt)("p",null,"Properties used to connect to ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-gb/azure/cognitive-services/"},"Azure Cognitive Services"),"."),(0,i.kt)("h3",{id:"azure"},(0,i.kt)("inlineCode",{parentName:"h3"},"azure")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: { ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#TextToSpeech"},(0,i.kt)("inlineCode",{parentName:"a"},"textToSpeech?: TextToSpeech")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#SpeechToText"},(0,i.kt)("inlineCode",{parentName:"a"},"speechToText?: SpeechToText")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#Summarization"},(0,i.kt)("inlineCode",{parentName:"a"},"summarization?: Summarization")),", ",(0,i.kt)("br",null),"\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("a",{parentName:"li",href:"#Translation"},(0,i.kt)("inlineCode",{parentName:"a"},"translation?: Translation")),(0,i.kt)("br",null),"\n}")),(0,i.kt)(c.Z,{mdxType:"BrowserOnly"},(()=>n(1853).readdAutoNavShadowToggle())),(0,i.kt)("h2",{id:"service-types"},"Service Types"),(0,i.kt)("h3",{id:"TextToSpeech"},(0,i.kt)("inlineCode",{parentName:"h3"},"TextToSpeech")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Type: {",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"region: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"lang?: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"name?: string")," ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"gender?: string"),", ",(0,i.kt)("br",null),"\n","\xa0","\xa0","\xa0","\xa0"," ",(0,i.kt)("inlineCode",{parentName:"p"},"outputFormat?: string")," ",(0,i.kt)("br",null),"\n}")),(0,i.kt)("li",{parentName:"ul"},(0,i.kt)("p",{parentName:"li"},"Default: ",(0,i.kt)("em",{parentName:"p"},'{lang: "en-US", name: "en-US-JennyNeural", gender: "Female", outputFormat: "audio-16khz-128kbitrate-mono-mp3"}')))),(0,i.kt)("p",null,"Connect to Azure's ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/rest-text-to-speech?tabs=streaming#convert-text-to-speech"},(0,i.kt)("inlineCode",{parentName:"a"},"text to speech"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"region")," is a required string property to denote the region of your speech service, e.g. ",(0,i.kt)("em",{parentName:"p"},'"eastus"'),". ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"lang")," is the locale (BCP-47) string code for the language of the audio output. See ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/language-support?tabs=tts"},"here")," for available options. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"name")," is the name of the voice used for the audio output. See ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/language-support?tabs=tts"},"here")," for available options. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"gender")," is the gender of the audio output voice. E.g. ",(0,i.kt)("em",{parentName:"p"},'"Female"')," or ",(0,i.kt)("em",{parentName:"p"},'"Male"'),". ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"outputFormat")," is the output audio format. See ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-GB/azure/cognitive-services/speech-service/rest-text-to-speech?tabs=streaming#audio-outputs"},"here")," for available options. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example"},"Example"),(0,i.kt)(o.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{key:"placeholder key",textToSpeech:{region:"eastus"}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{textToSpeech:{region:"eastus"}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(d.Z,{mdxType:"Tabs"},(0,i.kt)(p.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "textToSpeech": {"region": "eastus"}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(p.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "textToSpeech": {"region": "eastus"}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(u.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"SpeechToText"},(0,i.kt)("inlineCode",{parentName:"h3"},"SpeechToText")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: {",(0,i.kt)("inlineCode",{parentName:"li"},"region: string"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"lang?: string"),"}"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},'{lang: "en-US"}'))),(0,i.kt)("p",null,"Connect to Azure's ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-gb/azure/cognitive-services/speech-service/rest-speech-to-text"},(0,i.kt)("inlineCode",{parentName:"a"},"speech to text"))," API. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"region")," is a required string property to denote the region of your speech service, e.g. ",(0,i.kt)("em",{parentName:"p"},'"eastus"'),". ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"lang")," is the locale (BCP-47) string code for the language of the input output. See ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support?tabs=stt"},"here")," for available options. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example-1"},"Example"),(0,i.kt)(o.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{key:"placeholder key",speechToText:{region:"eastus"}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{speechToText:{region:"eastus"}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(d.Z,{mdxType:"Tabs"},(0,i.kt)(p.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "speechToText": {"region": "eastus"}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(p.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "speechToText": {"region": "eastus"}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(u.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"Summarization"},(0,i.kt)("inlineCode",{parentName:"h3"},"Summarization")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: {",(0,i.kt)("inlineCode",{parentName:"li"},"endpoint: string"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"language?: string"),"}"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},'{language: "en"}'))),(0,i.kt)("p",null,"Connect to Azure's ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/summarization/overview?tabs=document-summarization"},(0,i.kt)("inlineCode",{parentName:"a"},"summarization"))," API. Please read ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-us/azure/cognitive-services/language-service/summarization/quickstart?tabs=document-summarization%2Cwindows&pivots=rest-api"},"here")," how to generate a language service. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"endpoint")," is the full endpoint for your generated language service. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"language")," is a ",(0,i.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/IETF_language_tag#:~:text=An%20IETF%20BCP%2047%20language,the%20IANA%20Language%20Subtag%20Registry."},"BCP 47 language tag")," for the language of your text. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example-2"},"Example"),(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{key:"placeholder name",summarization:{endpoint:"https://placeholderresource.cognitiveservices.azure.com"}}},mdxType:"DeepChatBrowser"})),(0,i.kt)("admonition",{type:"caution"},(0,i.kt)("p",{parentName:"admonition"},"Cannot input a test key as user's language service ",(0,i.kt)("inlineCode",{parentName:"p"},"endpoint")," is required.")),(0,i.kt)(d.Z,{mdxType:"Tabs"},(0,i.kt)(p.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "summarization": {"endpoint": "https://placeholderresource.cognitiveservices.azure.com"}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(p.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "summarization": {"endpoint": "https://placeholderresource.cognitiveservices.azure.com"}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(u.Z,{mdxType:"LineBreak"}),(0,i.kt)("h3",{id:"Translation"},(0,i.kt)("inlineCode",{parentName:"h3"},"Translation")),(0,i.kt)("ul",null,(0,i.kt)("li",{parentName:"ul"},"Type: {",(0,i.kt)("inlineCode",{parentName:"li"},"region?: string"),", ",(0,i.kt)("inlineCode",{parentName:"li"},"language?: string"),"}"),(0,i.kt)("li",{parentName:"ul"},"Default: ",(0,i.kt)("em",{parentName:"li"},'{language: "es"}'))),(0,i.kt)("p",null,"Connect to Azure's ",(0,i.kt)("a",{parentName:"p",href:"https://learn.microsoft.com/en-gb/azure/cognitive-services/translator/reference/v3-0-reference"},(0,i.kt)("inlineCode",{parentName:"a"},"translation"))," API.\n",(0,i.kt)("inlineCode",{parentName:"p"},"region")," is the region of your translator resource. Thi is optional if your resource is global. ",(0,i.kt)("br",null),"\n",(0,i.kt)("inlineCode",{parentName:"p"},"language")," is the ",(0,i.kt)("a",{parentName:"p",href:"https://en.wikipedia.org/wiki/IETF_language_tag#:~:text=An%20IETF%20BCP%2047%20language,the%20IANA%20Language%20Subtag%20Registry."},"BCP 47 language tag")," for the language you are translating to from English. ",(0,i.kt)("br",null)),(0,i.kt)("h4",{id:"example-3"},"Example"),(0,i.kt)(o.Z,{mdxType:"ContainersKeyToggle"},(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{key:"placeholder key",translation:{region:"eastus",language:"ja"}}},mdxType:"DeepChatBrowser"})),(0,i.kt)(l.Z,{mdxType:"ComponentContainer"},(0,i.kt)(s.Z,{containerStyle:{borderRadius:"8px"},directConnection:{azure:{translation:{region:"eastus",language:"ja"}}},mdxType:"DeepChatBrowser"}))),(0,i.kt)(d.Z,{mdxType:"Tabs"},(0,i.kt)(p.Z,{value:"js",label:"Sample code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "translation": {"region": "eastus", "language": "ja"}\n    }\n  }\'\n></deep-chat>\n'))),(0,i.kt)(p.Z,{value:"py",label:"Full code",mdxType:"TabItem"},(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-html"},'\x3c!-- This example is for Vanilla JS and should be tailored to your framework (see Examples) --\x3e\n\n<deep-chat\n  directConnection=\'{\n    "azure": {\n      "key": "placeholder key",\n      "translation": {"region": "eastus", "language": "ja"}\n    }\n  }\'\n  containerStyle=\'{"borderRadius": "8px"}\'\n></deep-chat>\n')))),(0,i.kt)(u.Z,{mdxType:"LineBreak"}))}v.isMDXComponent=!0},4554:(e,t,n)=>{n.d(t,{Z:()=>a});const a="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAASwAAADpCAMAAACp8fr0AAAC+lBMVEVHcEwAiNUAhtoAjuAAi9kAiNUAjNgAgswAiNUAkOEAidcAiNUAitcAmvAAiNUAkeEAiNYAitoAk+UAjt0AidYAiNYAitgAj+AAkeIAiNQAic4Ah9oAidgAjNsAjt4AitcAkOAAh9UAidUAjNsAidUAiNUAhNYAhdIAitgAkeMAi9kAidYAkeEAiNUAiNUAi9oAkeQAiNYAiNQAh9QAjNsAidUAidQAi9oAj98AjdwAidYAidYAjNYAidcAiNUAitYAitYAh9UAi9oAkOIAh9UAiNUAidYAiNYAiNUAidcAkuMAidcAjd4Ai9oAjNwAitQAiNUAh9YAiNYAiNQAiNUAi9kAidUAitMAitcAitgAiNUAidcAlOgAiNUAidYAi9oAiNUAidUAj+EAjNoAidYAjNsAiNUAhdQAiNYAh9UAiNUAh9IAiNUAjd0AidYAiNYAi9gAidEAi9kAiNUAiNUAitkAhNUAiNUAiNYAkuQAidUAiNYAitIAiNUAiNUAidcAidcAiNIAitkAidUAiNUAjd0AidYAiNUAfs4AidcAidcAitkAh9UAidYAitgAidcAkuUAiNUAidcAiNYAhtMAjNkAitgAiNYAidgAi9oAjt0AjNwAitcAiNUAh9UAidYAiNYAi9kAidUAidUAidYAiNUAi9oAidQAidYAjNwAiNUAidcAidYAkN0AiNUAlOoAitkAidYAidgAiNQAi9oAiNUAiNUAitgAh9QAi9gAitgAi9sAidgAiNUAidYAitQAidYAjdsAiNYAidYAidcAiNYAi9oAidUAidYAiNMAjdwAidYAiNUAjNYAkecAiNUAiNQAitgAitYAiNUAh9QAiNUAidYAiNUAitcAiNUAiNQAh9UAidYAitcAidUAidYAidYAh9cAiNUAidYAidYAj98AiNUAitgAitYAiNUAi9kAj98AidYAiNUAiNUAiNYAiNUAidYAitkAiNUAidYAlusAi9oAitYAk+YAlekAj94Ajt4Ai9sAnfb449imAAAA/XRSTlMASxMBlKYGE6z/TirG/74CQt3//1dj8///xwkDg/3///9oEv//1w8jwv////9wPNf/4Blb64J++v//7iUNnJEfLzjS/6RT/Dd1+v+0///4R2GWtsG4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"}}]);