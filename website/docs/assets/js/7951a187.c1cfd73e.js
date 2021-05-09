(self.webpackChunk_3_l_1_b=self.webpackChunk_3_l_1_b||[]).push([[226],{3905:function(e,n,t){"use strict";t.d(n,{Zo:function(){return p},kt:function(){return d}});var r=t(7294);function o(e,n,t){return n in e?Object.defineProperty(e,n,{value:t,enumerable:!0,configurable:!0,writable:!0}):e[n]=t,e}function i(e,n){var t=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);n&&(r=r.filter((function(n){return Object.getOwnPropertyDescriptor(e,n).enumerable}))),t.push.apply(t,r)}return t}function u(e){for(var n=1;n<arguments.length;n++){var t=null!=arguments[n]?arguments[n]:{};n%2?i(Object(t),!0).forEach((function(n){o(e,n,t[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(t)):i(Object(t)).forEach((function(n){Object.defineProperty(e,n,Object.getOwnPropertyDescriptor(t,n))}))}return e}function c(e,n){if(null==e)return{};var t,r,o=function(e,n){if(null==e)return{};var t,r,o={},i=Object.keys(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||(o[t]=e[t]);return o}(e,n);if(Object.getOwnPropertySymbols){var i=Object.getOwnPropertySymbols(e);for(r=0;r<i.length;r++)t=i[r],n.indexOf(t)>=0||Object.prototype.propertyIsEnumerable.call(e,t)&&(o[t]=e[t])}return o}var a=r.createContext({}),l=function(e){var n=r.useContext(a),t=n;return e&&(t="function"==typeof e?e(n):u(u({},n),e)),t},p=function(e){var n=l(e.components);return r.createElement(a.Provider,{value:n},e.children)},s={inlineCode:"code",wrapper:function(e){var n=e.children;return r.createElement(r.Fragment,{},n)}},f=r.forwardRef((function(e,n){var t=e.components,o=e.mdxType,i=e.originalType,a=e.parentName,p=c(e,["components","mdxType","originalType","parentName"]),f=l(t),d=o,m=f["".concat(a,".").concat(d)]||f[d]||s[d]||i;return t?r.createElement(m,u(u({ref:n},p),{},{components:t})):r.createElement(m,u({ref:n},p))}));function d(e,n){var t=arguments,o=n&&n.mdxType;if("string"==typeof e||o){var i=t.length,u=new Array(i);u[0]=f;var c={};for(var a in n)hasOwnProperty.call(n,a)&&(c[a]=n[a]);c.originalType=e,c.mdxType="string"==typeof e?e:o,u[1]=c;for(var l=2;l<i;l++)u[l]=t[l];return r.createElement.apply(null,u)}return r.createElement.apply(null,t)}f.displayName="MDXCreateElement"},7760:function(e,n,t){"use strict";t.r(n),t.d(n,{frontMatter:function(){return u},metadata:function(){return c},toc:function(){return a},default:function(){return p}});var r=t(2122),o=t(9756),i=(t(7294),t(3905)),u={},c={unversionedId:"Functions/next",id:"Functions/next",isDocsHomePage:!1,title:"next()",description:"next(int position)",source:"@site/docs/Functions/next.md",sourceDirName:"Functions",slug:"/Functions/next",permalink:"/docs/Functions/next",editUrl:"https://github.com/hapiel/3L1B/edit/master/docusaurus/docs/Functions/next.md",version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"ledAll()",permalink:"/docs/Functions/ledAll"},next:{title:"prev()",permalink:"/docs/Functions/prev"}},a=[],l={toc:a};function p(e){var n=e.components,t=(0,o.Z)(e,["components"]);return(0,i.kt)("wrapper",(0,r.Z)({},l,t,{components:n,mdxType:"MDXLayout"}),(0,i.kt)("p",null,(0,i.kt)("inlineCode",{parentName:"p"},"next(int position)")),(0,i.kt)("p",null,"Returns ",(0,i.kt)("em",{parentName:"p"},"int")),(0,i.kt)("p",null,"This function returns the next led compared to the one given in the argument, wrapping around if the 3rd led is given. ",(0,i.kt)("inlineCode",{parentName:"p"},"next(0)")," returns 1, ",(0,i.kt)("inlineCode",{parentName:"p"},"next(1)")," returns 2, ",(0,i.kt)("inlineCode",{parentName:"p"},"next(2)")," returns 0. "),(0,i.kt)("p",null,"Example:"),(0,i.kt)("pre",null,(0,i.kt)("code",{parentName:"pre",className:"language-cpp"},"\nint currentPosition = 0;\n\nvoid loop() {\n  \n  // if the button has been pressed\n  if (tlob.buttonPressed()){\n\n    // turn the current led off\n    tlob.led(currentPosition, LOW);\n    // switch currentPosition to next led\n    currentPosition = tlob.next(currentPosition);\n    tlob.led(currentPosition, HIGH);\n  }\n  \n  // updates the button\n  tlob.update();\n}\n")))}p.isMDXComponent=!0}}]);