(self.webpackChunk_3_l_1_b=self.webpackChunk_3_l_1_b||[]).push([[878],{3905:function(e,t,n){"use strict";n.d(t,{Zo:function(){return l},kt:function(){return f}});var r=n(7294);function o(e,t,n){return t in e?Object.defineProperty(e,t,{value:n,enumerable:!0,configurable:!0,writable:!0}):e[t]=n,e}function a(e,t){var n=Object.keys(e);if(Object.getOwnPropertySymbols){var r=Object.getOwnPropertySymbols(e);t&&(r=r.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),n.push.apply(n,r)}return n}function u(e){for(var t=1;t<arguments.length;t++){var n=null!=arguments[t]?arguments[t]:{};t%2?a(Object(n),!0).forEach((function(t){o(e,t,n[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(n)):a(Object(n)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(n,t))}))}return e}function i(e,t){if(null==e)return{};var n,r,o=function(e,t){if(null==e)return{};var n,r,o={},a=Object.keys(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||(o[n]=e[n]);return o}(e,t);if(Object.getOwnPropertySymbols){var a=Object.getOwnPropertySymbols(e);for(r=0;r<a.length;r++)n=a[r],t.indexOf(n)>=0||Object.prototype.propertyIsEnumerable.call(e,n)&&(o[n]=e[n])}return o}var c=r.createContext({}),p=function(e){var t=r.useContext(c),n=t;return e&&(n="function"==typeof e?e(t):u(u({},t),e)),n},l=function(e){var t=p(e.components);return r.createElement(c.Provider,{value:t},e.children)},s={inlineCode:"code",wrapper:function(e){var t=e.children;return r.createElement(r.Fragment,{},t)}},d=r.forwardRef((function(e,t){var n=e.components,o=e.mdxType,a=e.originalType,c=e.parentName,l=i(e,["components","mdxType","originalType","parentName"]),d=p(n),f=o,m=d["".concat(c,".").concat(f)]||d[f]||s[f]||a;return n?r.createElement(m,u(u({ref:t},l),{},{components:n})):r.createElement(m,u({ref:t},l))}));function f(e,t){var n=arguments,o=t&&t.mdxType;if("string"==typeof e||o){var a=n.length,u=new Array(a);u[0]=d;var i={};for(var c in t)hasOwnProperty.call(t,c)&&(i[c]=t[c]);i.originalType=e,i.mdxType="string"==typeof e?e:o,u[1]=i;for(var p=2;p<a;p++)u[p]=n[p];return r.createElement.apply(null,u)}return r.createElement.apply(null,n)}d.displayName="MDXCreateElement"},2169:function(e,t,n){"use strict";n.r(t),n.d(t,{frontMatter:function(){return u},metadata:function(){return i},toc:function(){return c},default:function(){return l}});var r=n(2122),o=n(9756),a=(n(7294),n(3905)),u={},i={unversionedId:"Functions/updateButton",id:"Functions/updateButton",isDocsHomePage:!1,title:"updateButton()",description:"updateButton",source:"@site/docs/Functions/updateButton.md",sourceDirName:"Functions",slug:"/Functions/updateButton",permalink:"/3L1B/docs/Functions/updateButton",editUrl:"https://github.com/hapiel/3L1B/edit/master/docusaurus/docs/Functions/updateButton.md",version:"current",frontMatter:{},sidebar:"tutorialSidebar",previous:{title:"update()",permalink:"/3L1B/docs/Functions/update"},next:{title:"updateLeds()",permalink:"/3L1B/docs/Functions/updateLeds"}},c=[],p={toc:c};function l(e){var t=e.components,n=(0,o.Z)(e,["components"]);return(0,a.kt)("wrapper",(0,r.Z)({},p,n,{components:t,mdxType:"MDXLayout"}),(0,a.kt)("p",null,(0,a.kt)("inlineCode",{parentName:"p"},"updateButton")),(0,a.kt)("p",null,"This function will update the button related variables: ",(0,a.kt)("a",{parentName:"p",href:"buttonPressed"},"buttonPressed"),", ",(0,a.kt)("a",{parentName:"p",href:"buttonDown"},"buttonDown"),", ",(0,a.kt)("a",{parentName:"p",href:"buttonReleased"},"buttonReleased")," and ",(0,a.kt)("a",{parentName:"p",href:"buttonHold"},"buttonHold"),"."),(0,a.kt)("p",null,"It is recommendable to call this function once every loop, otherwise these variables may not work as expected."),(0,a.kt)("p",null,"This function is called automatically if you use ",(0,a.kt)("a",{parentName:"p",href:"update"},"update()"),"."))}l.isMDXComponent=!0}}]);