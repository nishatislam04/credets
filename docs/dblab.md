# this is dblab usage guide

1. navigate to project root dir. where dblab.yaml exist

2. launch dblab 

```bash
dblab --config
```

this `--config` will load the database configuration from our root dir

## shortcuts for panels (focus between panels)

1. focus on the tables side (left-panel) -> `ctrl+h`
2. focus on the query editor (top-panel) -> `ctrl+l`
3. focus on the data-table (bottom-panel) -> `ctrl+j`

### notes about focus between panels

its not that simple. sometimes you will notice that,
you can navigate from (bottom-panel) to (left-side) by `ctrl+h`.
then when you are in focus of left side,
you may think we can focus back to (bottom-panel) by `ctrl+j`.

but it does not works. we have to `ctrl+l` to focus on top panel
(we were left panel before) then `ctrl+j` to focus on bottom panel.

> note: this is just a simple scenario. and these key are not quite accurate.
but if we keep pressing these following buttons,
we can go wherever we want in these 3 panels.
`ctrl+h`  `ctrl+j`  `ctrl+k`  `ctrl+l`

### simple navigation

after selecting a panel like (left-panel) or (bottom-panel)
we can press `j` to go `BOTTOM` or `k` to go `UP`


### navigate on result panel (bottom-panel)

in the bottom panel, we can see that, there are 4 tabs.
now we will navigate between these panels

first focus on the bottom panel by `ctrl+j` (or check above)
after bottom-panel is foucsed, press `tab` to go to next tab
and then `shift+tab` to go reverse in tab
