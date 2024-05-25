import {useEffect} from "react";
import {useNavigate} from "@tanstack/react-router";

export default function ConfirmAccount() {
  const navigate = useNavigate()
  useEffect(() => {
    // TODO would be nice to make this work again
    // const values = queryString.parse(window.location.search);
    // if(values['token']) {
    //   this.props.setToken(values);
    //   this.props.verifyToken();
    // }
    navigate({ to: '/' });
  }, [])

  return <p>
      Login complete
  </p>

}