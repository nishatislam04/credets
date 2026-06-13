# our workflow

- [x] we will use `unpic/react` pkg to handle our img in frontend. since we use supabase storage, utilize unpic supabase adapter to fine tune images. and also check credentials create backend endpoint, where we r processing thumbnial and images with bunjs raw api. bump up the quality of images a bit since we are using supabase storage. and see, if we need any changes on that level or not or any kind of optimization there or not. we wont use the placeholder feature now
references: https://unpic.pics/learn/, https://unpic.pics/img/react/, https://unpic.pics/providers/supabase/
read these docs and related pages and read my img processing and storing process. and create a dedicated custom Image component which we can use anywhere in frontend and render the image optimizely. so study it and create a dedicated docs of using this custom Image component api and implement this Image component all over the frontend


- [] figure out, if we can defer loading images in the loader for the single page view. so that important texts can be load first and images can load lazily. try to do it within route loader

- [x] You are an expert React developer. Generate a complete, production‑ready TagInput component using Shadcn UI (Input, Badge) and Lucide X icon. for both create and update form tags block. update old textarea component to this new custom component
Requirements:
· created Tags are displayed as badges above the input field.
· Each badge has an X button to remove it.
· Pressing Enter or Comma creates a new tag from the current input value, then clears the input.
· Prevent duplicate tags (case‑insensitive by default).
· max 15 tag item support
· Support disabled, placeholder, className and error state
· Ignore empty or whitespace‑only tags.
· Add ARIA labels for accessibility.
· Provide a brief usage lite-example.
· Include inline comments explaining key logic (keyboard, paste, duplicates).”
make changes of our backend create endpoint tags processing and db changes if need to. we will show this tags in listings and single page and populate in update form. so make sure, all cases works



- [] implement lazy loading and code-splitting
	tho vite.auto-code-split may handle many stuffs internally. but we want more control!

	first follow this approach, divide all the routes `index.tsx` file into 2 files
	critical loader and component should be inside of `index.tsx` and nothing else
	non critical component should be extracted into `index.lazy.tsx` in da same dir

	and then for more granular code-splitting, utilize React.lazy with dynamic import
	and import the lazy component inside of React.suspense block
	we can follow this, when any our ui component are too large and we want to split it and lazy load it!

	for manual ui components lazy loading, show me how you will decide which ui components to lazy load and why and whats the best approach with tanstack router best practises
