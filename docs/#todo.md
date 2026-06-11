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

- [] when we submit create, update form with values, if any client or server side validation err actually occurs. then below the form inputs but above the submit btn, we should show a hintings that, a validation err occur and it needs to be fixing. so, judging the useform hooks from tanstack, i belive, before hitting up server side async validation, it first validate the form in the client. and then hit the server side validation, if no err occur. if that was the case, then for both err phase validation, if any validation err occur, i want you to generate the hinting like above i mentioned earlier. because i have noticed that, most of the time, when i hit submit and no success toast shown. but nothing else was happening either. so, then i scroll up and see there were a form validation err already triggered. because of that, i need you to generate me nice reactive (when err fixed, it should gone. now will it works simply? or implementing this will be hard? if it broke my existing form functionality, then ignore this below hintings) message.

- [] when we submit a form for create, update. and if it success, the submit btn should be locked untill any form value changes again. implement this feat for both form

- [] in single view page, for description, i see multiple line blend into a single line in the ui. so, i create multi line in the create form textarea input with newline (pressing enter) and when i check the single page long description section, i see the lines are kinda merged together.it did not follow the style of formatting we had in create form. first, fix this. now in this simple text area, we may try to design our long description block. like multiple spaces between each line. any visual indentation in the create form. i also want to see them exactly like that in single view page. by the way, same apply for short description. but surprisingly, notes ui block render as multiline, if the input was mulitiline. handle it both in single view page and listings card too

- [] i tried to update tags block and i got this err. i dont think, this backend err happend because of tags block. i mean it might happen for other block too. please fix it thoroghly. and tell me why it occured

```bash
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOG   repo: db update transaction failed

  763 |             for (let j = 0;j < sub_values.length; j++)
  764 |               binding_values.push(sub_values[j]);
  765 |             binding_idx += sub_values.length;
  766 |           } else if (value instanceof SQLHelper) {
  767 |             let command = detectCommand(query);
  768 |               throw SyntaxError("Helpers are only allowed for INSERT, UPDATE and IN commands");
                                       ^
  SyntaxError: Helpers are only allowed for INSERT, UPDATE and IN commands
        at normalizeQuery (internal:sql/postgres:768:32)
        at #getQueryHandle (internal:sql/query:30:58)
        at #runAsync (internal:sql/query:75:38)
        at #runAsyncAndCatch (internal:sql/query:150:36)
        at then (internal:sql/query:155:27)
  

  📍 apps/backend/repository/credentials/update.ts:112
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOG   service: error in updateCredentialService

  113 | 
  114 | 		if (error instanceof AppError) {
  115 | 			throw error;
  116 | 		}
  117 | 
  118 | 		throw new DatabaseError(error);
                ^
  DatabaseError: A database error occurred
       status: 500,
         type: "database-error",
       pgCode: undefined,
     pgDetail: undefined,
      pgTable: undefined,
   pgConstraint: undefined,
  
        at updateCredentialRepo (/home/nishat/credets/apps/backend/repository/credentials/update.ts:118:9)
        at async updateCredentialService (/home/nishat/credets/apps/backend/services/credentials/update.ts:120:9)
        at async credentialUpdate (/home/nishat/credets/apps/backend/http/credentials/update.ts:47:9)
  

  📍 apps/backend/services/credentials/update.ts:150
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   LOG   http: error in credentialUpdate controller

  113 | 
  114 | 		if (error instanceof AppError) {
  115 | 			throw error;
  116 | 		}
  117 | 
  118 | 		throw new DatabaseError(error);
                ^
  DatabaseError: A database error occurred
       status: 500,
         type: "database-error",
       pgCode: undefined,
     pgDetail: undefined,
      pgTable: undefined,
   pgConstraint: undefined,
  
        at updateCredentialRepo (/home/nishat/credets/apps/backend/repository/credentials/update.ts:118:9)
        at async updateCredentialService (/home/nishat/credets/apps/backend/services/credentials/update.ts:120:9)
        at async credentialUpdate (/home/nishat/credets/apps/backend/http/credentials/update.ts:47:9)
  

  📍 apps/backend/http/credentials/update.ts:72
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

- [] think about a img optimizing in tanstack router like we had in nextjs out of the box

- [] make single view page, short description and long description more stand out between them. like short description has more priority than long description and even tho they have quite a space between them but there are not actually much distance between them.. when we look at it. design my whole short description and long description fully based on its surrounding attributes. if needed, install and use external fonts. i just to make this 2 description block looks good. handle short description line breaking, i m not talking abt trimming it. the line space
