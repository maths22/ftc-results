import {ComponentProps, useState} from 'react';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {FieldApi, useForm} from "@tanstack/react-form";


function FormTextField({field, ...rest}: ComponentProps<typeof TextField> & {
  field: FieldApi<any, any, any, any, any>
}) {
  return <TextField
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      error={!!field.state.meta.touchedErrors}
      helperText={field.state.meta.touchedErrors}
      style={{width: '100%'}}
      {...rest}
  />
}

export default function ScoringServerPicker({disabled, setLocalServer} : {
  disabled: boolean,
  setLocalServer: (server: { hostname: string, port: number }) => void
}) {
  const [errors, setErrors] = useState<string[]>([])
  const form = useForm({
    defaultValues: {
      hostname: 'localhost',
      port: 80,
    },
    onSubmit: async ({ value }) => {
      setLocalServer(value)
    },
  })

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }} style={{width: '50em'}}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={4}>
          <form.Field name="hostname"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Hostname"}
                                         disabled={disabled}
                          />
                      )}/>
        </Grid>
        <Grid item xs={2}>
          <form.Field name="port"
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Port"}
                                         type={"number"}
                          />
                      )}/>
        </Grid>
        <Grid item xs={6}>
          <form.Subscribe
              selector={(state) => [state.canSubmit]}
              children={([canSubmit]) => <Button variant="contained" type="submit" color="primary" disabled={!canSubmit}>
                Update
              </Button>} />
        </Grid>
        {errors && <Grid item xs={12}>
          <Typography color="error">{errors.join(', ')}</Typography>
        </Grid>}
      </Grid>
    </form>
  );
}
