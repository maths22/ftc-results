import {useEffect} from "react";

export default function ConfirmAccount() {
  useEffect(() => {
    const values = queryString.parse(window.location.search);
    if(values['token']) {
      this.props.setToken(values);
      this.props.verifyToken();
      router.navigate({ to: '/' });
    }
  }, [])

}