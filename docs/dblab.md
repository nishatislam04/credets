# This Is Dblab Usage Guide

dblab is terminal user interface(TUI) application for viewing our database.

## Install Dblab

use ai to install. it was quite complex to install.
we had to download the `*.tar.gz` file from releases archive and
then move it here and there to make it working.
and i dont remember how i did it.
nor i want to post the installation guide here.

1. goto root dir

2. launch dblab:

```bash
dblab --config
```

this `--config` will load the database configuration from our root dir

## Shortcuts for Panels (Focus Between Panels)

navigating between panels is quite cumbersome. so read the guide below carefully.

1. focus on the db-models side (left-panel) -> `ctrl+h`
2. focus on the query editor (top-panel) -> `ctrl+l`
3. focus on the data-table (bottom-panel) -> `ctrl+j`

### Notes About Focus Between Panels

its not that simple. sometimes you will notice that,
you can navigate from (bottom-panel) to (left-side) by `ctrl+h`.
then when you are left side focus,
you may think we can focus back to (bottom-panel) by `ctrl+j`.

but it does not works. we have to `ctrl+l` to focus on top panel
(we were left panel before) then `ctrl+j` to focus on bottom panel.

> note: this is just a simple scenario. and these shortcut are not quite accurate.
but if we keep pressing these following buttons, we can go wherever we want in these 3 panels.
`ctrl+h` `ctrl+j` `ctrl+k` `ctrl+l`

### Simple Navigation

after selecting a panel like (left-panel) or (bottom-panel)
we can press `j` to go `BOTTOM-SIDE` or `k` to go `UP-SIDE`

### Navigate on Result Panel (Bottom-Panel)

in the bottom panel, we can see that, there are 4 tabs.
`Data`, `Columns`,`Indexes`, `Constraints`
now we will navigate between these panels

first focus on the bottom panel by `ctrl+j` (or check above guide)
after bottom-panel is foucsed, press `tab` to go to next tab
and then `shift+tab` to go reverse in tab

### Write Query in the Editor

after selecting the top panel, where query editor exist.
to write query, press `i` and start typing query command
and hit `ctrl+e` to execute the query
