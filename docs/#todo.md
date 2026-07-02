# our workflow

- [] single view page, long description and notes block does not show formatted texts as input. we need to fix that

- [] in the listings page, we need to fix the rendering of short descripiton. right now, its rendering the block itself. not as formatted text in the card ui

- [] apply credential version system
	the version will start with 0 and whenever we update the credential, it will go from 0 to 1 and then another update then it will go from 1 to 2. as simple as that. update our credential model and create and update backend for this feature. and in single view page, show this version information in sidebar

- [] in single view page, when we scroll through on images gallery. on the left side, we can see a active border which is correct. but the left sidebar does not scroll through. ok, let me explain, on the left sidebar, we have small images and right side, we have big one img showing. right now, left sidebar only show 5 img and thats ok. but when we scroll to 6th image from the right side. the left sidebar does not scroll down. i want this left side images container to be interactive too based on active. is that possible?

- [] when i scroll up and down on the left sidebar images, it shows bounce animation. which is nice. but its not properly handled. so like the left sidebar shows first 5 images and when i want to scroll to 6th and which is the last item on the left sidebar, i can scroll to bottom but it then bounce back to showing first 5 images again. so, i cant really choose the 6th image from the left sidebar to view it. i am talking about only the left sidebar

- [] clicking on the arrow up and down button on the left sidebar actually does nothing. no navigation. can you fix it?

- [] our custom rte does not pick up our night mode theme. but its ok working on the light theme. fix it. found a [docs](https://reactjs-tiptap-editor.vercel.app/guide/custom-theme.html)

- [] i have applied our rte system for short description too. but then i realized the short description should not have access to full rte system. the short description should have only access to bubble menu with basic text formatting and like before shadcn and tanstack form integrated textarea component. can we do that? or it might be too complex? i just want the simple shadcn textarea form component with our basic bubble menu with basic text formatting

- [] in rte, when we select text the bg color should be our primary or accent color... (was it bluish or green color)

- [] we have a fixed width of rte, right? when the text goes beyond the rte viewport. we should be seeing a scrollbar on the right side so that we can go to the last line of our content and the top toolbar section. but currently i dont see any scrollbar. i cant go to the top of toolsbar as it is clipped out. lol

- [] when we click an toolbar item like bold or italic or underline we should auto focus on the editor. so that user can tap the effect and start typing right away. but i got a feeling, we need to granularly control it otherwise specific extension may show weird behavior or not. i am not sure, but for some specific text formatting, i need this behavior that clicking on those item would focus the editor for instant writting

- [] i am not sure how i should handle it or how standard rte handle this specific situation. i click an item on the toolbar menu and its shown clicked and then i focus on editor and start typing and i can see the formatting applied. then i press enter to go to new line. the toolbar item still shown active but when i start type i see the text in normal formatting. so, first we need to handle that active state of item (in toolbar) in new line and second, should the formatting only apply for the first line or it was supposed to be applied for multi line? right now, the toolbar item formatting apply for single line only

- [] rte, when we write inline code, beautify the whole code interface and update font and match it against our theme mode and spacious it. so that it looks like an inline code

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
