import React, {useState} from 'react';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import {useForm} from "@tanstack/react-form";
import {createLazyRoute, useNavigate, useSearch} from "@tanstack/react-router";
import {useStore} from "@tanstack/react-store";
import {activateAccount, authorizationStore, changePassword, updateAccount} from "../../api";
import { FormTextField } from '../forms';

enum UpdateType {
  UPDATE_ACCOUNT,
  RESET_PASSWORD,
  ACTIVATE_ACCOUNT
}

const headings = {
  [UpdateType.RESET_PASSWORD]: 'Reset Password',
  [UpdateType.ACTIVATE_ACCOUNT]: 'Activate Account',
  [UpdateType.UPDATE_ACCOUNT]: 'Update Account'
};

// const submitFunctions = {
//   reset_password: setPassword,
//   activate_account: activateAccount,
//   update_account: updateAccount
// };


export default function UpdateAccount() {
  const navigate = useNavigate()
  const { reset_password_token, invitation_token } = useSearch({ from: "/account" })

  const [errors, setErrors] = useState<string[]>([])
  let type = UpdateType.UPDATE_ACCOUNT;
  if(reset_password_token) type = UpdateType.RESET_PASSWORD;
  if(invitation_token) type = UpdateType.ACTIVATE_ACCOUNT;

  const currentUser = useStore(authorizationStore, val => ({
    uid: val['uid'],
    name: val['name']
  }));

  const form = useForm({
    defaultValues: {
      email: currentUser.uid || '',
      name: currentUser.name || '',
      current_password: '',
      password: '',
      password_confirmation: '',
    },
    onSubmit: async ({ value }) => {
        let res: Response;
        if(type == UpdateType.RESET_PASSWORD) {
            res = await changePassword(value.password, value.password_confirmation, reset_password_token || '')
        } else if(type == UpdateType.ACTIVATE_ACCOUNT) {
            res = await activateAccount(value.name, value.password, value.password_confirmation, invitation_token || '')
        } else {
            res = await updateAccount(value.name, value.email, value.password, value.password_confirmation, value.current_password)
        }
        if(!res.ok) {
            const errors = (await res.json()).errors
            setErrors('full_messages' in errors ? errors.full_messages : errors);
        } else {
            await navigate({ to: '/'});
        }
    },
  })
  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      e.stopPropagation();
      form.handleSubmit();
    }}>
      <Grid container spacing={3} justifyContent="center">
        <Grid size={{xs: 12}}>
          <Typography variant='h5'>{ headings[type] }</Typography>
        </Grid>
        { type === UpdateType.UPDATE_ACCOUNT ? <Grid size={{xs: 12}}>
          <form.Field name="email"
                      validators={{
                        onChange: ({value}) =>
                            /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ? undefined : 'Invalid email address'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Email"}
                                         type="email"/>
                      )}/>
        </Grid> : null}
        {type !== UpdateType.RESET_PASSWORD ? <Grid size={{xs: 12}}>
          <form.Field name="name"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Name"}
                          />
                      )}/>
        </Grid> : null}
        {type === UpdateType.UPDATE_ACCOUNT ? <Grid size={{xs: 12}}>
          <form.Field name="current_password"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 || type == UpdateType.UPDATE_ACCOUNT ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Current Password"}
                                         type="password"
                          />
                      )}/>
        </Grid> : null}
        <Grid size={{xs: 12}}>
          <form.Field name="password"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 || type == UpdateType.UPDATE_ACCOUNT ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Password"}
                                         type="password"
                          />
                      )}/>
        </Grid>
        <Grid size={{xs: 12}}>
          <form.Field name="password_confirmation"
                      validators={{
                        onChange: ({value}) => value && value.length > 0 || type == UpdateType.UPDATE_ACCOUNT ? undefined : 'Required'
                      }}
                      children={(field) => (
                          <FormTextField field={field}
                                         label={"Confirm password"}
                                         type="password"
                          />
                      )}/>
        </Grid>
        {errors && <Grid size={{xs: 12}}>
          <Typography color="error">{errors.join(', ')}</Typography>
        </Grid>}
        <Grid size={{xs: 12}}>
          <form.Subscribe
              selector={(state) => [state.canSubmit]}
              children={([canSubmit]) => <Button variant="contained" type="submit" color="primary"
                                                 disabled={!canSubmit}>
                {type === UpdateType.ACTIVATE_ACCOUNT ? 'Activate' : 'Change'}
              </Button>}/>
        </Grid>
      </Grid>
    </form>
  );
};

export const Route = createLazyRoute("/account")({
    component: UpdateAccount
})
