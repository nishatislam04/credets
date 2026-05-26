# our workflow


## create form more tasks --frontend

- [] 1. when click on single-label, key-value, information.
auto focus on those input.

- [] 2. add information on tags about addding comma for multiple tags

- [] 3. in `DataBlock` component, add manual types for `item`, `form`

- [] 4. add proper props for submit button. like loading and etc

- [] 5. when no data block exist, show a placeholder text

- [] 6. show server validation error in frontend form


### other

1. hide timestamp from gooey toast


ok. i want you to update credential single view data block rendering items
the whole thing should be in a single border box
then like single label and then a input with full witdth
same for key value too. they should be side by side. the key is top and then input box below
and same for value too
and then information too. information label and then huge textarea input box
make the data block bg container kinda subtle blue. input box border radius not too rounded. and same for main container too, not too much rounded. the lable keyword should be bold and uppercase and clicking on the input anywhere would copy that specific text

 then update the single view credential detail page gallery block. the gallery image each items looks so small now. just enlarge it. and i have noticed that, when i open the image item in a desktop view (clicking the gallery image item) it shown as large image. but when i am in mobile view, the image looks so small in height. that it looks ridiculas. i want you to fix that. so, when i open the gallery in mobile view, the image should be quite large so that i can properly see the image.

in the single details page, make the short description text should be semi bold, long description should be lite text and quite a bit distance between them. and stop graying the id, notes, tags, gallery label. make them abit larger and semi bold and after the above thumbnail and title block i want you to render me a full single line border in gray but boldy. so that, above and below sections are divided


i can see that, datablock has 2 rendering strategy
	{hasBlocks ? <DataBlocksRenderer blocks={blocks!} /> : <FlatObjectRenderer data={flat!} />}
remove the second logic completely. i think that was from seed, data right?
we will update seed data block object that match our final data block object. so, for now remove all the logics for the flat object rendering
our data block would look like this {type:string;value} which can be found in the create endpoint.
i hope you understand what i meant.
