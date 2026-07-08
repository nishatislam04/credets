# our workflow

## rte

- [] in rte, when we select text the bg color (selected text) should be sky color, which we choose on shadcn-create page. and this sky color is used on create, submit btn. so i want to make sure, our rte also sync with this color, if this theme color change near future. this bg selected color should survive with mode changes too. our rte is: tiptap and we are using this [library](https://reactjs-tiptap-editor.vercel.app/)

- [] rte, when we write inline code, beautify the whole code interface and update font and match it against our theme mode and spacious it. so that it looks like an inline code. in both mode, bg should be subtle of our main theme like sky color currently. but it should be sync with shadcn color, so upadating that shadcn theme configuration would update this subtle color too in rte too. make sure inline code look like inline code (above) in dark mode too

- [] fix one of the fundamental rte issue. its quite hard to express the issue with prompt. if we keep adding new line in next line, then this issue does not appear. but this cursor jumping to last new line whenever i try to add, update or modify any previous line. this is very weird editing behavior. no idea why this happening and how to solve this. but we need to solve this anyhow. because our fundamental rte is not working on basic mode. lol. so for more detail example
	>first
	>second[cursor is here. and i try to write anything on this line. my cursor goes to 4th line]
	>third
	>forth

- [] rte, for codeblock, we need some major re-working for codeblock block
	1. if you check the rte, you will see that, i have tried to set up lowlight and stuffs for highlight syntax feature from this docs [tiptap-codeblock-docs](https://tiptap.dev/docs/editor/extensions/nodes/code-block-lowlight) i am not sure, if my configuration was correct. but with above ```js i dont see any syntax highlighting. can you fix this issue for me?
	2. just like notion, i want to have language dropdown support on this codeblock on the right side. and handle ui flicker for dropdown part too. so, when we initialize a codeblock from the tool bar, it will auto select plaintext unless we manually choose a supported language from the dropdown. and when user initialize codeblock with ```js or ```css we will auto show this language on the dropdown label like which language syntax will be applied. and user might choose an unknown or unsupported language too. so handle that scenario too. make sure, selected language is also highlighted, so that we can see and know which language was selected

- [] rte, text-color [tiptap-text-color-guide](https://reactjs-tiptap-editor.vercel.app/extensions/Color/) i want to see this text coloring feature in both bubble menu and toolbar. we will show some presets of colors to be choosen only. cover most used and essential colors. just like notion with dropdown menu for color applying

- [] implement a very basic and simple input validation on link field. so that they cant just provide anything garbadge and make it looks like an valid url.

- [] implement emoji system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Emoji/)

- [] implement custom font system [docs](https://tiptap.dev/docs/editor/extensions/functionality/fontfamily) cover most common fonts and essential fonts. and show the dropdown in both toolbar and in bubble menu. so that we can implement a hell lots of different kinds of fonts

- [] implement highlight coloring system [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Highlight/) read necessary docs to implement this system. cover most common and essential coloring presets in dropdown in both toolbar and bubble menu

- [] i want this line height extensions too in dropdown on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/LineHeight/)

- [] text-align extention needed with dropdown menu on toolbar menu [docs](https://reactjs-tiptap-editor.vercel.app/extensions/TextAlign/)

- [] add this indent extention too [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Indent/)

- [] image extension [docs](https://reactjs-tiptap-editor.vercel.app/extensions/Image/) i want this img extension implemented and working on my rte. based on our stacks and setup, how we should handle it? since this is ultimately a form submission and we will be storing images in s3 object. and we may want to show img in long description but we dont want to show img in notes block.. so, we need to handle it. and we also need to view this img whenever we try to read data
