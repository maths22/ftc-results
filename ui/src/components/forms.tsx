import {ComponentProps} from "react";
import TextField from "@mui/material/TextField";
import {AnyFieldApi} from "@tanstack/react-form";

export function FormTextField({field, ...rest}: ComponentProps<typeof TextField> & {
    field: AnyFieldApi
}) {
    return <TextField
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        error={field.state.meta.isTouched && !!field.state.meta.errors}
        helperText={field.state.meta.isTouched && field.state.meta.errors}
        style={{width: '100%'}}
        {...rest}
    />
}