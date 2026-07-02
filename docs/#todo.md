# our workflow

## rte

- [] in rte, when we select text the bg color (selected text) should be sky color which we choose on shadcn-create page. and this sky color is used on create, submit btn. so i want to make sure, our rte also sync with this color, if this theme color change near futture

- [] rte, when we write inline code, beautify the whole code interface and update font and match it against our theme mode and spacious it. so that it looks like an inline code. in our rte content area i meant

- [] rte, for codeblock, we need some major re-working for codeblock block
	1. first fix this fundamental issue. i initialize codeblock by this ```js and wrote console.log(hello) and then move this line to 2nd line went to 1st line and tried to write some code in 1st line. but after a char was written or any operation was done in first line... my cursor auto jump to 2nd line at the end and my new characters are written there. this seems way confusing to me... why its happening. update: its happening for simple plain text also. not just inside of codeblock. what kind of issue is this? how can we solve it?
	2. if you check the rte, you will see that, i have tried to set up lowlight and stuffs for highlight syntax feature from this docs [tiptap-codeblock-docs](https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight) i am not sure, if my configuration was correct. but with above ```js i dont see any syntax highlighting. can you fix this issue for me?
	3. just like notion, i want to have language dropdown support on this codeblock on the right side. so, when we initialize a codeblock from the tools, it will auto select plaintext unless we manually choose a supported language from the dropdown. and when user initialize codeblock with ```js or ```css we will auto show this language on the dropdown label like which language syntax will be applied. and user might choose an unknown or unsupported language too. so handle that scenario too

- [] rte, text-color [tiptap-text-color-guide](https://reactjs-tiptap-editor.vercel.app/extensions/Color/) i want to see this text coloring feature in both bubble menu and toolbar. we will show some presets of colors to be choosen only. cover most used and essential colors. just like notion with dropdown menu for color applying

- [] implement a very basic and simple input validation on link field. so that they cant just provide anything garbadge and make it looks like an valid url.

- [] implement emoji system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Emoji/)

- [] implement custom font system [docs](https://tiptap.dev/docs/editor/extensions/functionality/fontfamily) cover most common fonts and essential fonts. and show the dropdown in both toolbar and in bubble menu. so that we can implement a hell lots of different kinds of fonts

- [] implement highlight coloring system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Highlight/) read necessary docs to implement this system. cover most common and essential coloring presets in dropdown in both toolbar and bubble menu

- [] i want this line height extensions too in dropdown on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/LineHeight/)

- [] text-align extention needed with dropdown menu on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/TextAlign/)

- [] add this indent extention too [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Indent/)

- [] image extension [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Image/) i want this img extension implemented and working on my rte. based on our stacks and setup, how we should handle it? since this is ultimately a form submission and we will be storing images in s3 object. and we may want to show img in long description but we dont want to show img in notes block.. so, we need to handle it. and we also need to view this img whenever we try to read data
