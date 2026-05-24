# this is guide about frontend and backend form

## structural stuffs

1. **backend endpoint** we need to expose a dedicated backend endpoint to server side to validate our frontend form.

2. **frontend usage** then we use that validation endpoint in frontend-form at
`useform.validators.onSubmitAsync`

3. **onSubmitAsync** to show server side form validation err message from `onSubmitAsync` we need to return fields like this
`return { fields: data.errors };`
otherwise our form err component wont be able to show server-side err messages.

4. **onSubmitAsync return** and lastly `onSubmitAsync` always return something at the end. even tho, that returned value wont be used anywhere. i dont know why. but do it

5. **CSRF management** we manually handle the **CSRF** security by ourselve. like the generation, insertion, validation, handle expiration... everything

6. **frontend form management** most of the time, we will have files and complex stuffs in our form body. so we will always `FormData` it.

## frontend form structure

below are a simple form component. which are composed of shadcn and tanstack-form. and this full reference can be found here ### shadcn-tanstack-form-link

```tsx
<form.Field
	name="title"
	children={(field) => {
		const isInvalid = !field.state.meta.isValid;
		return (
			<Field data-invalid={isInvalid}>
				<FieldLabel htmlFor="title"> Title 
					<span className="text-destructive -ml-2">*</span>
				</FieldLabel>
				<Input
					id="title"
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={(e) => field.handleChange(e.target.value)}
					placeholder="Enter credential title"
					aria-invalid={isInvalid}
				/>
				{isInvalid && <FieldError errors={field.state.meta.errors} />}
			</Field>
		);
	}}
/>
```

## well, if you want to understand both frontend and backend for the whole form porcessing. just visit the create-credentials section. ok? everything works there. good luck
