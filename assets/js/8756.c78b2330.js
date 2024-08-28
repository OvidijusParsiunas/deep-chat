"use strict";(self.webpackChunkwebsite=self.webpackChunkwebsite||[]).push([[8756],{19365:(e,t,n)=>{n.d(t,{A:()=>o});n(96540);var i=n(34164);const s={tabItem:"tabItem_Ymn6"};var r=n(74848);function o(e){let{children:t,hidden:n,className:o}=e;return(0,r.jsx)("div",{role:"tabpanel",className:(0,i.A)(s.tabItem,o),hidden:n,children:t})}},11470:(e,t,n)=>{n.d(t,{A:()=>b});var i=n(96540),s=n(34164),r=n(23104),o=n(56347),a=n(205),l=n(57485),c=n(31682),u=n(70679);function d(e){return i.Children.toArray(e).filter((e=>"\n"!==e)).map((e=>{if(!e||(0,i.isValidElement)(e)&&function(e){const{props:t}=e;return!!t&&"object"==typeof t&&"value"in t}(e))return e;throw new Error(`Docusaurus error: Bad <Tabs> child <${"string"==typeof e.type?e.type:e.type.name}>: all children of the <Tabs> component should be <TabItem>, and every <TabItem> should have a unique "value" prop.`)}))?.filter(Boolean)??[]}function h(e){const{values:t,children:n}=e;return(0,i.useMemo)((()=>{const e=t??function(e){return d(e).map((e=>{let{props:{value:t,label:n,attributes:i,default:s}}=e;return{value:t,label:n,attributes:i,default:s}}))}(n);return function(e){const t=(0,c.X)(e,((e,t)=>e.value===t.value));if(t.length>0)throw new Error(`Docusaurus error: Duplicate values "${t.map((e=>e.value)).join(", ")}" found in <Tabs>. Every value needs to be unique.`)}(e),e}),[t,n])}function p(e){let{value:t,tabValues:n}=e;return n.some((e=>e.value===t))}function m(e){let{queryString:t=!1,groupId:n}=e;const s=(0,o.W6)(),r=function(e){let{queryString:t=!1,groupId:n}=e;if("string"==typeof t)return t;if(!1===t)return null;if(!0===t&&!n)throw new Error('Docusaurus error: The <Tabs> component groupId prop is required if queryString=true, because this value is used as the search param name. You can also provide an explicit value such as queryString="my-search-param".');return n??null}({queryString:t,groupId:n});return[(0,l.aZ)(r),(0,i.useCallback)((e=>{if(!r)return;const t=new URLSearchParams(s.location.search);t.set(r,e),s.replace({...s.location,search:t.toString()})}),[r,s])]}function v(e){const{defaultValue:t,queryString:n=!1,groupId:s}=e,r=h(e),[o,l]=(0,i.useState)((()=>function(e){let{defaultValue:t,tabValues:n}=e;if(0===n.length)throw new Error("Docusaurus error: the <Tabs> component requires at least one <TabItem> children component");if(t){if(!p({value:t,tabValues:n}))throw new Error(`Docusaurus error: The <Tabs> has a defaultValue "${t}" but none of its children has the corresponding value. Available values are: ${n.map((e=>e.value)).join(", ")}. If you intend to show no default tab, use defaultValue={null} instead.`);return t}const i=n.find((e=>e.default))??n[0];if(!i)throw new Error("Unexpected error: 0 tabValues");return i.value}({defaultValue:t,tabValues:r}))),[c,d]=m({queryString:n,groupId:s}),[v,g]=function(e){let{groupId:t}=e;const n=function(e){return e?`docusaurus.tab.${e}`:null}(t),[s,r]=(0,u.Dv)(n);return[s,(0,i.useCallback)((e=>{n&&r.set(e)}),[n,r])]}({groupId:s}),f=(()=>{const e=c??v;return p({value:e,tabValues:r})?e:null})();(0,a.A)((()=>{f&&l(f)}),[f]);return{selectedValue:o,selectValue:(0,i.useCallback)((e=>{if(!p({value:e,tabValues:r}))throw new Error(`Can't select invalid tab value=${e}`);l(e),d(e),g(e)}),[d,g,r]),tabValues:r}}var g=n(92303);const f={tabList:"tabList__CuJ",tabItem:"tabItem_LNqP"};var S=n(74848);function T(e){let{className:t,block:n,selectedValue:i,selectValue:o,tabValues:a}=e;const l=[],{blockElementScrollPositionUntilNextRender:c}=(0,r.a_)(),u=e=>{const t=e.currentTarget,n=l.indexOf(t),s=a[n].value;s!==i&&(c(t),o(s))},d=e=>{let t=null;switch(e.key){case"Enter":u(e);break;case"ArrowRight":{const n=l.indexOf(e.currentTarget)+1;t=l[n]??l[0];break}case"ArrowLeft":{const n=l.indexOf(e.currentTarget)-1;t=l[n]??l[l.length-1];break}}t?.focus()};return(0,S.jsx)("ul",{role:"tablist","aria-orientation":"horizontal",className:(0,s.A)("tabs",{"tabs--block":n},t),children:a.map((e=>{let{value:t,label:n,attributes:r}=e;return(0,S.jsx)("li",{role:"tab",tabIndex:i===t?0:-1,"aria-selected":i===t,ref:e=>l.push(e),onKeyDown:d,onClick:u,...r,className:(0,s.A)("tabs__item",f.tabItem,r?.className,{"tabs__item--active":i===t}),children:n??t},t)}))})}function E(e){let{lazy:t,children:n,selectedValue:s}=e;const r=(Array.isArray(n)?n:[n]).filter(Boolean);if(t){const e=r.find((e=>e.props.value===s));return e?(0,i.cloneElement)(e,{className:"margin-top--md"}):null}return(0,S.jsx)("div",{className:"margin-top--md",children:r.map(((e,t)=>(0,i.cloneElement)(e,{key:t,hidden:e.props.value!==s})))})}function _(e){const t=v(e);return(0,S.jsxs)("div",{className:(0,s.A)("tabs-container",f.tabList),children:[(0,S.jsx)(T,{...t,...e}),(0,S.jsx)(E,{...t,...e})]})}function b(e){const t=(0,g.A)();return(0,S.jsx)(_,{...e,children:d(e.children)},String(t))}},93700:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.README_URL=void 0,t.README_URL="https://github.com/OvidijusParsiunas/speech-to-element"},43603:(e,t,n)=>{const i=n(45975),s=n(57343),r=n(32005),o=n(21703);class a{static toggle(e,t){var n,i;const s=e.toLocaleLowerCase().trim();(null===(n=r.GlobalState.service)||void 0===n?void 0:n.recognizing)?this.stop():"webspeech"===s?a.startWebSpeech(t):"azure"===s?a.startAzure(t):(console.error("service not found - must be either 'webspeech' or 'azure'"),null===(i=null==t?void 0:t.onError)||void 0===i||i.call(t,"service not found - must be either 'webspeech' or 'azure'"))}static startWebSpeech(e){a.stop()||(r.GlobalState.service=new i.WebSpeech,r.GlobalState.service.start(e))}static isWebSpeechSupported(){return!!i.WebSpeech.getAPI()}static startAzure(e){var t;a.stop()||(null===(t=r.GlobalState.service)||void 0===t?void 0:t.cannotBeStopped)||(r.GlobalState.service=new o.Azure,r.GlobalState.service.start(e))}static stop(){var e;return!!r.GlobalState.doubleClickDetector()||((null===(e=r.GlobalState.service)||void 0===e?void 0:e.recognizing)&&r.GlobalState.service.stop(),!1)}static endCommandMode(){r.GlobalState.service&&s.CommandUtils.toggleCommandModeOff(r.GlobalState.service)}}t.A=a},21703:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Azure=void 0;const i=n(75258),s=n(83703),r=n(79370),o=n(32933),a=n(60913);class l extends a.Speech{constructor(){super(...arguments),this._newTextPadding=""}start(e,t){this._newTextPadding="",void 0===this.stopTimeout&&r.StopTimeout.reset(this,null==e?void 0:e.stopAfterSilenceMs),this.prepareBeforeStart(e),this.startAsync(e),t||i.PreventConnectionStop.applyPrevention(this)}async startAsync(e){var t;this.validate(e)&&(await this.instantiateService(e),this._translations=null==e?void 0:e.translations,null===(t=this._service)||void 0===t||t.startContinuousRecognitionAsync((()=>{}),this.error))}validate(e){return l.getAPI()?s.AzureSpeechConfig.validateOptions(this.error.bind(this),e):(this.moduleNotFound(),!1)}async instantiateService(e){const t=l.getAPI(),n=t.AudioConfig.fromDefaultMicrophoneInput(),i=await s.AzureSpeechConfig.get(t.SpeechConfig,e);if(i){const s=new t.SpeechRecognizer(i,n);this.setEvents(s),this._service=s,e.retrieveToken&&this.retrieveTokenInterval(e.retrieveToken)}else this.error("Unable to contact Azure server")}setEvents(e){e.recognizing=this.onRecognizing.bind(this),e.recognized=this.onRecognized.bind(this),e.sessionStarted=this.onSessionStarted.bind(this),e.canceled=this.onCanceled.bind(this),e.sessionStopped=this.onSessionStopped.bind(this)}onRecognizing(e,t){if(this._stopping)return;const{interimTranscript:n,finalTranscript:i,newText:s}=o.AzureTranscript.extract(this._newTextPadding+t.result.text,this.finalTranscript,!1,this._translations);r.StopTimeout.reset(this,this.stopTimeoutMS),this.updateElements(n,i,s)}onRecognized(e,t){const n=t.result;switch(n.reason){case window.SpeechSDK.ResultReason.Canceled:break;case window.SpeechSDK.ResultReason.RecognizedSpeech:if(n.text&&!this._stopping){const{interimTranscript:e,finalTranscript:t,newText:i}=o.AzureTranscript.extract(this._newTextPadding+n.text,this.finalTranscript,!0,this._translations);r.StopTimeout.reset(this,this.stopTimeoutMS),this.updateElements(e,t,i),""!==t&&(this._newTextPadding=" ")}}}onCanceled(e,t){t.reason===window.SpeechSDK.CancellationReason.Error&&this.error(t.errorDetails)}onSessionStarted(){i.PreventConnectionStop.clearPrevention(this),this.setStateOnStart()}onSessionStopped(){this._retrieveTokenInterval||clearInterval(this._retrieveTokenInterval),this._stopping=!1,this.setStateOnStop()}retrieveTokenInterval(e){this._retrieveTokenInterval=setInterval((()=>{null==e||e().then((e=>{this._service&&(this._service.authorizationToken=(null==e?void 0:e.trim())||"")})).catch((e=>{this.error(e)}))}),1e4)}stop(e){var t;!e&&this._retrieveTokenInterval&&clearInterval(this._retrieveTokenInterval),this._stopping=!0,null===(t=this._service)||void 0===t||t.stopContinuousRecognitionAsync(),this.finalise(e)}static getAPI(){return window.SpeechSDK}moduleNotFound(){console.error("speech recognition module not found:"),console.error("please install the 'microsoft-cognitiveservices-speech-sdk' npm package or add a script tag: <script src=\"https://aka.ms/csspeech/jsbrowserpackageraw\"><\/script>"),this.setStateOnError("speech recognition module not found")}error(e){this._retrieveTokenInterval&&clearInterval(this._retrieveTokenInterval),console.error(e),this.setStateOnError(e),this.stop()}}t.Azure=l},83703:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AzureSpeechConfig=void 0;const i=n(93700);class s{static validateOptions(e,t){return t?t.subscriptionKey||t.token||t.retrieveToken?!!t.region||(e(`Please define a 'region' property - more info: ${i.README_URL}`),!1):(e(`Please define a 'subscriptionKey', 'token' or 'retrieveToken' property - more info: ${i.README_URL}`),!1):(e(`Please provide subscription details - more info: ${i.README_URL}`),!1)}static async getNewSpeechConfig(e,t){if(t.region)return t.subscriptionKey?e.fromSubscription(t.subscriptionKey.trim(),t.region.trim()):t.token?e.fromAuthorizationToken(t.token.trim(),t.region.trim()):t.retrieveToken?t.retrieveToken().then((n=>t.region?e.fromAuthorizationToken((null==n?void 0:n.trim())||"",t.region.trim()):null)).catch((e=>(console.error(e),null))):null}static process(e,t){t.language&&(e.speechRecognitionLanguage=t.language.trim())}static async get(e,t){const n=await s.getNewSpeechConfig(e,t);return n&&s.process(n,t),n}}t.AzureSpeechConfig=s},32933:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AzureTranscript=void 0;const i=n(19851);t.AzureTranscript=class{static extract(e,t,n,s){return s&&(e=i.Translate.translate(e,s)),n?{interimTranscript:"",finalTranscript:t+e,newText:e}:{interimTranscript:e,finalTranscript:t,newText:e}}}},75258:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.PreventConnectionStop=void 0;t.PreventConnectionStop=class{static applyPrevention(e){clearTimeout(e._manualConnectionStopPrevention),e.cannotBeStopped=!0,e._manualConnectionStopPrevention=setTimeout((()=>{e.cannotBeStopped=!1}),800)}static clearPrevention(e){clearTimeout(e._manualConnectionStopPrevention),e.cannotBeStopped=!1}}},45975:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.WebSpeech=void 0;const i=n(31541),s=n(60845),r=n(60913);class o extends r.Speech{constructor(){super()}start(e){var t;void 0===this._extractText&&(this._extractText=s.Browser.IS_SAFARI()?i.WebSpeechTranscript.extractSafari:i.WebSpeechTranscript.extract),this.validate()&&(this.prepareBeforeStart(e),this.instantiateService(e),null===(t=this._service)||void 0===t||t.start(),this._translations=null==e?void 0:e.translations)}validate(){return!!o.getAPI()||(this.error("Speech Recognition is unsupported"),!1)}instantiateService(e){var t,n;const i=o.getAPI();this._service=new i,this._service.continuous=!0,this._service.interimResults=null===(t=null==e?void 0:e.displayInterimResults)||void 0===t||t,this._service.lang=(null===(n=null==e?void 0:e.language)||void 0===n?void 0:n.trim())||"en-US",this.setEvents()}setEvents(){this._service&&(this._service.onstart=()=>{this.setStateOnStart()},this._service.onerror=e=>{s.Browser.IS_SAFARI()&&"Another request is started"===e.message||"aborted"===e.error&&this.isRestarting||"no-speech"!==e.error&&this.error(e.message||e.error)},this._service.onaudioend=()=>{this.setStateOnStop()},this._service.onend=()=>{this._stopping=!1},this._service.onresult=e=>{if(void 0===e.results&&this._service)this._service.onend=null,this._service.stop();else if(this._extractText&&!this._stopping){const{interimTranscript:t,finalTranscript:n,newText:i}=this._extractText(e,this.finalTranscript,this._translations);this.updateElements(t,n,i)}})}stop(e){var t;this._stopping=!0,null===(t=this._service)||void 0===t||t.stop(),this.finalise(e)}static getAPI(){return window.webkitSpeechRecognition||window.SpeechRecognition}error(e){console.error(e),this.setStateOnError(e),this.stop()}}t.WebSpeech=o},31541:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.WebSpeechTranscript=void 0;const i=n(19851);t.WebSpeechTranscript=class{static extract(e,t,n){let s="";for(let r=e.resultIndex;r<e.results.length;++r){let o=e.results[r][0].transcript;n&&(o=i.Translate.translate(o,n)),e.results[r].isFinal?t+=o:s+=o}return{interimTranscript:s,finalTranscript:t,newText:s||t}}static extractSafari(e,t,n){let s="";for(let r=e.resultIndex;r<e.results.length;++r){let t=e.results[r][0].transcript;n&&(t=i.Translate.translate(t,n)),s+=t}return{interimTranscript:"",finalTranscript:s,newText:s}}}},60913:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Speech=void 0;const i=n(26036),s=n(97192),r=n(57343),o=n(88903),a=n(25093),l=n(51036),c=n(65356),u=n(60845),d=n(59051),h=n(56977);t.Speech=class{constructor(){this.finalTranscript="",this.interimSpan=l.Elements.createInterimSpan(),this.finalSpan=l.Elements.createGenericSpan(),this.scrollingSpan=l.Elements.createGenericSpan(),this.isCursorAtEnd=!1,this.spansPopulated=!1,this.startPadding="",this.endPadding="",this.numberOfSpacesBeforeNewText=0,this.numberOfSpacesAfterNewText=0,this.isHighlighted=!1,this.primitiveTextRecorded=!1,this.recognizing=!1,this._displayInterimResults=!0,this.insertInCursorLocation=!0,this.autoScroll=!0,this.isRestarting=!1,this.isPaused=!1,this.isWaitingForCommand=!1,this.isTargetInShadow=!1,this.cannotBeStopped=!1,this.resetState()}prepareBeforeStart(e){var t,n;if(null==e?void 0:e.element)if(i.EventListeners.add(this,e),Array.isArray(e.element)){const t=e.element.find((e=>e===document.activeElement))||e.element[0];if(!t)return;this.prepare(t)}else this.prepare(e.element);void 0!==(null==e?void 0:e.displayInterimResults)&&(this._displayInterimResults=e.displayInterimResults),(null==e?void 0:e.textColor)&&(this._finalTextColor=null===(t=null==e?void 0:e.textColor)||void 0===t?void 0:t.final,l.Elements.applyCustomColors(this,e.textColor)),void 0!==(null==e?void 0:e.insertInCursorLocation)&&(this.insertInCursorLocation=e.insertInCursorLocation),void 0!==(null==e?void 0:e.autoScroll)&&(this.autoScroll=e.autoScroll),this._onResult=null==e?void 0:e.onResult,this._onPreResult=null==e?void 0:e.onPreResult,this._onStart=null==e?void 0:e.onStart,this._onStop=null==e?void 0:e.onStop,this._onError=null==e?void 0:e.onError,this.onCommandModeTrigger=null==e?void 0:e.onCommandModeTrigger,this.onPauseTrigger=null==e?void 0:e.onPauseTrigger,this._options=e,(null===(n=this._options)||void 0===n?void 0:n.commands)&&(this.commands=r.CommandUtils.process(this._options.commands))}prepare(e){c.Padding.setState(this,e),a.Highlight.setState(this,e),this.isTargetInShadow=l.Elements.isInsideShadowDOM(e),l.Elements.isPrimitiveElement(e)?(this._primitiveElement=e,this._originalText=this._primitiveElement.value):(this._genericElement=e,this._originalText=this._genericElement.textContent)}resetRecording(e){this.isRestarting=!0,this.stop(!0),this.resetState(!0),this.start(e,!0)}updateElements(e,t,n){var i;const o=h.Text.capitalize(t);if(this.finalTranscript===o&&""===e)return;s.PreResultUtils.process(this,n,""===e,this._onPreResult,this._options)&&(e="",n="");const a=this.commands&&r.CommandUtils.execCommand(this,n,this._options,this._primitiveElement||this._genericElement,this._originalText);if(a){if(a.doNotProcessTranscription)return;e="",n=""}if(this.isPaused||this.isWaitingForCommand)return;null===(i=this._onResult)||void 0===i||i.call(this,n,""===e),this.finalTranscript=o,this._displayInterimResults||(e="");const l=""===this.finalTranscript&&""===e;this._primitiveElement?this.updatePrimitiveElement(this._primitiveElement,e,l):this._genericElement&&this.updateGenericElement(this._genericElement,e,l)}updatePrimitiveElement(e,t,n){this.isHighlighted&&a.Highlight.removeForPrimitive(this,e),this.primitiveTextRecorded||c.Padding.adjustStateAfterRecodingPrimitiveElement(this,e),n&&c.Padding.adjustSateForNoTextPrimitiveElement(this);const i=this.startPadding+this.finalTranscript+t;if(e.value=i+this.endPadding,!this.isTargetInShadow){const t=i.length+this.numberOfSpacesAfterNewText;d.Cursor.setOffsetForPrimitive(e,t,this.autoScroll)}this.autoScroll&&u.Browser.IS_SAFARI()&&this.isCursorAtEnd&&o.AutoScroll.scrollSafariPrimitiveToEnd(e)}updateGenericElement(e,t,n){this.isHighlighted&&a.Highlight.removeForGeneric(this,e),this.spansPopulated||l.Elements.appendSpans(this,e);const i=(n?"":this.startPadding)+h.Text.lineBreak(this.finalTranscript);this.finalSpan.innerHTML=i;const s=o.AutoScroll.isRequired(this.autoScroll,e);o.AutoScroll.changeStateIfNeeded(this,s);const r=h.Text.lineBreak(t)+(n?"":this.endPadding);this.interimSpan.innerHTML=r,u.Browser.IS_SAFARI()&&this.insertInCursorLocation&&d.Cursor.setOffsetForSafariGeneric(e,i.length+r.length),s&&o.AutoScroll.scrollGeneric(this,e),n&&(this.scrollingSpan.innerHTML="")}finalise(e){this._genericElement&&(e?(this.finalSpan=l.Elements.createGenericSpan(),this.setInterimColorToFinal(),this.interimSpan=l.Elements.createInterimSpan(),this.scrollingSpan=l.Elements.createGenericSpan()):this._genericElement.textContent=this._genericElement.textContent,this.spansPopulated=!1),i.EventListeners.remove(this)}setInterimColorToFinal(){this.interimSpan.style.color=this._finalTextColor||"black"}resetState(e){this._primitiveElement=void 0,this._genericElement=void 0,this.finalTranscript="",this.finalSpan.innerHTML="",this.interimSpan.innerHTML="",this.scrollingSpan.innerHTML="",this.startPadding="",this.endPadding="",this.isHighlighted=!1,this.primitiveTextRecorded=!1,this.numberOfSpacesBeforeNewText=0,this.numberOfSpacesAfterNewText=0,e||(this.stopTimeout=void 0)}setStateOnStart(){var e;this.recognizing=!0,this.isRestarting?this.isRestarting=!1:null===(e=this._onStart)||void 0===e||e.call(this)}setStateOnStop(){var e;this.recognizing=!1,this.isRestarting||null===(e=this._onStop)||void 0===e||e.call(this)}setStateOnError(e){var t;null===(t=this._onError)||void 0===t||t.call(this,e),this.recognizing=!1}}},88903:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.AutoScroll=void 0;class n{static changeStateIfNeeded(e,t){t&&!e.isCursorAtEnd&&(e.endPadding="",e.scrollingSpan.innerHTML="&nbsp;")}static scrollGeneric(e,t){e.isCursorAtEnd?t.scrollTop=t.scrollHeight:e.scrollingSpan.scrollIntoView({block:"nearest"})}static scrollSafariPrimitiveToEnd(e){e.scrollLeft=e.scrollWidth,e.scrollTop=e.scrollHeight}static isElementOverflown(e){return e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth}static isRequired(e,t){return e&&n.isElementOverflown(t)}}t.AutoScroll=n},60845:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Browser=void 0;class n{}t.Browser=n,n.IS_SAFARI=()=>(void 0===n._IS_SAFARI&&(n._IS_SAFARI=/^((?!chrome|android).)*safari/i.test(navigator.userAgent)),n._IS_SAFARI)},57343:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.CommandUtils=void 0;const i=n(88903),s=n(51036),r=n(60845),o=n(59051),a=n(56977);class l{static processCommand(e,t){return t&&t.caseSensitive||(e=e.toLowerCase()),!1===(null==t?void 0:t.substrings)?a.Text.breakupIntoWordsArr(e):e}static process(e){var t;if(!0===(null===(t=e.settings)||void 0===t?void 0:t.caseSensitive))return e;return Object.keys(e).reduce(((t,n)=>{const i=e[n];return t[n]="string"==typeof i?l.processCommand(i,e.settings):i,t}),{})}static toggleCommandModeOn(e){var t;e.isWaitingForCommand=!0,null===(t=e.onCommandModeTrigger)||void 0===t||t.call(e,!0)}static toggleCommandModeOff(e){var t;e.isWaitingForCommand&&(null===(t=e.onCommandModeTrigger)||void 0===t||t.call(e,!1),e.isWaitingForCommand=!1)}static setText(e,t,n,a){l.toggleCommandModeOff(e),s.Elements.isPrimitiveElement(a)?(a.value=n,e.isTargetInShadow||o.Cursor.setOffsetForPrimitive(a,n.length,!0),r.Browser.IS_SAFARI()&&e.autoScroll&&i.AutoScroll.scrollSafariPrimitiveToEnd(a)):(a.textContent=n,e.isTargetInShadow||o.Cursor.focusEndOfGeneric(a),setTimeout((()=>i.AutoScroll.scrollGeneric(e,a)))),e.resetRecording(t)}static checkIfMatchesSubstring(e,t){return t.includes(e)}static checkIfMatchesWord(e,t,n){const i=e;for(let s=n.length-1;s>=0;s-=1){let e=s,t=i.length-1;for(;n[e]===i[t]&&t>=0;)e-=1,t-=1;if(t<0)return!0}return!1}static execCommand(e,t,n,i,s){var r,o,c;const u=e.commands;if(!u||!i||!n)return;const d=!0===(null===(r=u.settings)||void 0===r?void 0:r.caseSensitive)?t:t.toLowerCase(),h=a.Text.breakupIntoWordsArr(d),p=!1===(null===(o=u.settings)||void 0===o?void 0:o.substrings)?l.checkIfMatchesWord:l.checkIfMatchesSubstring;return u.commandMode&&p(u.commandMode,d,h)?(e.setInterimColorToFinal(),setTimeout((()=>l.toggleCommandModeOn(e))),{doNotProcessTranscription:!1}):!u.commandMode||e.isWaitingForCommand?u.stop&&p(u.stop,d,h)?(l.toggleCommandModeOff(e),setTimeout((()=>e.stop())),{doNotProcessTranscription:!1}):u.pause&&p(u.pause,d,h)?(l.toggleCommandModeOff(e),e.setInterimColorToFinal(),setTimeout((()=>{var t;e.isPaused=!0,null===(t=e.onPauseTrigger)||void 0===t||t.call(e,!0)})),{doNotProcessTranscription:!1}):u.resume&&p(u.resume,d,h)?(e.isPaused=!1,null===(c=e.onPauseTrigger)||void 0===c||c.call(e,!1),l.toggleCommandModeOff(e),e.resetRecording(n),{doNotProcessTranscription:!0}):u.reset&&p(u.reset,d,h)?(void 0!==s&&l.setText(e,n,s,i),{doNotProcessTranscription:!0}):u.removeAllText&&p(u.removeAllText,d,h)?(l.setText(e,n,"",i),{doNotProcessTranscription:!0}):void 0:void 0}}t.CommandUtils=l},59051:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Cursor=void 0;class n{static setOffsetForGeneric(e,t,i=0){let s=0;for(let r=0;r<e.childNodes.length;r+=1){const o=e.childNodes[r];if(o.childNodes.length>0){const e=n.setOffsetForGeneric(o,t,i);if(-1===e)return-1;i+=e}else if(null!==o.textContent){if(i+o.textContent.length>t){const n=document.createRange();n.setStart(o,t-i),n.collapse(!0);const s=window.getSelection();return null==s||s.removeAllRanges(),null==s||s.addRange(n),e.focus(),-1}i+=o.textContent.length,s+=o.textContent.length}}return s}static focusEndOfGeneric(e){const t=document.createRange();t.selectNodeContents(e),t.collapse(!1);const n=window.getSelection();n&&(n.removeAllRanges(),n.addRange(t))}static setOffsetForSafariGeneric(e,t){const i=window.getSelection();if(i){const s=n.getGenericElementCursorOffset(e,i,!0);console.log(s),setTimeout((()=>{}),100),n.setOffsetForGeneric(e,s+t)}}static setOffsetForPrimitive(e,t,n){n&&e.blur(),e.setSelectionRange(t,t),e.focus()}static getGenericElementCursorOffset(e,t,n){let i=0;if(t.rangeCount>0){const s=t.getRangeAt(0),r=s.cloneRange();r.selectNodeContents(e),n?r.setEnd(s.startContainer,s.startOffset):r.setEnd(s.endContainer,s.endOffset),i=r.toString().length}return i}}t.Cursor=n},51036:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Elements=void 0;t.Elements=class{static isPrimitiveElement(e){return"INPUT"===e.tagName||"TEXTAREA"===e.tagName}static createInterimSpan(){const e=document.createElement("span");return e.style.color="grey",e.style.pointerEvents="none",e}static createGenericSpan(){const e=document.createElement("span");return e.style.pointerEvents="none",e}static appendSpans(e,t){if(e.spansPopulated=!0,e.insertInCursorLocation&&document.activeElement===t){const t=window.getSelection();if(null==t?void 0:t.focusNode){const n=t.getRangeAt(0);return n.insertNode(e.scrollingSpan),n.insertNode(e.interimSpan),n.insertNode(e.finalSpan),n.collapse(!1),t.removeAllRanges(),void t.addRange(n)}}t.appendChild(e.finalSpan),t.appendChild(e.interimSpan),t.appendChild(e.scrollingSpan)}static applyCustomColors(e,t){t.interim&&(e.interimSpan.style.color=t.interim),t.final&&(e.finalSpan.style.color=t.final)}static isInsideShadowDOM(e){return e.getRootNode()instanceof ShadowRoot}}},26036:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.EventListeners=void 0;class n{static getElementIfFocusedOnAvailable(e,t){return Array.isArray(e)?e.find((e=>t===e)):t===e?e:void 0}static keyDownWindow(e){e.element&&n.getElementIfFocusedOnAvailable(e.element,document.activeElement)&&(null!==n.KEY_DOWN_TIMEOUT&&clearTimeout(n.KEY_DOWN_TIMEOUT),n.KEY_DOWN_TIMEOUT=setTimeout((()=>{n.KEY_DOWN_TIMEOUT=null,this.resetRecording(e)}),500))}static mouseDownWindow(e,t){this.mouseDownElement=n.getElementIfFocusedOnAvailable(e,t.target)}static mouseUpWindow(e){this.mouseDownElement&&this.resetRecording(e),this.mouseDownElement=void 0}static add(e,t){const i=void 0===(null==t?void 0:t.insertInCursorLocation)||(null==t?void 0:t.insertInCursorLocation);(null==t?void 0:t.element)&&i&&(e.mouseDownEvent=n.mouseDownWindow.bind(e,t.element),document.addEventListener("mousedown",e.mouseDownEvent),e.mouseUpEvent=n.mouseUpWindow.bind(e,t),document.addEventListener("mouseup",e.mouseUpEvent),e.keyDownEvent=n.keyDownWindow.bind(e,t),document.addEventListener("keydown",e.keyDownEvent))}static remove(e){document.removeEventListener("mousedown",e.mouseDownEvent),document.removeEventListener("mouseup",e.mouseUpEvent),document.removeEventListener("keydown",e.keyDownEvent)}}t.EventListeners=n,n.KEY_DOWN_TIMEOUT=null},32005:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.GlobalState=void 0;class n{static doubleClickDetector(){return!!n.doubleClickPending||(n.doubleClickPending=!0,setTimeout((()=>{n.doubleClickPending=!1}),300),!1)}}t.GlobalState=n,n.doubleClickPending=!1},25093:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Highlight=void 0;const i=n(51036),s=n(59051);class r{static setStateForPrimitive(e,t){let n,i;null!==t.selectionStart&&(n=t.selectionStart),null!==t.selectionEnd&&(i=t.selectionEnd),e.isHighlighted=n!==i}static setStateForGeneric(e,t){const n=window.getSelection();if(null==n?void 0:n.focusNode){const i=s.Cursor.getGenericElementCursorOffset(t,n,!0),r=s.Cursor.getGenericElementCursorOffset(t,n,!1);e.isHighlighted=i!==r}}static setState(e,t){document.activeElement===t&&(i.Elements.isPrimitiveElement(t)?r.setStateForPrimitive(e,t):r.setStateForGeneric(e,t))}static removeForGeneric(e,t){const n=window.getSelection();if(n){const i=s.Cursor.getGenericElementCursorOffset(t,n,!0);n.deleteFromDocument(),s.Cursor.setOffsetForGeneric(t,i),e.isHighlighted=!1}}static removeForPrimitive(e,t){const n=t.selectionStart,i=t.selectionEnd,r=t.value;if(n&&i){const o=r.substring(0,n)+r.substring(i);t.value=o,s.Cursor.setOffsetForPrimitive(t,n,e.autoScroll)}e.isHighlighted=!1}}t.Highlight=r},65356:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Padding=void 0;const i=n(51036),s=n(59051),r=n(56977);class o{static setStateForPrimitiveElement(e,t){if(document.activeElement===t&&null!==t.selectionStart){const n=t.selectionStart,i=t.value[n-1],s=null===t.selectionEnd?n:t.selectionEnd,o=t.value[s];return r.Text.isCharDefined(i)&&(e.startPadding=" ",e.numberOfSpacesBeforeNewText=1),r.Text.isCharDefined(o)&&(e.endPadding=" ",e.numberOfSpacesAfterNewText=1),void(e.isCursorAtEnd=t.value.length===s)}const n=t.value[t.value.length-1];r.Text.isCharDefined(n)&&(e.startPadding=" ",e.numberOfSpacesBeforeNewText=1),e.isCursorAtEnd=!0}static setStateForGenericElement(e,t){var n,i,o;if(document.activeElement===t){const a=window.getSelection();if(null==a?void 0:a.focusNode){const l=s.Cursor.getGenericElementCursorOffset(t,a,!0),c=null===(n=t.textContent)||void 0===n?void 0:n[l-1],u=s.Cursor.getGenericElementCursorOffset(t,a,!1),d=null===(i=t.textContent)||void 0===i?void 0:i[u];return r.Text.isCharDefined(c)&&(e.startPadding=" "),r.Text.isCharDefined(d)&&(e.endPadding=" "),void(e.isCursorAtEnd=(null===(o=t.textContent)||void 0===o?void 0:o.length)===u)}}const a=t.innerText.charAt(t.innerText.length-1);r.Text.isCharDefined(a)&&(e.startPadding=" "),e.isCursorAtEnd=!0}static setState(e,t){i.Elements.isPrimitiveElement(t)?o.setStateForPrimitiveElement(e,t):o.setStateForGenericElement(e,t)}static adjustStateAfterRecodingPrimitiveElement(e,t){e.primitiveTextRecorded=!0,e.insertInCursorLocation&&document.activeElement===t&&(null!==t.selectionEnd&&(e.endPadding=e.endPadding+t.value.slice(t.selectionEnd)),null!==t.selectionStart)?e.startPadding=t.value.slice(0,t.selectionStart)+e.startPadding:e.startPadding=t.value+e.startPadding}static adjustSateForNoTextPrimitiveElement(e){1===e.numberOfSpacesBeforeNewText&&(e.startPadding=e.startPadding.substring(0,e.startPadding.length-1),e.numberOfSpacesBeforeNewText=0),1===e.numberOfSpacesAfterNewText&&(e.endPadding=e.endPadding.substring(1),e.numberOfSpacesAfterNewText=0)}}t.Padding=o},97192:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.PreResultUtils=void 0;t.PreResultUtils=class{static process(e,t,n,i,s){const r=null==i?void 0:i(t,n);return!!r&&(setTimeout((()=>{r.restart?e.resetRecording(s):r.stop&&e.stop()})),(r.stop||r.restart)&&r.removeNewText)}}},79370:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.StopTimeout=void 0;class n{static set(e){e.stopTimeout=setTimeout((()=>e.stop()),e.stopTimeoutMS)}static reset(e,t){e.stopTimeoutMS=t||n.DEFAULT_MS,e.stopTimeout&&clearTimeout(e.stopTimeout),n.set(e)}}t.StopTimeout=n,n.DEFAULT_MS=2e4},56977:(e,t)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Text=void 0;class n{static capitalize(e){return e.replace(n.FIRST_CHAR_REGEX,(e=>e.toUpperCase()))}static lineBreak(e){return e.replace(n.DOUBLE_LINE,"<p></p>").replace(n.ONE_LINE,"<br>")}static isCharDefined(e){return void 0!==e&&"\xa0"!==e&&" "!==e&&"\n"!==e&&""!==e}static breakupIntoWordsArr(e){return e.split(/(\W+)/)}}t.Text=n,n.FIRST_CHAR_REGEX=/\S/,n.DOUBLE_LINE=/\n\n/g,n.ONE_LINE=/\n/g},19851:(e,t,n)=>{Object.defineProperty(t,"__esModule",{value:!0}),t.Translate=void 0;const i=n(56977);t.Translate=class{static translate(e,t){const n=i.Text.breakupIntoWordsArr(e);for(let i=0;i<n.length;i+=1)t[n[i]]&&(n[i]=t[n[i]]);return n.join("")}}},28453:(e,t,n)=>{n.d(t,{R:()=>o,x:()=>a});var i=n(96540);const s={},r=i.createContext(s);function o(e){const t=i.useContext(r);return i.useMemo((function(){return"function"==typeof e?e(t):{...t,...e}}),[t,e])}function a(e){let t;return t=e.disableParentContext?"function"==typeof e.components?e.components(s):e.components||s:o(e.components),i.createElement(r.Provider,{value:t},e.children)}}}]);