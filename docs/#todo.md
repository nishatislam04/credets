# our workflow

- [] 2. update submit btn locked strategy in update form page... like we update non required field and did not modify or touch any important required field...then the submit btn is locked. fix this tanstack form issue. to unlock i need to change a bit of any important field. which is very weird

- [] when we update thumbnial img it shows success. then we go to single view page from the success toast. but we see old thumbnial img. then when i refresh the page, i see new thumbnial img

- [] use shadcn empty component to render empty state of credentials listings. install the empty component

- [] update db credentials tags datatype to string. not json. we may accept tags data as json from frontend. but when saving in db, we will stringify the json. and when dto, we need handle the case of null. like if tags data exist then parse it otherwise empty arr

- [] in listings, when we recive malformed params. we return with 400 and clear msg and show it in frontend. basically cursor validation

- [] in the single page, when we have images, when we click on the thumbnial img on the title, the slideshow open and we can see all the images. but that was not how it was supposed to work. first of clicking on the thumbnial would preview the thumbnial only, not the images. then when we click on images, the slideshow open as expected 

 - [] make the credential delete dialog more destructive looking with coloring, icons and with other factors. so that, it looks like we are deleting something important haha

- [] 1. when click on single-label, key-value, information.
auto focus on the first input. for single label, focus on the first input. for key-value, focus on the key input. for information input, focus on the textarea input. when page render, we generate a defualt first single input field. forget about focusing that one. only focus input fields, when we click the button to generate the input field

- [] make all listings, single page view, create form page, edit form page with shadcn-scroll area component. i did not install the component yet
