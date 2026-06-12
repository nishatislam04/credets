# type redesign

## goal

we will redesign our credential-types system.
right now we have simple single shadcn select component for a single lvl of types.
but we want to have multiple lvl of types.

## backend overview

in the backend types model, we will have a parent_id column.
when it is null, meaning it is root. when there is a reference, meaning current type is child of that referenced types.
and we cant delete any types from any level. as it will break our hierarchy level.
we can only update types label.. but we wont handle it in this phase. later, when we implemente a types manangement system.
right now, we are only creating and select types only and no delete operation

## frontend overview

in frontend, we will use shadcn combobox component for our types system, instead of plain select component.
so, here it is how it will work:

### root level ui dataflow

in initial page load, we will fetch all the existing root types from db in route loader. so that we can render all the root types instantly when the page load inside of our first combobox instance (we will auto generate our first instance of combobox). now, we can either choose any existing types from the listings or type any string on the text input box from the combobox component and when we confirm it, this new string will be considered a new types for the 1st lvl. and hence our root type (1st lvl) have been successfully managed

and now beside the first combobox input, we will have a plus icon. clicking on it, will have several incidents going on

### second and more combobox dataflow

first, generate a new combobox instance again.
second, we will have a dedicated actions. from there we will hit our backend for new types. here's how to query: based on the 1st lvl type (previous type) we will ask backend, if any types is available under this 1st type and then we will render those new types, if have any. then we either choose one from the listings or create a new 2nd lvl types by typing it out
then similarly for 3rd types, we first hit the plus btn and it will generate us a combobox again. and it will ask the backend, if any types exist in db when our parent is our previous type (2nd lvl) and if found any, we generate it otherwise we create one

here carefully observe, we are dynamically fetching types based on our previous type.
when we are in 4th type. we ask backend, if there are any child exist in 3rd level or any types belong to 3rd types

now, do you think we can implement this feature? is it doable? how much db models need to be changed based on this? this children types lookup in db seems complex and expensive to me in postgres database. try to implement this feature

### goal high level overview

i just want to make sure, we can create new types from credential page, if the types does not exist already. so that, we dont need to go types page and create a new one and come back to credential page to create the credential. now, the way i think we can do this by using shadcn combobox. we either select existing item from the listings or type the new listings and somehow confirm it and this new text in text input will act as our new types.
now i think we probably need to modify shadcn combobox component for this behaviour. because, i dont think, we can achive our goal from shadcn combobox out of the box. we also need to check how can we confirm changes in the text input from the combobox for creating a new type.

### fetching sub types

we will use tanstack query to lazily load sub tree with a loading spinner. only when the plus button was pressed.

### sub tree creation

when we type out a new type in the combobox input. we wont create the type in the db immidiately. rather, when the whole form is submitted. so, the lookup case. we need current value to look up in the child, right? take it directly from the form. finally, the types wont be created instantly. but only after the final submission for the credential creation

### shadcn combobox component

1. we probably need this option [custom items](https://ui.shadcn.com/docs/components/base/combobox#custom-items)
2. we also need this [clear feature](https://ui.shadcn.com/docs/components/base/combobox#clear-button)
3. and maybe this. so, that we can show some hinting icon for [structuring](https://ui.shadcn.com/docs/components/base/combobox#input-group)

## some edge cases needed to be handled

### edge case needed to be handle in both frontend and backend

now, lets say, user have already created 4 types in hierarchy way. now he decided to update or delete 2nd or any types in above the tree. we need handle both backend and frontend for that too

## change types at any level case

Changing a parent resets all deeper levels. Because the children combobox is always populated by the currently selected parent.
example - If you originally had “Social Media → Facebook → Dad” and you change the first level to “Game Loadouts”, the old sub‑chain “Facebook → Dad” no longer makes sense under “Game Loadouts”. The UI should clear level 2 and beyond, and the user rebuilds from there. i think there are more edge cases for this case, but for simplicity, whenever any types is changed, we will reset its child types and it can occur at any level.

## rename types

so lets say user already built their 5 level of types. but not created the credential yet. so, at once, they have decided to rename a types at any level. just rename type. so, if that targetted rename type is new (do not exist on db yet) they can rename it and doing this wont break the hierarchy (i.e resetting the child nodes) but if they try rename any existing types that exist already on db. we cant let them rename it in current phase. we will let them rename it, if it does not exist in db already. but we wont let them rename it, if it already exist in db. we will have a system later, when they can rename existing type

## delete types

we wont let user delete any types anyhow
in db, we wont let any types being deleted anyhow. even if they're referenced or not. if any referenced type is being tried to be deleted, we will simply restrict the operation and generate a helpful message specifying this delete operation is not permitted
when user press x button on the combobox to clear out current types item. if it is leap item (meaning last item) we will let them remove it (not delete) but if they try to remove any parents type, that have child types already. we will show an shadcn alert dialog saying, removing this item will remove this item and all the items afterward

### duplicate case

when user try to create a new type, that already exist on the parent. we wont let them create this new type. as duplicate type under a parent does not make sense
