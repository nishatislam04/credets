# our workflow

## rte

- [] rte, text-color [tiptap-text-color-guide](https://reactjs-tiptap-editor.vercel.app/extensions/Color/) i want to see this text coloring feature in both bubble menu and toolbar. we will show some presets of colors to be choosen only. add most used and essential colors. just like notion with dropdown menu for color applying

- [] implement a very basic and simple raw input validation on link field. so that they cant just provide anything garbadge and make it looks like an valid url.

- [] implement emoji system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Emoji/). [raw emoji reference in case if needed](https://github.com/hunghg255/reactjs-tiptap-editor-demo/blob/master/src/components/Editor/emojis.ts)



- [] implement custom font system [docs](https://tiptap.dev/docs/editor/extensions/functionality/fontfamily) cover most common fonts and essential fonts. and show the dropdown to choose font-family in both toolbar and in bubble menu. so that we can implement a hell lots of different kinds of fonts in our rte content

- [] implement highlight coloring system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Highlight/) read necessary docs to implement this system. cover most common and essential coloring presets in dropdown in both toolbar and bubble menu

- [] i want this line height extensions too in dropdown menu on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/LineHeight/)

- [] text-align extention needed with dropdown menu on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/TextAlign/)

- [] add this indent extention too [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Indent/)


---

we are currently using a wrapper not the base tiptap, right? and its causing several issues like when we tried to control many nitty gitty stuffs. as you saw above. so, i wanted to fix this issue by complete re-wrtite with base tiptap instead of this wrappper. so we can have more control over our node, style, design, behavior etc.
so i want you to carefully investigate and navigate full rte system. see which extensions we are using. where they exist. create a detail docs about this in docs/
cover both toolbar and bubble menu items and their structure and stuffs. so then it will look like we are porting the rte from wrapper to base tiptap
so that later, i can feed it to ai. and it will read it and implement this full rte system with our old extensions list but on tiptap.
also create a optional docs section for each extension which might be needed only when tiptap implementation fail and then we can look into our old existing working rte system and compare with tiptap docs and implement working extensions, only if initial implementation fail
