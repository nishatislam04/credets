1. fix all the rumdl Markdown linting inside of docs/*.md. if you did any major changes,
   descructive changes or change contents. you let me know

2. we will completely remove the gooeytoast and its relative setup.
   and use baseui toast (recommend by shadcn/ui) to completely replace goeytoast with baseui toast
   toast should appear at top-right. it should have icon+text and below description, if needed
   the icon shouold be colorful and not the text. ex: success-green tick. err: red warn icon
   we will support showing multiple toast
   also add offset props. so, if needed, i will update it later
   this toast should be sync with our theme state
   - [shadcn guide](https://ui.shadcn.com/docs/components/base/toast)
   - [baseui toast docs](https://base-ui.com/react/components/toast)

3. i want you to scan my whole repo. the root, the backend, the frontend
   and based on best practises, security practises, good coding practises, single responsibilty, tanstack
   router, tanstack form, shadcn/ui (baseui), bunjs, reactJS latest docs referencing and any other refactor,
   optimization, re-write and similar cases. write it out in single docs page. one docs for root dir
   coding and pkg and other stuffs, another docs for backend and another one for frontend side.
   since, we are publishing this app, and this is a credentials based web app and i want to learn
   best practises based on respective docs guide for learning purpose and for security purpose and
   for high speed web app and mobile responsiveness and following render best practises. since thats
   where we are publishing our monorepo app.
   in the docs, address all the concepts i issued earlier and add more concepts, concern, best practise
   and etc and lastly what good practises i am already following and implemented. so that i have a
   very good idea about this whole app architecture and coding part and pkg managements etc
