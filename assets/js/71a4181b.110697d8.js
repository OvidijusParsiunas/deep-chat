"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[4228,4184],{1262:(e,t,a)=>{a.d(t,{Z:()=>i});var o=a(7294),n=a(2389);function i(e){let{children:t,fallback:a}=e;return(0,n.Z)()?o.createElement(o.Fragment,null,t?.()):a??null}},6337:(e,t,a)=>{a.r(t),a.d(t,{default:()=>c});var o=a(2949),n=a(1262),i=a(7970),r=a(7294);function s(e,t){return{value:e,text:t?.[e]||e}}function c(e){let{options:t,defaultOption:a,onChange:c,passValueToChange:p,pseudoNames:m,isImages:g,modalRef:u}=e;const[h,f]=r.useState(null);r.useEffect((()=>{f(g?a:s(a,m))}),[a]);const x=g?t:(t||[]).map((e=>s(e,m))),v=e=>{void 0===p||p?c(e.value):(f(s(e.value,m)),c?.())},b=()=>{u?.current&&u.current.scrollHeight<=u.current.clientHeight&&(u.current.style.overflow="unset")},k=()=>{u?.current&&(u.current.style.overflow="auto")},y=e=>r.createElement("div",{className:"playground-service-modal-select-option",style:{paddingLeft:g?"6px":"4px"}},e.icon,""===e.text?r.createElement("span",{className:"playground-service-modal-select-empty-option"},"\xa0"):r.createElement("span",{style:{marginLeft:g?"6px":"",marginTop:"-1px"}},e.text));return r.createElement(n.Z,null,(()=>{const{colorMode:e}=(0,o.I)();return"dark"===e?r.createElement(i.ZP,{isSearchable:!1,value:h,className:"playground-select",styles:d,options:x,onChange:v,onMenuOpen:b,onMenuClose:k,getOptionLabel:y}):r.createElement(i.ZP,{isSearchable:!1,value:h,className:"playground-select",styles:l,options:x,onChange:v,onMenuOpen:b,onMenuClose:k,getOptionLabel:y})}))}const p={dropdownIndicator:e=>({...e,margin:"0px",padding:"0px"}),input:e=>({...e,margin:"0px",padding:"0px",pointerEvents:"none"}),valueContainer:e=>({...e,margin:"0px",padding:"0px"}),indicatorSeparator:e=>({...e,display:"none"})},l={...p,control:e=>({...e,width:"200px",padding:"0px",minHeight:"10px",border:"1px solid grey",fontSize:"15px",top:"1px",cursor:"pointer"}),menu:e=>({...e,width:"200px",marginTop:"5px"}),option:(e,t)=>{let{isSelected:a,isFocused:o}=t;return{...e,margin:"0px",padding:"0px",paddingTop:"1px",paddingBottom:"0.5px",cursor:"pointer",fontSize:"15px",backgroundColor:a?"#c9e2ff":o?"#e7f2ff":e.backgroundColor,color:a?"black":e.color}}},d={...p,singleValue:e=>({...e,color:"white"}),control:e=>({...e,width:"200px",padding:"0px",minHeight:"10px",border:"1px solid grey",fontSize:"15px",top:"1px",cursor:"pointer",backgroundColor:"#3b3b3b"}),menu:e=>({...e,width:"200px",marginTop:"5px",backgroundColor:"#3b3b3b"}),option:(e,t)=>{let{isSelected:a,isFocused:o}=t;return{...e,margin:"0px",padding:"0px",paddingTop:"1px",paddingBottom:"0.5px",cursor:"pointer",fontSize:"15px",backgroundColor:a?"#636363":o?"#727272":e.backgroundColor,color:a?"white":e.color,":active":{...e[":active"],backgroundColor:"#616061"}}}}},2675:(e,t,a)=>{a.r(t),a.d(t,{default:()=>r});var o=a(6337),n=a(7294);function i(e,t){return void 0===t&&(t=!0),"boolean"==typeof e?e:(e??="",e.charAt(0)[t?"toUpperCase":"toLowerCase"]()+e.slice(1))}function r(e){let{availableTypes:t,activeService:a,activeType:r,changeType:c,pseudoNames:p,modalRef:l}=e;return n.createElement("div",null,n.createElement("a",{href:"custom"===a?s[a]:s[a]?.[r],target:"_blank",className:"playground-service-modal-input-label"},"Type:"),n.createElement("div",null,n.createElement(o.default,{options:(t||[]).map((e=>i(e,!0))),defaultOption:i(r,!0),onChange:c,pseudoNames:p,modalRef:l})))}const s={demo:"https://deepchat.dev/docs/demo#demo",custom:"https://deepchat.dev/docs/connect",openAI:{chat:"https://platform.openai.com/docs/api-reference/chat",completions:"https://platform.openai.com/docs/api-reference/completions",images:"https://platform.openai.com/docs/api-reference/images",audio:"https://platform.openai.com/docs/api-reference/audio"},cohere:{chat:"https://docs.cohere.com/docs/conversational-ai",textGeneration:"https://docs.cohere.com/docs/intro-text-generation",summarization:"https://docs.cohere.com/docs/summarize"},huggingFace:{conversation:"https://huggingface.co/docs/api-inference/detailed_parameters#conversational-task",textGeneration:"https://huggingface.co/docs/api-inference/detailed_parameters#text-generation-task",summarization:"https://huggingface.co/docs/api-inference/detailed_parameters#summarization-task",translation:"https://huggingface.co/docs/api-inference/detailed_parameters#translation-task",fillMask:"https://huggingface.co/docs/api-inference/detailed_parameters#fill-mask-task",questionAnswer:"https://huggingface.co/docs/api-inference/detailed_parameters#question-answering-task",audioSpeechRecognition:"https://huggingface.co/docs/api-inference/detailed_parameters#automatic-speech-recognition-task",audioClassification:"https://huggingface.co/docs/api-inference/detailed_parameters#audio-classification-task",imageClassification:"https://huggingface.co/docs/api-inference/detailed_parameters#image-classification-task"},azure:{textToSpeech:"https://learn.microsoft.com/en-GB/azure/ai-services/speech-service/rest-text-to-speech?tabs=streaming#convert-text-to-speech",speechToText:"https://learn.microsoft.com/en-gb/azure/ai-services/speech-service/rest-speech-to-text",summarization:"https://learn.microsoft.com/en-us/azure/ai-services/language-service/summarization/overview?tabs=document-summarization",translation:"https://learn.microsoft.com/en-gb/azure/ai-services/translator/reference/v3-0-reference"},stabilityAI:{textToImage:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/textToImage",imageToImage:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/imageToImage",imageToImageMasking:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/masking",imageToImageUpscale:"https://platform.stability.ai/docs/api-reference#tag/v1generation/operation/upscaleImage"},assemblyAI:{audio:"https://www.assemblyai.com/docs/Models/speech_recognition"}}}}]);