(self.webpackChunk_3_l_1_b=self.webpackChunk_3_l_1_b||[]).push([[552],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return u},kt:function(){return d}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function l(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function i(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?l(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):l(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function a(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},l=Object.keys(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var l=Object.getOwnPropertySymbols(e);for(r=0;r<l.length;r++)n=l[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var s=r.createContext({}),p=function(e){var t=r.useContext(s),n=t;return e&&(n="function"==typeof e?e(t):i(i({},t),e)),n},u=function(e){var t=p(e.components);return r.createElement(s.Provider,{value:t},e.children)},c={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},f=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,l=e.originalType,s=e.parentName,u=a(e,["components","mdxType","originalType","parentName"]),f=p(n),d=o,m=f["".concat(s,".").concat(d)]||f[d]||c[d]||l;return n?r.createElement(m,i(i({ref:t},u),{},{components:n})):r.createElement(m,i({ref:t},u))}));function d(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var l=n.length,i=new Array(l);i[0]=f;var a={};for(var s in t)hasOwnProperty.call(t,s)&&(a[s]=t[s]);a.originalType=e,a.mdxType="string"==typeof e?e:o,i[1]=a;for(var p=2;p<l;p++)i[p]=n[p];return r.createElement.apply(null,i)}return r.createElement.apply(null,n)}f.displayName="MDXCreateElement"},1714:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return i},metadata:function(){return a},toc:function(){return s},default:function(){return u}});var r=n(2122),o=n(9756),l=(n(7294),n(3905)),i={},a={unversionedId:"Functions/stopAll",id:"Functions/stopAll",isDocsHomePage:!1,title:"stopAll()",description:"stopAll()",source:"@site/docs/Functions/stopAll.md",sourceDirName:"Functions",slug:"/Functions/stopAll",permalink:"/3L1B/docs/Functions/stopAll",editUrl:"https://github.com/hapiel/3L1B/edit/master/docusaurus/docs/Functions/stopAll.md",version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"stop()",permalink:"/3L1B/docs/Functions/stop"},next:{title:"update()",permalink:"/3L1B/docs/Functions/update"}},s=[],p={toc:s};function u(e){var t=e.components,n=(0,o.Z)(e,["components"]);return(0,l.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,l.kt)("p",null,(0,l.kt)("inlineCode",{parentName:"p"},"stopAll()")),(0,l.kt)("p",null,"This function stops all leds from blinking. It works the same as ",(0,l.kt)("a",{parentName:"p",href:"stop"},"stop()")," but for all leds at once."),(0,l.kt)("p",null,"Stopping a led does not turn the led off, it stays in the state it was when stopped."),(0,l.kt)("p",null,"Example usage:"),(0,l.kt)("pre",null,(0,l.kt)("code",{parentName:"pre",className:"language-cpp"},"void loop() {\n  \n  // if the button has been pressed\n  if (tlob.buttonPressed()){\n    // blink all leds, 500ms on and 100ms off\n    tlob.blinkAll(500, 100);\n  }\n  \n  // if the button is held down for 1 second\n  if (tlob.buttonHold > 1000) {\n    // stop blinking all leds\n    tlob.stopAll();\n  }\n\n  // update the button and the blinking\n  tlob.update();\n}\n")))}u.isMDXComponent=!0}}]);